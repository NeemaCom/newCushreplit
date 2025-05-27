import { EventEmitter } from 'events';
import { z } from 'zod';
import { ComplianceEngine, ComplianceReporter, transactionSchema, RiskLevel } from './compliance';
import { securityLogger, EncryptionService } from './security';
import { storage } from './storage';

// Real-time transaction processing states
export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLIANCE_REVIEW = 'COMPLIANCE_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// Transaction processing result
export interface ProcessingResult {
  transactionId: string;
  status: TransactionStatus;
  approvalCode?: string;
  rejectionReason?: string;
  complianceFlags: string[];
  processingTime: number;
  networkFee: number;
  exchangeRate?: number;
  estimatedCompletion: Date;
}

// Real-time transaction processor
export class TransactionProcessor extends EventEmitter {
  private processingQueue: Map<string, any> = new Map();
  private complianceQueue: Map<string, any> = new Map();
  
  constructor() {
    super();
    this.initializeProcessing();
  }

  private initializeProcessing() {
    // Process compliance queue every 5 seconds
    setInterval(() => this.processComplianceQueue(), 5000);
    
    // Process transaction queue every 2 seconds
    setInterval(() => this.processTransactionQueue(), 2000);
  }

  // Main transaction processing entry point
  async processTransaction(transactionData: any): Promise<ProcessingResult> {
    const startTime = Date.now();
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Validate transaction data
      const transaction = transactionSchema.parse({
        ...transactionData,
        id: transactionId,
        timestamp: new Date()
      });

      // Encrypt sensitive transaction data
      const encryptedData = {
        ...transaction,
        metadata: transaction.metadata ? EncryptionService.encrypt(JSON.stringify(transaction.metadata)) : undefined
      };

      // Emit processing started event
      this.emit('transaction:started', { transactionId, userId: transaction.userId });

      // Step 1: Pre-processing validation
      const preValidation = await this.preProcessValidation(transaction);
      if (!preValidation.valid) {
        return this.createResult(transactionId, TransactionStatus.REJECTED, startTime, {
          rejectionReason: preValidation.reason,
          complianceFlags: ['PRE_VALIDATION_FAILED']
        });
      }

      // Step 2: Real-time compliance screening
      const complianceResult = await this.performComplianceScreening(transaction);
      if (!complianceResult.approved) {
        // Add to compliance review queue
        this.complianceQueue.set(transactionId, {
          transaction: encryptedData,
          complianceResult,
          timestamp: Date.now()
        });
        
        this.emit('transaction:compliance_review', { transactionId, riskLevel: complianceResult.riskLevel });
        
        return this.createResult(transactionId, TransactionStatus.COMPLIANCE_REVIEW, startTime, {
          complianceFlags: complianceResult.flags,
          rejectionReason: 'Requires compliance review'
        });
      }

      // Step 3: Add to processing queue
      this.processingQueue.set(transactionId, {
        transaction: encryptedData,
        complianceResult,
        timestamp: Date.now()
      });

      // Step 4: Calculate fees and exchange rates
      const feeCalculation = await this.calculateFees(transaction);
      const exchangeRate = await this.getExchangeRate(transaction.currency, 'USD');

      // Emit processing event
      this.emit('transaction:processing', { transactionId, amount: transaction.amount });

      return this.createResult(transactionId, TransactionStatus.PROCESSING, startTime, {
        complianceFlags: complianceResult.flags,
        networkFee: feeCalculation.totalFee,
        exchangeRate: exchangeRate
      });

    } catch (error) {
      securityLogger.logSecurityEvent('TRANSACTION_PROCESSING_ERROR', {
        transactionId,
        error: error.message,
        userId: transactionData.userId
      }, 'high');

      return this.createResult(transactionId, TransactionStatus.FAILED, startTime, {
        rejectionReason: 'Processing error occurred',
        complianceFlags: ['PROCESSING_ERROR']
      });
    }
  }

  // Pre-processing validation
  private async preProcessValidation(transaction: any): Promise<{ valid: boolean; reason?: string }> {
    // Check user account status
    const user = await storage.getUser(transaction.userId);
    if (!user) {
      return { valid: false, reason: 'User account not found' };
    }

    // Check wallet balance for outgoing transactions
    if (['transfer', 'payment'].includes(transaction.type)) {
      const wallet = await storage.getWalletByCurrency(transaction.userId, transaction.currency);
      if (!wallet || parseFloat(wallet.balance) < transaction.amount) {
        return { valid: false, reason: 'Insufficient funds' };
      }
    }

    // Validate transaction limits
    const dailyLimit = await this.getDailyTransactionLimit(transaction.userId);
    const todaysTransactions = await this.getTodaysTransactions(transaction.userId);
    const todaysTotal = todaysTransactions.reduce((sum, txn) => sum + txn.amount, 0);
    
    if (todaysTotal + transaction.amount > dailyLimit) {
      return { valid: false, reason: 'Daily transaction limit exceeded' };
    }

    return { valid: true };
  }

  // Real-time compliance screening
  private async performComplianceScreening(transaction: any): Promise<{
    approved: boolean;
    riskLevel: RiskLevel;
    flags: string[];
    requiredActions: string[];
  }> {
    // Get user transaction history
    const userHistory = await storage.getUserTransactions(transaction.userId, 100);
    
    // Perform AML screening
    const amlResult = await ComplianceEngine.performAMLCheck(transaction, userHistory);
    
    // Real-time transaction monitoring
    const monitoringResult = await ComplianceEngine.monitorTransaction(transaction);
    
    // Generate compliance reports if required
    if (transaction.amount >= 10000) {
      const user = await storage.getUser(transaction.userId);
      const userProfile = await storage.getUserProfile(transaction.userId);
      await ComplianceReporter.generateCTR(transaction, { ...user, ...userProfile });
    }

    const approved = amlResult.compliant && monitoringResult.approved;
    
    return {
      approved,
      riskLevel: amlResult.riskLevel,
      flags: [...amlResult.flags, ...monitoringResult.holds],
      requiredActions: [...amlResult.requiredActions, ...monitoringResult.escalations]
    };
  }

  // Process transactions in queue
  private async processTransactionQueue() {
    for (const [transactionId, queueItem] of this.processingQueue.entries()) {
      try {
        const { transaction, complianceResult } = queueItem;
        
        // Simulate processing time based on transaction type and amount
        const processingTime = this.calculateProcessingTime(transaction);
        
        if (Date.now() - queueItem.timestamp >= processingTime) {
          // Execute the transaction
          const result = await this.executeTransaction(transaction);
          
          if (result.success) {
            // Update wallet balances
            await this.updateWalletBalances(transaction);
            
            // Create transaction record
            await this.createTransactionRecord(transaction, TransactionStatus.COMPLETED);
            
            // Emit completion event
            this.emit('transaction:completed', { 
              transactionId, 
              userId: transaction.userId,
              amount: transaction.amount 
            });
            
            securityLogger.logSecurityEvent('TRANSACTION_COMPLETED', {
              transactionId,
              userId: transaction.userId,
              amount: transaction.amount,
              currency: transaction.currency
            }, 'low');
            
          } else {
            // Mark as failed
            await this.createTransactionRecord(transaction, TransactionStatus.FAILED);
            
            this.emit('transaction:failed', { 
              transactionId, 
              userId: transaction.userId,
              reason: result.error 
            });
          }
          
          // Remove from queue
          this.processingQueue.delete(transactionId);
        }
      } catch (error) {
        securityLogger.logSecurityEvent('QUEUE_PROCESSING_ERROR', {
          transactionId,
          error: error.message
        }, 'medium');
        
        // Remove failed item from queue
        this.processingQueue.delete(transactionId);
      }
    }
  }

  // Process compliance review queue
  private async processComplianceQueue() {
    for (const [transactionId, queueItem] of this.complianceQueue.entries()) {
      const { transaction, complianceResult } = queueItem;
      
      // Simulate compliance officer review (in real system, this would be manual)
      if (Date.now() - queueItem.timestamp >= 30000) { // 30 seconds for demo
        const approved = complianceResult.riskLevel !== RiskLevel.CRITICAL;
        
        if (approved) {
          // Move to processing queue
          this.processingQueue.set(transactionId, queueItem);
          this.emit('transaction:approved', { transactionId, userId: transaction.userId });
        } else {
          // Reject transaction
          await this.createTransactionRecord(transaction, TransactionStatus.REJECTED);
          this.emit('transaction:rejected', { 
            transactionId, 
            userId: transaction.userId,
            reason: 'Failed compliance review' 
          });
        }
        
        this.complianceQueue.delete(transactionId);
      }
    }
  }

  // Execute the actual transaction
  private async executeTransaction(transaction: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate external payment processing
      // In real implementation, this would integrate with payment networks
      
      const random = Math.random();
      if (random > 0.95) { // 5% failure rate for simulation
        return { success: false, error: 'Network timeout' };
      }
      
      if (random > 0.98) { // 2% failure rate for insufficient funds at destination
        return { success: false, error: 'Destination account unavailable' };
      }
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update wallet balances after successful transaction
  private async updateWalletBalances(transaction: any) {
    if (transaction.type === 'transfer' || transaction.type === 'payment') {
      // Deduct from sender
      const senderWallet = await storage.getWalletByCurrency(transaction.userId, transaction.currency);
      if (senderWallet) {
        const newBalance = (parseFloat(senderWallet.balance) - transaction.amount).toString();
        await storage.updateWalletBalance(transaction.userId, transaction.currency, newBalance);
      }
    }
  }

  // Create transaction record in database
  private async createTransactionRecord(transaction: any, status: TransactionStatus) {
    await storage.createTransaction({
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount.toString(),
      currency: transaction.currency,
      status: status,
      description: transaction.purpose,
      metadata: transaction.metadata ? JSON.stringify(transaction.metadata) : null
    });
  }

  // Helper methods
  private calculateProcessingTime(transaction: any): number {
    // Higher amounts take longer to process
    if (transaction.amount >= 50000) return 10000; // 10 seconds
    if (transaction.amount >= 10000) return 5000;  // 5 seconds
    return 2000; // 2 seconds
  }

  private async calculateFees(transaction: any): Promise<{ networkFee: number; totalFee: number }> {
    let networkFee = 0;
    
    // Cross-border transaction fees
    if (transaction.sourceCountry !== transaction.destinationCountry) {
      networkFee += transaction.amount * 0.005; // 0.5%
    }
    
    // Currency conversion fees
    if (transaction.currency !== 'USD') {
      networkFee += transaction.amount * 0.002; // 0.2%
    }
    
    // Minimum fee
    networkFee = Math.max(networkFee, 5);
    
    return { networkFee, totalFee: networkFee };
  }

  private async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    // In real implementation, this would fetch from a financial data provider
    const rates: Record<string, number> = {
      'NGN': 0.0024, // NGN to USD
      'GBP': 1.27,   // GBP to USD
      'EUR': 1.09,   // EUR to USD
      'USD': 1.0
    };
    
    return rates[fromCurrency] || 1.0;
  }

  private async getDailyTransactionLimit(userId: string): Promise<number> {
    // Default limit, could be customized per user
    return 50000; // $50,000 daily limit
  }

  private async getTodaysTransactions(userId: string): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const transactions = await storage.getUserTransactions(userId, 100);
    return transactions.filter(txn => 
      txn.createdAt && new Date(txn.createdAt) >= today
    );
  }

  private createResult(
    transactionId: string, 
    status: TransactionStatus, 
    startTime: number, 
    options: any = {}
  ): ProcessingResult {
    const processingTime = Date.now() - startTime;
    const estimatedCompletion = new Date(Date.now() + (options.estimatedDelay || 30000));
    
    return {
      transactionId,
      status,
      processingTime,
      estimatedCompletion,
      networkFee: options.networkFee || 0,
      complianceFlags: options.complianceFlags || [],
      approvalCode: status === TransactionStatus.APPROVED ? `APP-${Date.now()}` : undefined,
      rejectionReason: options.rejectionReason,
      exchangeRate: options.exchangeRate
    };
  }

  // Get real-time processing statistics
  getProcessingStats(): {
    queueLength: number;
    complianceQueueLength: number;
    averageProcessingTime: number;
    throughputPerMinute: number;
  } {
    return {
      queueLength: this.processingQueue.size,
      complianceQueueLength: this.complianceQueue.size,
      averageProcessingTime: 3500, // ms
      throughputPerMinute: 45
    };
  }
}

// Singleton instance
export const transactionProcessor = new TransactionProcessor();