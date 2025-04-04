import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertBillSchema, 
  insertIncomeSchema, 
  billFormSchema, 
  incomeFormSchema 
} from "@shared/schema";
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
      
      // First validate the request body with billFormSchema (client-side schema)
      const formData = billFormSchema.parse(req.body);
      
      console.log("Validated form data:", formData);
      
      // Prepare data for database insertion
      const billData = {
        user_id: userId,
        name: formData.name,
        amount: formData.amount,
        due_date: formData.due_date
      };
      
      console.log("Prepared bill data for insertion:", billData);
      
      const bill = await storage.createBill(billData);
      console.log("Created bill:", bill);
      
      res.status(201).json(bill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Invalid bill data", details: error.errors });
      }
      console.error("Bill creation error:", error);
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
      
      // First validate the request body with incomeFormSchema (client-side schema)
      const formData = incomeFormSchema.parse(req.body);
      
      console.log("Validated income form data:", formData);
      
      // Prepare data for database insertion
      const incomeData = {
        user_id: userId,
        source: formData.source,
        amount: formData.amount,
        frequency: formData.frequency
      };
      
      console.log("Prepared income data for insertion:", incomeData);
      
      const income = await storage.createIncome(incomeData);
      console.log("Created income:", income);
      
      res.status(201).json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Income validation error:", error.errors);
        return res.status(400).json({ message: "Invalid income data", details: error.errors });
      }
      console.error("Income creation error:", error);
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

  // Account balance routes
  app.get("/api/account-balance", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        accountBalance: user.account_balance,
        lastUpdate: user.last_balance_update
      });
    } catch (error) {
      console.error("Get account balance error:", error);
      res.status(500).json({ message: "Failed to get account balance" });
    }
  });

  app.post("/api/account-balance", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const { balance } = req.body;
      
      if (balance === undefined || isNaN(Number(balance))) {
        return res.status(400).json({ message: "Valid balance is required" });
      }
      
      const numericBalance = Number(balance);
      const user = await storage.updateUserBalance(userId, numericBalance);
      
      res.json({ 
        accountBalance: user.account_balance,
        lastUpdate: user.last_balance_update
      });
    } catch (error) {
      console.error("Update account balance error:", error);
      res.status(500).json({ message: "Failed to update account balance" });
    }
  });

  // Calculate balance after bill deductions based on current date
  app.get("/api/calculated-balance", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      const bills = await storage.getBillsByUserId(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.account_balance) {
        return res.json({ calculatedBalance: null, deductedBills: [] });
      }
      
      const currentDate = new Date().getDate(); // Get current day of month (1-31)
      const lastUpdateDate = user.last_balance_update ? new Date(user.last_balance_update).getDate() : 0;
      
      // Find bills that are due between the last update and current date
      const billsToPay = bills.filter(bill => {
        // If bill due date is between last update and today
        // or if last update was in previous month and bill is due between 1 and today
        return (bill.due_date > lastUpdateDate && bill.due_date <= currentDate) ||
               (lastUpdateDate > currentDate && bill.due_date <= currentDate); 
      });
      
      // Calculate new balance
      const totalDeductions = billsToPay.reduce((sum, bill) => sum + Number(bill.amount), 0);
      const initialBalance = Number(user.account_balance);
      const calculatedBalance = initialBalance - totalDeductions;
      
      // If there were deductions, update the user's balance
      if (totalDeductions > 0) {
        await storage.updateUserBalance(userId, calculatedBalance);
      } else {
        await storage.updateLastBalanceUpdate(userId);
      }
      
      res.json({
        calculatedBalance: calculatedBalance.toFixed(2),
        previousBalance: initialBalance.toFixed(2),
        deductedBills: billsToPay.map(bill => ({
          id: bill.id,
          name: bill.name,
          amount: Number(bill.amount).toFixed(2),
          dueDate: bill.due_date
        }))
      });
    } catch (error) {
      console.error("Calculate balance error:", error);
      res.status(500).json({ message: "Failed to calculate balance" });
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
