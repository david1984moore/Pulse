import { 
  User, InsertUser, Bill, InsertBill, Income, InsertIncome 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface definition for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bill operations
  getBillsByUserId(userId: number): Promise<Bill[]>;
  createBill(bill: InsertBill): Promise<Bill>;
  deleteBill(billId: number): Promise<void>;
  
  // Income operations
  getIncomeByUserId(userId: number): Promise<Income[]>;
  createIncome(income: InsertIncome): Promise<Income>;
  deleteIncome(incomeId: number): Promise<void>;
  
  // Session store
  sessionStore: session.Store;
}

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
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Bill methods
  async getBillsByUserId(userId: number): Promise<Bill[]> {
    return Array.from(this.bills.values()).filter(
      (bill) => bill.user_id === userId
    );
  }

  async createBill(insertBill: InsertBill): Promise<Bill> {
    const id = this.billId++;
    const bill: Bill = { ...insertBill, id };
    this.bills.set(id, bill);
    return bill;
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
    const income: Income = { ...insertIncome, id };
    this.income.set(id, income);
    return income;
  }

  async deleteIncome(incomeId: number): Promise<void> {
    this.income.delete(incomeId);
  }
}

export const storage = new MemStorage();
