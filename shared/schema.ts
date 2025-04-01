import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
});

// Bill schema
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  due_date: integer("due_date").notNull(), // Day of month (1-31)
});

export const insertBillSchema = createInsertSchema(bills).pick({
  user_id: true,
  name: true,
  amount: true,
  due_date: true,
});

// Income schema
export const income = pgTable("income", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: text("frequency").notNull(), // 'Weekly', 'Bi-weekly', 'Monthly', or 'Custom'
});

export const insertIncomeSchema = createInsertSchema(income).pick({
  user_id: true,
  amount: true,
  frequency: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;

export type Income = typeof income.$inferSelect;
export type InsertIncome = z.infer<typeof insertIncomeSchema>;

// Extend the schemas with additional validation
export const userAuthSchema = insertUserSchema.extend({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const billFormSchema = insertBillSchema.omit({ user_id: true }).extend({
  amount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  due_date: z.number().min(1).max(31)
});

export const incomeFormSchema = insertIncomeSchema.omit({ user_id: true }).extend({
  amount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  frequency: z.enum(["Weekly", "Bi-weekly", "Monthly", "Custom"])
});
