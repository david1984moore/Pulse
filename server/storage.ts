import { 
  User, InsertUser, Bill, InsertBill, Income, InsertIncome,
  users, bills, income as incomeTable
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Interface definition for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, balance: number): Promise<User>;
  updateLastBalanceUpdate(userId: number): Promise<void>;
  
  // Bill operations
  getBillsByUserId(userId: number): Promise<Bill[]>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(bill: { id: number; name: string; amount: string; due_date: number }): Promise<Bill>;
  deleteBill(billId: number): Promise<void>;
  
  // Income operations
  getIncomeByUserId(userId: number): Promise<Income[]>;
  createIncome(income: InsertIncome): Promise<Income>;
  updateIncome(income: { id: number; source: string; amount: string; frequency: string }): Promise<Income>;
  deleteIncome(incomeId: number): Promise<void>;
  
  // Session store
  sessionStore: session.Store;
}

// In-memory implementation (kept for reference but no longer used)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bills: Map<number, Bill>;
  private income: Map<number, Income>;
  sessionStore: session.Store;
  private userId: number = 1;
  private billId: number = 1;
  private incomeId: number = 1;

  constructor() {
    this.users = new Map();
    this.bills = new Map();
    this.income = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) {
      console.log("MemStorage.getUserByEmail: Empty email provided");
      return undefined;
    }
    
    // Normalize email for consistent comparison
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`MemStorage.getUserByEmail: Looking for normalized email: '${normalizedEmail}'`);
    
    const allUsers = Array.from(this.users.values());
    console.log(`Found ${allUsers.length} total users in memory storage`);
    
    // Loop through each user and log their emails for debugging
    allUsers.forEach(u => {
      console.log(`User in memory: ID=${u.id}, Email='${u.email}', Normalized='${u.email.toLowerCase().trim()}'`);
    });
    
    const user = allUsers.find(u => {
      const dbEmailNormalized = (u.email || '').toLowerCase().trim();
      const match = dbEmailNormalized === normalizedEmail;
      console.log(`Comparing: '${dbEmailNormalized}' with '${normalizedEmail}', match: ${match}`);
      return match;
    });
    
    console.log(`User found by email?: ${!!user}`, user ? `ID: ${user.id}, Email: '${user.email}'` : '');
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id, 
      created_at: new Date(),
      account_balance: null,
      last_balance_update: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: number, balance: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      account_balance: balance.toString(), 
      last_balance_update: new Date() 
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateLastBalanceUpdate(userId: number): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    this.users.set(userId, { ...user, last_balance_update: new Date() });
  }

  // Bill methods
  async getBillsByUserId(userId: number): Promise<Bill[]> {
    return Array.from(this.bills.values()).filter(
      (bill) => bill.user_id === userId
    );
  }

  async createBill(insertBill: InsertBill): Promise<Bill> {
    const id = this.billId++;
    const bill: Bill = { 
      ...insertBill, 
      id, 
      created_at: new Date() 
    };
    this.bills.set(id, bill);
    return bill;
  }

  async updateBill(bill: { id: number; name: string; amount: string; due_date: number }): Promise<Bill> {
    const existingBill = this.bills.get(bill.id);
    if (!existingBill) {
      throw new Error(`Bill with ID ${bill.id} not found`);
    }
    
    const updatedBill: Bill = {
      ...existingBill,
      name: bill.name,
      amount: bill.amount,
      due_date: bill.due_date
    };
    
    this.bills.set(bill.id, updatedBill);
    return updatedBill;
  }
  
  async deleteBill(billId: number): Promise<void> {
    this.bills.delete(billId);
  }

  // Income methods
  async getIncomeByUserId(userId: number): Promise<Income[]> {
    return Array.from(this.income.values()).filter(
      (income) => income.user_id === userId
    );
  }

  async createIncome(insertIncome: InsertIncome): Promise<Income> {
    const id = this.incomeId++;
    const income: Income = { 
      ...insertIncome, 
      id, 
      created_at: new Date() 
    };
    this.income.set(id, income);
    return income;
  }

  async updateIncome(income: { id: number; source: string; amount: string; frequency: string }): Promise<Income> {
    const existingIncome = this.income.get(income.id);
    if (!existingIncome) {
      throw new Error(`Income with ID ${income.id} not found`);
    }
    
    const updatedIncome: Income = {
      ...existingIncome,
      source: income.source,
      amount: income.amount,
      frequency: income.frequency
    };
    
    this.income.set(income.id, updatedIncome);
    return updatedIncome;
  }
  
  async deleteIncome(incomeId: number): Promise<void> {
    this.income.delete(incomeId);
  }
}

// New database implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Create a pool for session store
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Set up PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: 'session',
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("getUser error:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      if (!email) {
        console.log("getUserByEmail: Empty email provided");
        return undefined;
      }
      
      // Normalize email for consistent comparison
      const normalizedEmail = email.toLowerCase().trim();
      console.log(`DatabaseStorage.getUserByEmail: Looking for normalized email: '${normalizedEmail}'`);
      
      // Use SQL LOWER function for case-insensitive comparison
      const users_with_matching_email = await db
        .select()
        .from(users)
        .where(sql`LOWER(${users.email}) = LOWER(${normalizedEmail})`);
      
      console.log(`Found ${users_with_matching_email.length} users with email '${normalizedEmail}'`);
      
      // Get the first user if any match (should be only one due to unique constraint)
      const user = users_with_matching_email[0];
      
      console.log(`User found by email?: ${!!user}`, user ? `ID: ${user.id}, Email: '${user.email}'` : '');
      return user;
    } catch (error) {
      console.error("getUserByEmail error:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserBalance(userId: number, balance: number): Promise<User> {
    const now = new Date();
    
    try {
      // Ensure balance is a valid number and convert to string with 2 decimal places for storage
      if (isNaN(balance)) {
        throw new Error(`Invalid balance value: ${balance}`);
      }
      
      const balanceString = balance.toFixed(2);
      console.log(`Updating user ${userId} balance to ${balanceString}`);
      
      const [user] = await db
        .update(users)
        .set({ 
          account_balance: balanceString,
          last_balance_update: now
        })
        .where(eq(users.id, userId))
        .returning();
      
      console.log(`User updated:`, user);
      return user;
    } catch (error) {
      console.error(`Error updating balance for user ${userId}:`, error);
      throw error;
    }
  }

  async updateLastBalanceUpdate(userId: number): Promise<void> {
    const now = new Date();
    await db
      .update(users)
      .set({ last_balance_update: now })
      .where(eq(users.id, userId));
  }

  // Bill methods
  async getBillsByUserId(userId: number): Promise<Bill[]> {
    return await db.select().from(bills).where(eq(bills.user_id, userId));
  }

  async createBill(insertBill: InsertBill): Promise<Bill> {
    const [bill] = await db.insert(bills).values(insertBill).returning();
    return bill;
  }

  async updateBill(bill: { id: number; name: string; amount: string; due_date: number }): Promise<Bill> {
    try {
      const [updatedBill] = await db
        .update(bills)
        .set({
          name: bill.name,
          amount: bill.amount,
          due_date: bill.due_date
        })
        .where(eq(bills.id, bill.id))
        .returning();
      
      return updatedBill;
    } catch (error) {
      console.error("Error updating bill:", error);
      throw error;
    }
  }
  
  async deleteBill(billId: number): Promise<void> {
    await db.delete(bills).where(eq(bills.id, billId));
  }

  // Income methods
  async getIncomeByUserId(userId: number): Promise<Income[]> {
    return await db.select().from(incomeTable).where(eq(incomeTable.user_id, userId));
  }

  async createIncome(insertIncomeData: InsertIncome): Promise<Income> {
    const [incomeResult] = await db.insert(incomeTable).values(insertIncomeData).returning();
    return incomeResult;
  }

  async updateIncome(income: { id: number; source: string; amount: string; frequency: string }): Promise<Income> {
    try {
      const [updatedIncome] = await db
        .update(incomeTable)
        .set({
          source: income.source,
          amount: income.amount,
          frequency: income.frequency
        })
        .where(eq(incomeTable.id, income.id))
        .returning();
      
      return updatedIncome;
    } catch (error) {
      console.error("Error updating income:", error);
      throw error;
    }
  }

  async deleteIncome(incomeId: number): Promise<void> {
    await db.delete(incomeTable).where(eq(incomeTable.id, incomeId));
  }
}

// Export the database storage implementation
export const storage = new DatabaseStorage();
