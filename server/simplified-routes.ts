import express, { Express, Request, Response, NextFunction } from "express";
import { Server } from "http";
import http from "http";
import { storage } from "./storage";
import { setupVite, log } from "./vite";
import { setupAuth } from "./auth";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import csurf from "csurf";
import cookieParser from "cookie-parser";

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware
  app.use(cookieParser());
  
  // Rate limiting
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per windowMs
    message: { error: "Too many login attempts, please try again later." }
  });

  // CSRF protection
  const csrfProtection = csurf({ cookie: true });
  
  // Auth setup
  setupAuth(app);
  
  // Spending advisor endpoint
  app.post("/api/spending-advisor", csrfProtection, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const schema = z.object({
        amount: z.string().min(1),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      
      const { amount } = result.data;
      
      // Get user data
      const user = await storage.getUser(req.user.id);
      const bills = await storage.getBillsByUserId(req.user.id);
      
      // Convert strings to numbers
      const amountNum = parseFloat(amount);
      const balanceNum = user?.account_balance || 0;
      
      // Calculate if the user can spend this amount
      if (amountNum > balanceNum) {
        return res.json({
          canSpend: false,
          message: `Sorry, you cannot spend $${amountNum.toFixed(2)} as it would exceed your current account balance of $${balanceNum.toFixed(2)}.`
        });
      }
      
      // Check upcoming bills
      const newBalance = balanceNum - amountNum;
      let message = `Yes, you can spend $${amountNum.toFixed(2)}. Your balance after this purchase will be $${newBalance.toFixed(2)}.`;
      
      // Sort bills by due date
      const sortedBills = [...bills].sort((a, b) => a.due_date - b.due_date);
      
      // Get total upcoming bills
      const upcomingBillsTotal = sortedBills.reduce((total, bill) => {
        return total + parseFloat(bill.amount);
      }, 0);
      
      // If there are upcoming bills, provide more detailed advice
      if (sortedBills.length > 0) {
        const nextBill = sortedBills[0];
        const nextBillAmount = parseFloat(nextBill.amount);
        
        // Calculate days until next bill
        const today = new Date();
        const dueDate = new Date(today.getFullYear(), today.getMonth(), nextBill.due_date);
        
        // Handle case when the bill is due next month
        if (dueDate.getDate() < today.getDate()) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }
        
        const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if remaining balance will cover at least half of upcoming bills
        if (newBalance < upcomingBillsTotal * 0.5) {
          message = `You can spend $${amountNum.toFixed(2)}, but be careful. Your balance after this purchase will be $${newBalance.toFixed(2)}, and you have $${upcomingBillsTotal.toFixed(2)} in upcoming bills which would leave you with $${(newBalance - upcomingBillsTotal).toFixed(2)}.`;
        } else {
          message = `Yes, you can spend $${amountNum.toFixed(2)}. Your balance after this purchase will be $${newBalance.toFixed(2)}. Your next bill ${nextBill.name} ($${nextBillAmount.toFixed(2)}) is due in ${daysUntilDue} days, which will leave you with $${(newBalance - nextBillAmount).toFixed(2)}.`;
        }
      }
      
      return res.json({
        canSpend: true,
        message
      });
    } catch (error) {
      log(`Error in spending advisor: ${error}`, "routes");
      return res.status(500).json({ error: "Error processing spending request" });
    }
  });

  // Financial advisor endpoint for free-form questions
  app.post("/api/financial-advisor", csrfProtection, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const schema = z.object({
        query: z.string().min(1)
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      
      const { query } = result.data;
      
      // Get user data
      const user = await storage.getUser(req.user.id);
      const bills = await storage.getBillsByUserId(req.user.id);
      const income = await storage.getIncomeByUserId(req.user.id);
      
      // Simple query processing
      let message = "";
      const lowerQuery = query.toLowerCase();
      const balance = user?.account_balance || 0;
      
      if (lowerQuery.includes("balance") || lowerQuery.includes("how much money")) {
        message = `Your current account balance is $${balance}. You have ${bills.length} bills registered.`;
      } 
      else if (lowerQuery.includes("bill") || lowerQuery.includes("payments") || lowerQuery.includes("expenses")) {
        if (bills.length === 0) {
          message = "You don't have any bills registered yet.";
        } else {
          const totalBills = bills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
          message = `You have ${bills.length} bills totaling $${totalBills.toFixed(2)}. `;
          
          // Include information about the next due bill
          const today = new Date();
          const currentDay = today.getDate();
          const sortedBills = [...bills].sort((a, b) => a.due_date - b.due_date);
          let nextBill = null;
          let daysUntil = Infinity;
          
          for (const bill of sortedBills) {
            let dayDiff = bill.due_date - currentDay;
            if (dayDiff < 0) dayDiff += 30; // Due next month
            
            if (dayDiff < daysUntil) {
              daysUntil = dayDiff;
              nextBill = bill;
            }
          }
          
          if (nextBill) {
            message += `Your next bill is ${nextBill.name} for $${parseFloat(nextBill.amount).toFixed(2)}, due in ${daysUntil} days.`;
          }
        }
      }
      else if (lowerQuery.includes("income") || lowerQuery.includes("earn") || lowerQuery.includes("salary")) {
        if (income.length === 0) {
          message = "You don't have any income sources registered yet.";
        } else {
          const totalIncome = income.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
          message = `You have ${income.length} income sources totaling $${totalIncome.toFixed(2)}.`;
        }
      }
      else if (lowerQuery.includes("save") || lowerQuery.includes("saving")) {
        const totalBills = bills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
        const totalIncome = income.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
        const surplus = totalIncome - totalBills;
        
        if (surplus > 0) {
          message = `Based on your current income and expenses, you could save around $${surplus.toFixed(2)} per month.`;
        } else {
          message = `Your current expenses exceed your income by $${Math.abs(surplus).toFixed(2)}. Consider reducing expenses to create savings capacity.`;
        }
      }
      else if (lowerQuery.includes("spend") || lowerQuery.includes("afford") || lowerQuery.includes("buy")) {
        // Try to extract an amount
        const amountMatch = lowerQuery.match(/\$?(\d+(\.\d+)?)/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
        
        if (amount) {
          if (amount > balance) {
            message = `You can't afford to spend $${amount.toFixed(2)} right now as it exceeds your account balance of $${balance}.`;
          } else {
            // Calculate upcoming bills
            const upcomingBills = bills.reduce((sum, bill) => {
              const dayDiff = bill.due_date - new Date().getDate();
              // Consider bills due in next 7 days
              if (dayDiff >= 0 && dayDiff <= 7) {
                return sum + parseFloat(bill.amount);
              }
              return sum;
            }, 0);
            
            const remainingAfterSpend = balance - amount;
            if (remainingAfterSpend < upcomingBills) {
              message = `You have enough to spend $${amount.toFixed(2)}, but be careful as you have $${upcomingBills.toFixed(2)} in upcoming bills.`;
            } else {
              message = `Yes, you can afford to spend $${amount.toFixed(2)} while still having enough for your upcoming bills.`;
            }
          }
        } else {
          const safeSpending = Math.max(0, balance - bills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0));
          message = `Based on your current financial situation, you could safely spend up to $${safeSpending.toFixed(2)}.`;
        }
      }
      else {
        // Default response
        message = `You have a balance of $${balance}. You've registered ${bills.length} bills and ${income.length} income sources.`;
      }
      
      return res.json({ message });
    } catch (error) {
      log(`Error in financial advisor: ${error}`, "routes");
      return res.status(500).json({ 
        error: "Error processing financial query",
        message: "I couldn't process your question. Please try asking about your balance, bills, income, or spending."
      });
    }
  });

  // Create a HTTP server
  const server = http.createServer(app);
  
  // Set up Vite server
  await setupVite(app, server);
  
  return server;
}