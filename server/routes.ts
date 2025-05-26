import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getImmigrationAssistance, analyzeTransactionRisk } from "./openai";
import { transferSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard data endpoint
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user wallets
      let wallets = await storage.getUserWallets(userId);
      
      // Initialize wallets if they don't exist
      if (wallets.length === 0) {
        await storage.createWallet({
          userId,
          currency: 'NGN',
          balance: '245000.00'
        });
        await storage.createWallet({
          userId,
          currency: 'GBP',
          balance: '1850.00'
        });
        wallets = await storage.getUserWallets(userId);
      }

      // Get recent transactions
      const transactions = await storage.getUserTransactions(userId, 5);
      
      // Get immigration cases
      let immigrationCases = await storage.getUserImmigrationCases(userId);
      
      // Initialize immigration case if none exist
      if (immigrationCases.length === 0) {
        await storage.createImmigrationCase({
          userId,
          caseNumber: `UK-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          type: 'student',
          status: 'active',
          country: 'UK'
        });
        immigrationCases = await storage.getUserImmigrationCases(userId);
      }

      res.json({
        wallets,
        transactions,
        immigrationCases,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Transfer money endpoint
  app.post('/api/transfer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transferData = transferSchema.parse(req.body);
      
      const amount = parseFloat(transferData.amount);
      const exchangeRate = 1850; // 1 GBP = 1850 NGN
      const fee = 2500; // Fixed fee in NGN
      
      // Check wallet balance
      const fromWallet = await storage.getWalletByCurrency(userId, transferData.fromCurrency);
      if (!fromWallet || parseFloat(fromWallet.balance) < amount + fee) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // Risk analysis
      const riskAnalysis = await analyzeTransactionRisk({
        amount,
        recipient: transferData.recipient,
        currency: transferData.fromCurrency
      });

      const convertedAmount = transferData.fromCurrency === 'NGN' 
        ? (amount / exchangeRate).toFixed(2)
        : (amount * exchangeRate).toFixed(2);

      // Create transaction
      const transaction = await storage.createTransaction({
        userId,
        type: 'transfer',
        fromCurrency: transferData.fromCurrency,
        toCurrency: transferData.toCurrency,
        amount: amount.toString(),
        convertedAmount,
        exchangeRate: exchangeRate.toString(),
        fee: fee.toString(),
        status: riskAnalysis.approved ? 'completed' : 'pending',
        description: `Transfer to ${transferData.recipient}`,
        recipientEmail: transferData.recipient,
      });

      // Update wallet balance if approved
      if (riskAnalysis.approved) {
        const newBalance = (parseFloat(fromWallet.balance) - amount - fee).toFixed(2);
        await storage.updateWalletBalance(userId, transferData.fromCurrency, newBalance);
      }

      res.json({
        transaction,
        riskAnalysis,
        message: riskAnalysis.approved 
          ? "Transfer completed successfully" 
          : "Transfer is pending security review"
      });
    } catch (error) {
      console.error("Error processing transfer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transfer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process transfer" });
    }
  });

  // Chat with AI assistant
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Get user context
      const [immigrationCases, transactions] = await Promise.all([
        storage.getUserImmigrationCases(userId),
        storage.getUserTransactions(userId, 3)
      ]);

      // Save user message
      await storage.createChatMessage({
        userId,
        message,
        isFromUser: true,
      });

      // Get AI response
      const response = await getImmigrationAssistance(message, {
        immigrationCases,
        transactions
      });

      // Save AI response
      await storage.createChatMessage({
        userId,
        message: response,
        response: message,
        isFromUser: false,
      });

      res.json({ response });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Get chat history
  app.get('/api/chat/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getUserChatMessages(userId, 20);
      res.json(messages.reverse()); // Return in chronological order
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Get user transactions
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
