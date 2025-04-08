import express, { Express, Request, Response, NextFunction } from "express";
import { Server } from "http";
import { storage } from "./storage";
import { setupVite, log, serveStatic } from "./vite";
import { setupAuth } from "./auth";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import csurf from "csurf";
import cookieParser from "cookie-parser";

/**
 * Setup all the routes for the application
 * @param app Express application
 * @returns HTTP server instance
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware
  app.use(cookieParser());
  
  // Rate limiting to prevent brute-force attacks
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per windowMs
    message: { error: "Too many login attempts, please try again later." }
  });

  // CSRF protection
  const csrfProtection = csurf({ cookie: true });
  
  // Auth setup
  setupAuth(app);

  // API routes
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      
      const { name, email, password } = result.data;
      
      // Check if the user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      
      // Create the user
      const user = await storage.createUser({ name, email, password });
      
      // Log the user in using Passport.js
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: err });
        }
        return res.status(201).json(user);
      });
    } catch (error) {
      log(`Error registering user: ${error}`, "routes");
      return res.status(500).json({ error: "Error registering user" });
    }
  });

  app.post("/api/login", loginLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if the email exists
      const email = req.body.email;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Check if the account is locked
      const isLocked = await storage.checkUserLocked(email);
      if (isLocked) {
        return res.status(401).json({ error: "Account is locked due to too many failed attempts. Try again later." });
      }
      
      // Continue with Passport.js authentication
      const passport = req.passport;
      passport.authenticate("local", async (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          // Increment failed login attempts
          await storage.updateLoginAttempts(email, true);
          return res.status(401).json({ error: info.message || "Invalid credentials" });
        }
        
        // Reset login attempts on successful login
        await storage.updateLoginAttempts(email, false);
        
        // Update last login time
        await storage.updateLastLogin(user.id);
        
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.json(user);
        });
      })(req, res, next);
    } catch (error) {
      log(`Error logging in user: ${error}`, "routes");
      return res.status(500).json({ error: "Error logging in user" });
    }
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: err });
        }
        res.clearCookie("connect.sid");
        return res.status(200).json({ success: true });
      });
    });
  });

  // Get current user
  app.get("/api/current-user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    return res.json(req.user);
  });
  
  // Get CSRF token
  app.get("/api/csrf-token", csrfProtection, (req: Request, res: Response) => {
    return res.json({ csrfToken: req.csrfToken() });
  });

  // Bills API
  app.get("/api/bills", csrfProtection, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const bills = await storage.getBillsByUserId(req.user.id);
      return res.json(bills);
    } catch (error) {
      log(`Error fetching bills: ${error}`, "routes");
      return res.status(500).json({ error: "Error fetching bills" });
    }
  });

  app.post("/api/bills", csrfProtection, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const schema = z.object({
        name: z.string().min(1),
        amount: z.string().min(1),
        due_date: z.number().int().positive(),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      
      const { name, amount, due_date } = result.data;
      
      const bill = await storage.createBill({
        name,
        amount,
        due_date,
        user_id: req.user.id,
      });
      
      return res.status(201).json(bill);
    } catch (error) {
      log(`Error creating bill: ${error}`, "routes");
      return res.status(500).json({ error: "Error creating bill" });
    }
  });

  // Update bill
  app.put("/api/bills/:id", csrfProtection, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const schema = z.object({
        name: z.string().min(1),
        amount: z.string().min(1),
        due_date: z.number().int().positive(),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      
      const { name, amount, due_date } = result.data;
      const billId = parseInt(req.params.id);
      
      const bill = await storage.updateBill({
        id: billId,
        name,
        amount,
        due_date,
      });
      
      return res.json(bill);
    } catch (error) {
      log(`Error updating bill: ${error}`, "routes");
      return res.status(500).json({ error: "Error updating bill" });
    }
  });

  // Delete bill
  app.delete("/api/bills/:id", csrfProtection, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const billId = parseInt(req.params.id);
      await storage.deleteBill(billId);
      return res.status(204).send();
    } catch (error) {
      log(`Error deleting bill: ${error}`, "routes");
      return res.status(500).json({ error: "Error deleting bill" });
    }
  });

  // Income API
  app.get("/api/income", csrfProtection, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const income = await storage.getIncomeByUserId(req.user.id);
      return res.json(income);
    } catch (error) {
      log(`Error fetching income: ${error}`, "routes");
      return res.status(500).json({ error: "Error fetching income" });
    }
  });

  app.post("/api/income", csrfProtection, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const schema = z.object({
        source: z.string().min(1),
        amount: z.string().min(1),
        frequency: z.string().min(1),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      
      const { source, amount, frequency } = result.data;
      
      const income = await storage.createIncome({
        source,
        amount,
        frequency,
        user_id: req.user.id,
      });
      
      return res.status(201).json(income);
    } catch (error) {
      log(`Error creating income: ${error}`, "routes");
      return res.status(500).json({ error: "Error creating income" });
    }
  });

  // Update income
  app.put("/api/income/:id", csrfProtection, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const schema = z.object({
        source: z.string().min(1),
        amount: z.string().min(1),
        frequency: z.string().min(1),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      
      const { source, amount, frequency } = result.data;
      const incomeId = parseInt(req.params.id);
      
      const income = await storage.updateIncome({
        id: incomeId,
        source,
        amount,
        frequency,
      });
      
      return res.json(income);
    } catch (error) {
      log(`Error updating income: ${error}`, "routes");
      return res.status(500).json({ error: "Error updating income" });
    }
  });

  // Delete income
  app.delete("/api/income/:id", csrfProtection, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const incomeId = parseInt(req.params.id);
      await storage.deleteIncome(incomeId);
      return res.status(204).send();
    } catch (error) {
      log(`Error deleting income: ${error}`, "routes");
      return res.status(500).json({ error: "Error deleting income" });
    }
  });

  // Account balance API
  app.get("/api/account-balance", csrfProtection, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.user.id);
      return res.json({
        accountBalance: user?.account_balance?.toString() || null,
        lastUpdate: user?.last_balance_update || null,
      });
    } catch (error) {
      log(`Error fetching account balance: ${error}`, "routes");
      return res.status(500).json({ error: "Error fetching account balance" });
    }
  });

  app.post("/api/account-balance", csrfProtection, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const schema = z.object({
        balance: z.string().min(1),
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      
      const { balance } = result.data;
      
      // Convert balance to number
      const numBalance = parseFloat(balance);
      
      // Update user balance
      const updatedUser = await storage.updateUserBalance(req.user.id, numBalance);
      
      // Update last balance update time
      await storage.updateLastBalanceUpdate(req.user.id);
      
      return res.json({
        accountBalance: updatedUser.account_balance?.toString() || null,
        lastUpdate: updatedUser.last_balance_update || null,
      });
    } catch (error) {
      log(`Error updating account balance: ${error}`, "routes");
      return res.status(500).json({ error: "Error updating account balance" });
    }
  });

  // Financial advisor - spending calculations and advice
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
          message: `Sorry, you cannot spend $${amountNum} as it would exceed your current account balance of $${balanceNum.toFixed(2)}.`
        });
      }
      
      // Check upcoming bills
      const newBalance = balanceNum - amountNum;
      let message = `Yes, you can spend $${amountNum}. Your balance after this purchase will be $${newBalance.toFixed(2)}.`;
      
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
          message = `You can spend $${amountNum}, but be careful. Your balance after this purchase will be $${newBalance.toFixed(2)}, and you have $${upcomingBillsTotal.toFixed(2)} in upcoming bills which would leave you with $${(newBalance - upcomingBillsTotal).toFixed(2)}.`;
        } else {
          message = `Yes, you can spend $${amountNum}. Your balance after this purchase will be $${newBalance.toFixed(2)}. Your next bill ${nextBill.name} ($${nextBillAmount.toFixed(2)}) is due in ${daysUntilDue} days, which will leave you with $${(newBalance - nextBillAmount).toFixed(2)}.`;
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

  // Free-form financial advisor endpoint
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
      
      // Get user data for financial context
      const user = await storage.getUser(req.user.id);
      const bills = await storage.getBillsByUserId(req.user.id);
      const income = await storage.getIncomeByUserId(req.user.id);
      
      // Process the financial query
      const response = processFinancialQuery(query, {
        balance: user?.account_balance || 0,
        bills,
        income
      });
      
      return res.json({
        message: response
      });
    } catch (error) {
      log(`Error in financial advisor: ${error}`, "routes");
      return res.status(500).json({ error: "Error processing financial query" });
    }
  });

  // Get calculated balance API
  app.get("/api/calculated-balance", csrfProtection, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.user.id);
      const bills = await storage.getBillsByUserId(req.user.id);
      
      // Calculate remaining balance after deducting bills
      const balance = user?.account_balance || 0;
      const deductedBills = [];
      
      // Get today's date
      const today = new Date();
      const currentDay = today.getDate();
      
      let calculatedBalance = balance;
      
      // Sort bills by due date
      const sortedBills = [...bills].sort((a, b) => a.due_date - b.due_date);
      
      // Deduct bills that are due soon (within the next 7 days)
      for (const bill of sortedBills) {
        let dueDate = bill.due_date;
        
        // Calculate if the bill is due within 7 days
        let daysDifference = dueDate - currentDay;
        if (daysDifference < 0) {
          // Bill is due next month
          daysDifference += 30;
        }
        
        if (daysDifference <= 7) {
          const billAmount = parseFloat(bill.amount);
          calculatedBalance -= billAmount;
          
          deductedBills.push({
            id: bill.id,
            name: bill.name,
            amount: bill.amount,
            due_date: bill.due_date,
            days_until_due: daysDifference
          });
        }
      }
      
      return res.json({
        calculatedBalance: calculatedBalance.toString(),
        deductedBills
      });
    } catch (error) {
      log(`Error calculating balance: ${error}`, "routes");
      return res.status(500).json({ error: "Error calculating balance" });
    }
  });

  // Error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    log(`Error in routes: ${err}`, "routes");
    res.status(500).json({ error: 'Server error' });
  });

  // Set up Vite server in development mode
  return await setupVite(app);
}

/**
 * Processes a natural language financial query and returns relevant financial advice
 * based on the user's financial situation.
 */
function processFinancialQuery(query: string, context: { balance: number, bills: any[], income: any[] }) {
  const { balance, bills, income } = context;
  
  // Convert query to lowercase for easier matching
  const normalizedQuery = query.toLowerCase();
  
  // Calculate some financial metrics for giving advice
  const totalMonthlyBills = bills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
  const totalMonthlyIncome = income.reduce((sum, inc) => {
    const amount = parseFloat(inc.amount);
    // Adjust frequency to monthly equivalent
    switch(inc.frequency.toLowerCase()) {
      case 'weekly':
        return sum + (amount * 4.33); // Average weeks in a month
      case 'biweekly':
      case 'bi-weekly':  
        return sum + (amount * 2.17); // Biweekly to monthly
      case 'yearly':
        return sum + (amount / 12); // Yearly to monthly
      default: // monthly or unspecified
        return sum + amount;
    }
  }, 0);
  
  // Sort bills by due date
  const sortedBills = [...bills].sort((a, b) => a.due_date - b.due_date);
  
  // Get next due bill
  const today = new Date();
  const currentDay = today.getDate();
  let nextDueBill = null;
  let daysUntilNextBill = Infinity;
  
  for (const bill of sortedBills) {
    let dueDate = bill.due_date;
    let daysDifference = dueDate - currentDay;
    
    if (daysDifference < 0) {
      // Bill is due next month
      daysDifference += 30;
    }
    
    if (daysDifference < daysUntilNextBill) {
      daysUntilNextBill = daysDifference;
      nextDueBill = bill;
    }
  }
  
  // Calculate monthly surplus/deficit
  const monthlySurplus = totalMonthlyIncome - totalMonthlyBills;
  
  // Savings rate (if positive surplus)
  const savingsRate = monthlySurplus > 0 ? (monthlySurplus / totalMonthlyIncome) * 100 : 0;
  
  // Debt-to-income ratio (using bills as proxy for debt)
  const debtToIncomeRatio = totalMonthlyBills > 0 ? totalMonthlyIncome > 0 ? 
    (totalMonthlyBills / totalMonthlyIncome) * 100 : 100 : 0;
  
  // Handle different types of financial questions
  
  // Balance or general financial status questions
  if (normalizedQuery.includes('balance') || normalizedQuery.includes('how much do i have') || 
      normalizedQuery.includes('financial status') || normalizedQuery.includes('my money')) {
    return `Your current account balance is $${balance.toFixed(2)}. You have ${bills.length} bills totaling $${totalMonthlyBills.toFixed(2)} per month and ${income.length} income sources totaling approximately $${totalMonthlyIncome.toFixed(2)} per month.`;
  }
  
  // Spending capacity questions
  if (normalizedQuery.includes('how much can i spend') || normalizedQuery.includes('can i afford') || 
      normalizedQuery.includes('afford to buy') || normalizedQuery.includes('spend on')) {
    // Extract amount if present in the query
    const amountMatch = normalizedQuery.match(/\$?(\d+(\.\d+)?)/);
    if (amountMatch) {
      const amount = parseFloat(amountMatch[1]);
      if (amount > balance) {
        return `You cannot afford to spend $${amount.toFixed(2)} right now as it exceeds your current balance of $${balance.toFixed(2)}.`;
      } else if (amount > balance * 0.5 && bills.length > 0) {
        return `You technically have enough to spend $${amount.toFixed(2)}, but I would be cautious as it represents a significant portion of your current balance ($${balance.toFixed(2)}) and you have upcoming bills to consider.`;
      } else {
        return `Yes, you can afford to spend $${amount.toFixed(2)} as your current balance is $${balance.toFixed(2)}.`;
      }
    } else {
      // No specific amount mentioned
      const safeSpendingAmount = Math.max(0, balance - totalMonthlyBills);
      return `Based on your current balance of $${balance.toFixed(2)} and considering your upcoming bills, you could safely spend up to $${safeSpendingAmount.toFixed(2)}.`;
    }
  }
  
  // Budget or spending allocation questions
  if (normalizedQuery.includes('budget') || normalizedQuery.includes('allocate') || 
      normalizedQuery.includes('spending plan') || normalizedQuery.includes('how should i spend')) {
    if (monthlySurplus > 0) {
      return `Based on your finances, you have a monthly surplus of $${monthlySurplus.toFixed(2)}. A good approach would be to allocate 50% to needs, 30% to wants, and 20% to savings or debt payment. For your situation, that means about $${(monthlySurplus * 0.5).toFixed(2)} for needs, $${(monthlySurplus * 0.3).toFixed(2)} for wants, and $${(monthlySurplus * 0.2).toFixed(2)} for savings.`;
    } else {
      return `You're currently spending more than you earn by $${Math.abs(monthlySurplus).toFixed(2)} per month. I would recommend reviewing your bills to find potential savings, and consider increasing your income if possible. Focus on essential expenses first and minimize discretionary spending until your income exceeds your expenses.`;
    }
  }
  
  // Savings goal questions
  if (normalizedQuery.includes('save') || normalizedQuery.includes('saving') || 
      normalizedQuery.includes('emergency fund') || normalizedQuery.includes('save for')) {
    const emergencyFundNeeded = totalMonthlyBills * 3; // 3 months of expenses
    
    if (monthlySurplus <= 0) {
      return `With your current income and expenses, you're not able to save. You need to either increase your income or reduce your expenses to create capacity for saving.`;
    } else {
      const monthsToEmergencyFund = emergencyFundNeeded / monthlySurplus;
      return `Your current saving capacity is $${monthlySurplus.toFixed(2)} per month. I recommend building an emergency fund of $${emergencyFundNeeded.toFixed(2)} (3 months of expenses), which would take about ${Math.ceil(monthsToEmergencyFund)} months at your current rate.`;
    }
  }
  
  // Bill payment or upcoming expense questions
  if (normalizedQuery.includes('bills') || normalizedQuery.includes('due') || 
      normalizedQuery.includes('payment') || normalizedQuery.includes('upcoming expenses')) {
    if (bills.length === 0) {
      return `You don't have any bills registered in your account.`;
    } else if (nextDueBill) {
      return `Your next bill is ${nextDueBill.name} for $${parseFloat(nextDueBill.amount).toFixed(2)}, due in ${daysUntilNextBill} days. In total, you have ${bills.length} bills totaling $${totalMonthlyBills.toFixed(2)} per month.`;
    } else {
      return `You have ${bills.length} bills totaling $${totalMonthlyBills.toFixed(2)} per month.`;
    }
  }
  
  // Financial health questions
  if (normalizedQuery.includes('financial health') || normalizedQuery.includes('doing financially') || 
      normalizedQuery.includes('financial situation')) {
    let healthAnalysis = '';
    
    // Analyze savings rate
    if (savingsRate >= 20) {
      healthAnalysis += `Your savings rate of ${savingsRate.toFixed(0)}% is excellent. `;
    } else if (savingsRate >= 10) {
      healthAnalysis += `Your savings rate of ${savingsRate.toFixed(0)}% is good. `;
    } else if (savingsRate > 0) {
      healthAnalysis += `Your savings rate of ${savingsRate.toFixed(0)}% is positive but could be improved. `;
    } else {
      healthAnalysis += `You're not currently saving any money, which is concerning. `;
    }
    
    // Analyze debt-to-income
    if (debtToIncomeRatio <= 30) {
      healthAnalysis += `Your debt-to-income ratio of ${debtToIncomeRatio.toFixed(0)}% is healthy. `;
    } else if (debtToIncomeRatio <= 40) {
      healthAnalysis += `Your debt-to-income ratio of ${debtToIncomeRatio.toFixed(0)}% is acceptable but could be better. `;
    } else {
      healthAnalysis += `Your debt-to-income ratio of ${debtToIncomeRatio.toFixed(0)}% is high and should be addressed. `;
    }
    
    return `${healthAnalysis}You have a balance of $${balance.toFixed(2)}, monthly income of approximately $${totalMonthlyIncome.toFixed(2)}, and monthly expenses of $${totalMonthlyBills.toFixed(2)}.`;
  }
  
  // Income-related questions
  if (normalizedQuery.includes('income') || normalizedQuery.includes('earn') || 
      normalizedQuery.includes('make') || normalizedQuery.includes('salary')) {
    if (income.length === 0) {
      return `You don't have any income sources registered in your account.`;
    } else {
      const primaryIncome = income.reduce((highest, inc) => {
        const amount = parseFloat(inc.amount);
        return amount > highest.amount ? { source: inc.source, amount } : highest;
      }, { source: '', amount: 0 });
      
      return `You have ${income.length} income sources totaling approximately $${totalMonthlyIncome.toFixed(2)} per month. Your primary income source is ${primaryIncome.source} at $${primaryIncome.amount.toFixed(2)} per ${income.find(inc => inc.source === primaryIncome.source)?.frequency.toLowerCase() || 'period'}.`;
    }
  }
  
  // Default response for unrecognized queries
  return `Based on your financial situation: You have a balance of $${balance.toFixed(2)}, ${bills.length} bills totaling $${totalMonthlyBills.toFixed(2)} per month, and ${income.length} income sources totaling approximately $${totalMonthlyIncome.toFixed(2)} per month. Your monthly cash flow is ${monthlySurplus >= 0 ? 'positive' : 'negative'} at ${monthlySurplus >= 0 ? '+' : ''}$${monthlySurplus.toFixed(2)}.`;
}