import {
  users,
  wallets,
  transactions,
  immigrationCases,
  chatMessages,
  type User,
  type UpsertUser,
  type Wallet,
  type InsertWallet,
  type Transaction,
  type InsertTransaction,
  type ImmigrationCase,
  type InsertImmigrationCase,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Wallet operations
  getUserWallets(userId: string): Promise<Wallet[]>;
  getWalletByCurrency(userId: string, currency: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(userId: string, currency: string, newBalance: string): Promise<Wallet>;
  
  // Transaction operations
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction>;
  
  // Immigration case operations
  getUserImmigrationCases(userId: string): Promise<ImmigrationCase[]>;
  createImmigrationCase(immigrationCase: InsertImmigrationCase): Promise<ImmigrationCase>;
  
  // Chat message operations
  getUserChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Wallet operations
  async getUserWallets(userId: string): Promise<Wallet[]> {
    return await db.select().from(wallets).where(eq(wallets.userId, userId));
  }

  async getWalletByCurrency(userId: string, currency: string): Promise<Wallet | undefined> {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.userId, userId), eq(wallets.currency, currency)));
    return wallet;
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [newWallet] = await db.insert(wallets).values(wallet).returning();
    return newWallet;
  }

  async updateWalletBalance(userId: string, currency: string, newBalance: string): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(and(eq(wallets.userId, userId), eq(wallets.currency, currency)))
      .returning();
    return wallet;
  }

  // Transaction operations
  async getUserTransactions(userId: string, limit: number = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  // Immigration case operations
  async getUserImmigrationCases(userId: string): Promise<ImmigrationCase[]> {
    return await db
      .select()
      .from(immigrationCases)
      .where(eq(immigrationCases.userId, userId))
      .orderBy(desc(immigrationCases.createdAt));
  }

  async createImmigrationCase(immigrationCase: InsertImmigrationCase): Promise<ImmigrationCase> {
    const [newCase] = await db.insert(immigrationCases).values(immigrationCase).returning();
    return newCase;
  }

  // Chat message operations
  async getUserChatMessages(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(chatMessage).returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
