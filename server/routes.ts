import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBillSchema, insertIncomeSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes
  setupAuth(app);

  // Bill routes
  app.get("/api/bills", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user!.id;
    const bills = await storage.getBillsByUserId(userId);
    res.json(bills);
  });

  app.post("/api/bills", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      
      // Validate request data
      const validatedData = insertBillSchema.parse({
        ...req.body,
        user_id: userId,
        amount: Number(req.body.amount),
      });
      
      const bill = await storage.createBill(validatedData);
      res.status(201).json(bill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bill data", details: error.errors });
      }
      res.status(500).json({ message: "Failed to create bill" });
    }
  });

  app.delete("/api/bills/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const billId = parseInt(req.params.id);
      if (isNaN(billId)) {
        return res.status(400).json({ message: "Invalid bill ID" });
      }
      
      await storage.deleteBill(billId);
      res.status(200).json({ message: "Bill deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bill" });
    }
  });

  // Income routes
  app.get("/api/income", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user!.id;
    const income = await storage.getIncomeByUserId(userId);
    res.json(income);
  });

  app.post("/api/income", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      
      // Validate request data
      const validatedData = insertIncomeSchema.parse({
        ...req.body,
        user_id: userId,
        amount: Number(req.body.amount),
      });
      
      const income = await storage.createIncome(validatedData);
      res.status(201).json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid income data", details: error.errors });
      }
      res.status(500).json({ message: "Failed to create income" });
    }
  });

  app.delete("/api/income/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const incomeId = parseInt(req.params.id);
      if (isNaN(incomeId)) {
        return res.status(400).json({ message: "Invalid income ID" });
      }
      
      await storage.deleteIncome(incomeId);
      res.status(200).json({ message: "Income deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete income" });
    }
  });

  // Chatbot spending recommendation API
  app.post("/api/spending-advisor", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const { amount } = req.body;
      
      if (!amount || isNaN(Number(amount))) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      const spendAmount = Number(amount);
      const userIncome = await storage.getIncomeByUserId(userId);
      const userBills = await storage.getBillsByUserId(userId);
      
      // Calculate total income based on frequency
      const totalIncome = userIncome.reduce((sum, inc) => {
        let monthlyAmount = 0;
        switch (inc.frequency) {
          case "Weekly":
            monthlyAmount = Number(inc.amount) * 4;
            break;
          case "Bi-weekly":
            monthlyAmount = Number(inc.amount) * 2;
            break;
          case "Monthly":
            monthlyAmount = Number(inc.amount);
            break;
          default:
            monthlyAmount = Number(inc.amount);
        }
        return sum + monthlyAmount;
      }, 0);
      
      // Calculate total bills
      const totalBills = userBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
      
      // Calculate available balance
      const availableBalance = totalIncome - totalBills;
      
      // Check if user can spend the amount
      if (spendAmount <= availableBalance) {
        // Find the upcoming bill
        const today = new Date();
        const currentDate = today.getDate();
        
        let upcomingBill = userBills
          .filter(bill => bill.due_date > currentDate)
          .sort((a, b) => a.due_date - b.due_date)[0];
        
        // If no upcoming bill this month, find the earliest bill next month
        if (!upcomingBill) {
          upcomingBill = userBills.sort((a, b) => a.due_date - b.due_date)[0];
        }
        
        const newBalance = availableBalance - spendAmount;
        
        if (upcomingBill) {
          const daysUntilBill = upcomingBill.due_date > currentDate 
            ? upcomingBill.due_date - currentDate 
            : upcomingBill.due_date + (30 - currentDate);
          
          const balanceAfterBill = newBalance - Number(upcomingBill.amount);
          
          res.json({
            canSpend: true,
            message: `Yes, you can spend $${spendAmount}. New balance: $${newBalance.toFixed(2)}. After ${upcomingBill.name} ($${Number(upcomingBill.amount).toFixed(2)}) due in ${daysUntilBill} days, balance will be $${balanceAfterBill.toFixed(2)}.`
          });
        } else {
          res.json({
            canSpend: true,
            message: `Yes, you can spend $${spendAmount}. New balance: $${newBalance.toFixed(2)}.`
          });
        }
      } else {
        res.json({
          canSpend: false,
          message: `No, you cannot spend $${spendAmount} due to upcoming bills reducing your balance below safe levels.`
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get spending recommendation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
