import { pgTable, text, serial, integer, numeric, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  account_balance: numeric("account_balance", { precision: 10, scale: 2 }),
  last_balance_update: timestamp("last_balance_update"),
  created_at: timestamp("created_at").defaultNow()
});

// Relations for users (added at the end to avoid reference errors)
export const usersRelations = relations(users, ({ many }) => ({
  bills: many(bills),
  income: many(income)
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true
});

// Bill schema
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  due_date: integer("due_date").notNull(), // Day of month (1-31)
  created_at: timestamp("created_at").defaultNow()
});

// Relations for bills
export const billsRelations = relations(bills, ({ one }) => ({
  user: one(users, {
    fields: [bills.user_id],
    references: [users.id]
  })
}));

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  created_at: true
});

// Income schema
export const income = pgTable("income", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  source: text("source").notNull(), // Job name or income source
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: text("frequency").notNull(), // 'Weekly', 'Bi-weekly', 'Monthly', or 'Custom'
  created_at: timestamp("created_at").defaultNow()
});

// Relations for income
export const incomeRelations = relations(income, ({ one }) => ({
  user: one(users, {
    fields: [income.user_id],
    references: [users.id]
  })
}));

export const insertIncomeSchema = createInsertSchema(income).omit({
  id: true,
  created_at: true
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
  source: z.string().min(1, { message: "Please enter your job title or income source" }),
  amount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  frequency: z.enum(["Weekly", "Bi-weekly", "Monthly", "Custom"])
});
