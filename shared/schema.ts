import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wallets table for virtual wallet functionality
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  currency: varchar("currency").notNull(), // NGN, GBP
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions table for financial transaction history
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // transfer, deposit, withdrawal, fee
  fromCurrency: varchar("from_currency"),
  toCurrency: varchar("to_currency"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  convertedAmount: decimal("converted_amount", { precision: 15, scale: 2 }),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }),
  fee: decimal("fee", { precision: 15, scale: 2 }).default("0.00"),
  status: varchar("status").notNull().default("pending"), // pending, completed, failed
  description: text("description"),
  recipientEmail: varchar("recipient_email"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Immigration cases table
export const immigrationCases = pgTable("immigration_cases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  caseNumber: varchar("case_number").notNull().unique(),
  type: varchar("type").notNull(), // student, work, family
  status: varchar("status").notNull().default("active"), // active, completed, pending
  country: varchar("country").notNull().default("UK"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table for AI assistant
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  isFromUser: boolean("is_from_user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  transactions: many(transactions),
  immigrationCases: many(immigrationCases),
  chatMessages: many(chatMessages),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const immigrationCasesRelations = relations(immigrationCases, ({ one }) => ({
  user: one(users, {
    fields: [immigrationCases.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertImmigrationCaseSchema = createInsertSchema(immigrationCases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const transferSchema = z.object({
  fromCurrency: z.string(),
  toCurrency: z.string(),
  amount: z.string().min(1),
  recipient: z.string().email(),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type ImmigrationCase = typeof immigrationCases.$inferSelect;
export type InsertImmigrationCase = z.infer<typeof insertImmigrationCaseSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type TransferRequest = z.infer<typeof transferSchema>;
