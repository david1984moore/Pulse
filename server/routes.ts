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
  
  app.put("/api/bills/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const billId = parseInt(req.params.id);
      if (isNaN(billId)) {
        return res.status(400).json({ message: "Invalid bill ID" });
      }
      
      // Validate the request body with billFormSchema
      const formData = billFormSchema.parse(req.body);
      
      // Prepare data for database update
      const billData = {
        id: billId,
        name: formData.name,
        amount: formData.amount,
        due_date: formData.due_date
      };
      
      console.log("Updating bill:", billData);
      
      const updatedBill = await storage.updateBill(billData);
      
      res.status(200).json(updatedBill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Invalid bill data", details: error.errors });
      }
      console.error("Bill update error:", error);
      res.status(500).json({ message: "Failed to update bill" });
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
  
  app.put("/api/income/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const incomeId = parseInt(req.params.id);
      if (isNaN(incomeId)) {
        return res.status(400).json({ message: "Invalid income ID" });
      }
      
      // Validate the request body with incomeFormSchema
      const formData = incomeFormSchema.parse(req.body);
      
      // Prepare data for database update
      const incomeData = {
        id: incomeId,
        source: formData.source,
        amount: formData.amount,
        frequency: formData.frequency
      };
      
      console.log("Updating income:", incomeData);
      
      const updatedIncome = await storage.updateIncome(incomeData);
      
      res.status(200).json(updatedIncome);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Invalid income data", details: error.errors });
      }
      console.error("Income update error:", error);
      res.status(500).json({ message: "Failed to update income" });
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
      
      // Make sure we're working with a numeric value, not a string
      const numericBalance = Number(balance);
      console.log("Updating balance for user", userId, "to", numericBalance);
      
      // Update the user's balance
      const user = await storage.updateUserBalance(userId, numericBalance);
      
      console.log("Updated user balance:", user);
      
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
      const user = await storage.getUser(userId);
      const userBills = await storage.getBillsByUserId(userId);
      
      if (!user || !user.account_balance) {
        return res.status(400).json({ 
          message: "Account balance not set. Please update your balance first." 
        });
      }
      
      // Get account balance
      const accountBalance = Number(user.account_balance);
      
      // Get the current date to find upcoming bills
      const today = new Date();
      const currentDate = today.getDate();
      
      // Find upcoming bills
      const upcomingBills = userBills.filter(bill => bill.due_date > currentDate);
      
      // Calculate total of upcoming bills
      const upcomingBillsTotal = upcomingBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
      
      // Calculate available balance considering upcoming bills
      const availableBalance = accountBalance;
      // Make spending recommendation based on current balance and upcoming bills
      const safeToSpend = spendAmount <= (availableBalance - upcomingBillsTotal*0.5); // Keep half of upcoming bills as buffer
      const riskToSpend = !safeToSpend && spendAmount <= availableBalance;
      
      // Calculate the balance after spending
      const newBalance = availableBalance - spendAmount;
      
      // Find the upcoming bill for additional context in response
      let upcomingBill = upcomingBills.length > 0 
          ? upcomingBills.sort((a, b) => a.due_date - b.due_date)[0]
          : userBills.sort((a, b) => a.due_date - b.due_date)[0];
      
      if (safeToSpend) {
        // Can safely spend with enough buffer for upcoming bills
        if (upcomingBill) {
          const daysUntilBill = upcomingBill.due_date > currentDate 
            ? upcomingBill.due_date - currentDate 
            : upcomingBill.due_date + (30 - currentDate);
          
          const balanceAfterBill = newBalance - Number(upcomingBill.amount);
          
          res.json({
            canSpend: true,
            message: `Yes, you can spend $${spendAmount}. Your balance after this purchase will be $${newBalance.toFixed(2)}. Your next bill ${upcomingBill.name} ($${Number(upcomingBill.amount).toFixed(2)}) is due in ${daysUntilBill} days, which will leave you with $${balanceAfterBill.toFixed(2)}.`
          });
        } else {
          res.json({
            canSpend: true,
            message: `Yes, you can spend $${spendAmount}. Your balance after this purchase will be $${newBalance.toFixed(2)}.`
          });
        }
      } else if (riskToSpend) {
        // Can spend but it might be tight with upcoming bills
        if (upcomingBills.length > 0) {
          const totalUpcoming = upcomingBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
          const balanceAfterAll = newBalance - totalUpcoming;
          
          res.json({
            canSpend: true,
            message: `You can spend $${spendAmount}, but be careful. Your balance after this purchase will be $${newBalance.toFixed(2)}, and you have $${totalUpcoming.toFixed(2)} in upcoming bills which would leave you with $${balanceAfterAll.toFixed(2)}.`
          });
        } else {
          res.json({
            canSpend: true,
            message: `Yes, you can spend $${spendAmount}. Your balance after this purchase will be $${newBalance.toFixed(2)}.`
          });
        }
      } else {
        // Cannot spend this amount
        res.json({
          canSpend: false,
          message: `Sorry, you cannot spend $${spendAmount} as it would exceed your current account balance of $${availableBalance.toFixed(2)}.`
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get spending recommendation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
