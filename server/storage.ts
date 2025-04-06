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
import { randomBytes } from "crypto";
import { hashPassword } from "./auth";

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
  
  // Security operations
  updateLoginAttempts(email: string, increment: boolean): Promise<number>;
  checkUserLocked(email: string): Promise<boolean>;
  lockUserAccount(email: string, durationMinutes: number): Promise<void>;
  unlockUserAccount(email: string): Promise<void>;
  updateLastLogin(userId: number): Promise<void>;
  createPasswordResetToken(email: string): Promise<string | null>;
  validatePasswordResetToken(email: string, token: string): Promise<boolean>;
  resetPassword(email: string, newPassword: string): Promise<boolean>;
  
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
  
  // Database access
  getDb(): any;
  
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
    console.log(`\n>> MemStorage.getUserByEmail: Looking for normalized email: '${normalizedEmail}'`);
    
    const allUsers = Array.from(this.users.values());
    console.log(`\n>> All users in memory (${allUsers.length}):`);
    
    // Loop through each user and log their emails for debugging
    allUsers.forEach(u => {
      console.log(`    User ID=${u.id}, Email='${u.email}', Normalized='${u.email.toLowerCase().trim()}'`);
    });
    
    console.log(`\n>> Executing case-insensitive email search for: '${normalizedEmail}'`);
    
    // Strict case-insensitive comparison
    const user = allUsers.find(u => {
      const dbEmailNormalized = (u.email || '').toLowerCase().trim();
      const match = dbEmailNormalized === normalizedEmail;
      console.log(`    Comparing: '${dbEmailNormalized}' with '${normalizedEmail}', match: ${match}`);
      return match;
    });
    
    if (user) {
      console.log(`>> MATCH FOUND: User ID=${user.id}, Email='${user.email}'`);
    } else {
      console.log(`>> NO MATCH: No user found with email '${normalizedEmail}'`);
    }
    
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    console.log(`\n>> MemStorage.createUser: Creating user with email: '${insertUser.email}'`);
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id, 
      created_at: new Date(),
      account_balance: null,
      last_balance_update: null,
      last_login: null,
      login_attempts: 0,
      locked_until: null,
      reset_token: null,
      reset_token_expires: null
    };
    this.users.set(id, user);
    console.log(`>> User created: ID=${user.id}, Email='${user.email}'`);
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

  // Security methods
  async updateLoginAttempts(email: string, increment: boolean): Promise<number> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    
    const currentAttempts = user.login_attempts || 0;
    const newAttempts = increment ? currentAttempts + 1 : 0;
    
    const updatedUser = { 
      ...user, 
      login_attempts: newAttempts
    };
    this.users.set(user.id, updatedUser);
    
    return newAttempts;
  }
  
  async checkUserLocked(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return false;
    }
    
    if (!user.locked_until) {
      return false;
    }
    
    const now = new Date();
    if (user.locked_until < now) {
      // Lock expired, unlock the account
      await this.unlockUserAccount(email);
      return false;
    }
    
    return true;
  }
  
  async lockUserAccount(email: string, durationMinutes: number): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    
    const now = new Date();
    const lockUntil = new Date(now.getTime() + durationMinutes * 60000);
    
    const updatedUser = { 
      ...user, 
      locked_until: lockUntil
    };
    this.users.set(user.id, updatedUser);
  }
  
  async unlockUserAccount(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      locked_until: null,
      login_attempts: 0
    };
    this.users.set(user.id, updatedUser);
  }
  
  async updateLastLogin(userId: number): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      last_login: new Date(),
      login_attempts: 0
    };
    this.users.set(userId, updatedUser);
  }
  
  async createPasswordResetToken(email: string): Promise<string | null> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }
    
    // Generate a random token
    const token = randomBytes(32).toString('hex');
    
    // Set token expiration (1 hour)
    const now = new Date();
    const expires = new Date(now.getTime() + 60 * 60 * 1000);
    
    const updatedUser = { 
      ...user, 
      reset_token: token,
      reset_token_expires: expires
    };
    this.users.set(user.id, updatedUser);
    
    return token;
  }
  
  async validatePasswordResetToken(email: string, token: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.reset_token || !user.reset_token_expires) {
      return false;
    }
    
    const now = new Date();
    if (user.reset_token_expires < now) {
      return false;
    }
    
    return user.reset_token === token;
  }
  
  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return false;
    }
    
    // In a real implementation, password would be hashed here
    const updatedUser = { 
      ...user, 
      password: newPassword,
      reset_token: null,
      reset_token_expires: null
    };
    this.users.set(user.id, updatedUser);
    
    return true;
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
  
  // This is just a stub for the MemStorage implementation
  // since it doesn't use a real database
  getDb(): any {
    console.log("MemStorage.getDb called - not supported for in-memory storage");
    return null;
  }
}

// New database implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  private pool: Pool;

  constructor() {
    // Create a pool for session store
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Set up PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({
      pool: this.pool,
      createTableIfMissing: true,
      tableName: 'session',
    });
  }
  
  // Expose the db query method for direct SQL execution
  getDb() {
    return this.pool;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      // Use raw SQL to avoid Drizzle ORM schema enforcement that might fail
      // with missing columns when deserializing users
      const result = await this.pool.query(
        `SELECT id, name, email, password, account_balance, last_balance_update, created_at
         FROM users WHERE id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      // Return basic user object without potentially missing columns
      return result.rows[0] as User;
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
      console.log(`\n>> DatabaseStorage.getUserByEmail: Looking for normalized email: '${normalizedEmail}'`);
      
      // Use raw SQL to get only the columns we know exist
      const result = await this.pool.query(
        `SELECT id, name, email, password, account_balance, last_balance_update, created_at,
        login_attempts, locked_until, reset_token, reset_token_expires 
        FROM users WHERE LOWER(email) = LOWER($1)`,
        [normalizedEmail]
      );
      
      console.log(`\n>> Query returned ${result.rows.length} results`);
      
      if (result.rows.length > 0) {
        const user = result.rows[0] as User;
        console.log(`>> MATCH FOUND: User ID=${user.id}, Email='${user.email}'`);
        return user;
      }
      
      console.log(`>> NO MATCH: No user found with email '${normalizedEmail}'`);
      return undefined;
    } catch (error: any) {
      // If error is about missing columns, try a simplified query
      try {
        // Store the normalized email in a separate variable to avoid the error
        const emailToQuery = email.toLowerCase().trim();
        
        // Fallback to basics only if we get a column-not-exists error
        if (error && error.toString && error.toString().includes("column") && error.toString().includes("does not exist")) {
          console.warn(">> Column error in getUserByEmail, trying simplified query");
          
          const result = await this.pool.query(
            `SELECT id, name, email, password FROM users WHERE LOWER(email) = LOWER($1)`,
            [emailToQuery]
          );
          
          if (result.rows.length > 0) {
            const user = result.rows[0] as User;
            console.log(`>> MATCH FOUND (simplified): User ID=${user.id}, Email='${user.email}'`);
            return user;
          }
        }
      } catch (fallbackError) {
        console.error(">> Fallback query also failed:", fallbackError);
      }
      
      console.error(">> ERROR in getUserByEmail:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    console.log(`\n>> DatabaseStorage.createUser: Creating user with email: '${insertUser.email}'`);
    
    // Normalize email
    const normalizedEmail = insertUser.email.toLowerCase().trim();
    
    // First, check for existing users with the same email (case-insensitive)
    console.log(`>> Checking for existing users with email: '${normalizedEmail}'`);
    
    try {
      // Use a raw SQL query to handle case-insensitive matching reliably
      const existingUsers = await this.pool.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
        [normalizedEmail]
      );
      
      if (existingUsers.rows.length > 0) {
        console.log(`>> DUPLICATE EMAIL DETECTED: '${normalizedEmail}' matches existing email`);
        // Create a custom error object with a code that can be caught in the auth handler
        const duplicateError: any = new Error("Email already exists");
        duplicateError.code = '23505'; // Simulate PostgreSQL's unique constraint violation
        duplicateError.constraint = 'users_email_unique'; // Use the same name as our constraint
        throw duplicateError;
      }
      
      console.log(`>> No duplicates found, creating user with normalized email: '${normalizedEmail}'`);
      
      // Create the user with normalized email and security fields
      const modifiedInsertUser = {
        ...insertUser,
        email: normalizedEmail, // Always store normalized email
        last_login: null,
        login_attempts: 0,
        locked_until: null,
        reset_token: null,
        reset_token_expires: null
      };
      
      const [user] = await db.insert(users).values(modifiedInsertUser).returning();
      console.log(`>> User created: ID=${user.id}, Email='${user.email}'`);
      return user;
    } catch (error) {
      console.error(`>> ERROR in createUser:`, error);
      throw error;
    }
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
  
  // Security methods
  async updateLoginAttempts(email: string, increment: boolean): Promise<number> {
    try {
      // First get the user
      const user = await this.getUserByEmail(email);
      if (!user) {
        return 0; // No user, no attempts to track
      }
      
      // Get current attempts, default to 0 if not set
      const currentAttempts = user.login_attempts || 0;
      const newAttempts = increment ? currentAttempts + 1 : 0;
      
      try {
        // Try to use raw SQL query to be more resilient to schema issues
        await this.pool.query(
          `UPDATE users SET login_attempts = $1 WHERE id = $2`,
          [newAttempts, user.id]
        );
        return newAttempts;
      } catch (err) {
        // Column might not exist yet - just log and continue
        console.warn("Note: login_attempts column may not exist yet. Migration needed.");
        return increment ? 1 : 0; // Return basic value to continue auth flow
      }
    } catch (error) {
      console.error(`Error updating login attempts for ${email}:`, error);
      return 0; // Allow login to proceed rather than throwing error
    }
  }
  
  async checkUserLocked(email: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        return false;
      }
      
      // If locked_until doesn't exist on the user object, assume not locked
      if (!user.locked_until) {
        return false;
      }
      
      const now = new Date();
      if (user.locked_until < now) {
        // Lock expired, try to unlock the account
        try {
          await this.unlockUserAccount(email);
        } catch (err) {
          console.warn("Note: Unable to unlock account, but continuing auth flow.");
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error checking if user ${email} is locked:`, error);
      return false; // Default to not locked so authentication can proceed
    }
  }
  
  async lockUserAccount(email: string, durationMinutes: number): Promise<void> {
    try {
      // First get the user
      const user = await this.getUserByEmail(email);
      if (!user) {
        return; // No user to lock
      }
      
      const now = new Date();
      const lockUntil = new Date(now.getTime() + durationMinutes * 60000);
      
      try {
        // Try raw SQL to be resilient to schema issues
        await this.pool.query(
          `UPDATE users SET locked_until = $1 WHERE id = $2`,
          [lockUntil, user.id]
        );
      } catch (err) {
        // Column might not exist yet
        console.warn("Note: locked_until column may not exist yet. Migration needed.");
      }
    } catch (error) {
      console.error(`Error locking account for ${email}:`, error);
      // Don't throw - allow auth flow to continue
    }
  }
  
  async unlockUserAccount(email: string): Promise<void> {
    try {
      // First get the user
      const user = await this.getUserByEmail(email);
      if (!user) {
        return; // No user to unlock
      }
      
      try {
        // Try to update login_attempts with raw SQL
        await this.pool.query(
          `UPDATE users SET login_attempts = 0 WHERE id = $1`,
          [user.id]
        );
      } catch (err) {
        console.warn("Note: login_attempts column may not exist yet. Migration needed.");
      }
      
      try {
        // Try to clear locked_until with raw SQL
        await this.pool.query(
          `UPDATE users SET locked_until = NULL WHERE id = $1`,
          [user.id]
        );
      } catch (err) {
        console.warn("Note: locked_until column may not exist yet. Migration needed.");
      }
    } catch (error) {
      console.error(`Error unlocking account for ${email}:`, error);
      // Don't throw - allow auth flow to continue
    }
  }
  
  async updateLastLogin(userId: number): Promise<void> {
    try {
      // Attempts to update but won't crash if columns don't exist
      try {
        const now = new Date();
        
        // Try to execute raw SQL to ensure it works even if columns don't exist yet
        await this.pool.query(
          `UPDATE users SET login_attempts = 0 WHERE id = $1`,
          [userId]
        );
        
        // We'll log success but not throw errors
        console.log(`Reset login attempts for user ${userId}`);
      } catch (err) {
        // Just log a warning but don't fail auth
        console.warn("Note: Some security columns may not exist yet. Migration needed.");
      }
    } catch (error) {
      console.error(`Error in updateLastLogin for user ${userId}:`, error);
      // Don't throw - allow authentication to continue
    }
  }
  
  async createPasswordResetToken(email: string): Promise<string | null> {
    try {
      // First get the user
      const user = await this.getUserByEmail(email);
      if (!user) {
        return null;
      }
      
      // Generate a random token
      const token = randomBytes(32).toString('hex');
      
      // Set token expiration (1 hour)
      const now = new Date();
      const expires = new Date(now.getTime() + 60 * 60 * 1000);
      
      try {
        // Try with raw SQL to handle potential missing columns
        await this.pool.query(
          `UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3`,
          [token, expires, user.id]
        );
        
        return token;
      } catch (err) {
        console.warn("Note: reset_token or reset_token_expires columns may not exist yet. Migration needed.");
        // Return token anyway so password reset flow isn't broken
        return token;
      }
    } catch (error) {
      console.error(`Error creating password reset token for ${email}:`, error);
      return null;
    }
  }
  
  async validatePasswordResetToken(email: string, token: string): Promise<boolean> {
    try {
      // First get the user
      const user = await this.getUserByEmail(email);
      if (!user) {
        return false;
      }
      
      // If token fields don't exist yet, we can't validate
      if (!user.reset_token || !user.reset_token_expires) {
        console.warn("Note: reset_token columns don't exist or aren't set. Migration needed.");
        return false;
      }
      
      const now = new Date();
      if (user.reset_token_expires < now) {
        return false;
      }
      
      return user.reset_token === token;
    } catch (error) {
      console.error(`Error validating password reset token for ${email}:`, error);
      return false;
    }
  }
  
  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    try {
      // First get the user
      const user = await this.getUserByEmail(email);
      if (!user) {
        return false;
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // First, update just the password which must exist
      await this.pool.query(
        `UPDATE users SET password = $1 WHERE id = $2`,
        [hashedPassword, user.id]
      );
      
      // Then try to reset the other security fields
      try {
        await this.pool.query(
          `UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = $1`,
          [user.id]
        );
      } catch (err) {
        console.warn("Note: reset_token columns may not exist yet. Migration needed.");
      }
      
      try {
        await this.pool.query(
          `UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = $1`,
          [user.id]
        );
      } catch (err) {
        console.warn("Note: login security columns may not exist yet. Migration needed.");
      }
      
      return true;
    } catch (error) {
      console.error(`Error resetting password for ${email}:`, error);
      return false;
    }
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
