import {
  users,
  wallets,
  virtualCards,
  transactions,
  immigrationCases,
  chatMessages,
  mentors,
  mentorSessions,
  communityEvents,
  eventRegistrations,
  insights,
  documentationServices,
  documentationOrders,
  flightBookings,
  educationalPayments,
  creditBuilders,
  creditPayments,
  loanPreQualifications,
  loanPartners,
  loanReferrals,
  referralRevenue,
  type User,
  type UpsertUser,
  type Wallet,
  type InsertWallet,
  type VirtualCard,
  type InsertVirtualCard,
  type UpdateVirtualCard,
  type Transaction,
  type InsertTransaction,
  type ImmigrationCase,
  type InsertImmigrationCase,
  type ChatMessage,
  type InsertChatMessage,
  type Mentor,
  type InsertMentor,
  type MentorSession,
  type InsertMentorSession,
  type CommunityEvent,
  type InsertEvent,
  type EducationalPayment,
  type InsertEducationalPayment,
  type CreditBuilder,
  type InsertCreditBuilder,
  type CreditPayment,
  type InsertCreditPayment,
  type LoanPreQualification,
  type InsertLoanPreQualification,
  type LoanPartner,
  type InsertLoanPartner,
  type LoanReferral,
  type InsertLoanReferral,
  type ReferralRevenue,
  type InsertReferralRevenue,
  type EventRegistration,
  type Insight,
  type InsertInsight,
  type DocumentationService,
  type InsertDocService,
  type DocumentationOrder,
  type InsertDocOrder,
  type FlightBooking,
  type InsertFlightBooking,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Custom authentication operations
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: any): Promise<User>;
  deleteUserByEmail?(email: string): Promise<void>;
  
  // Wallet operations
  getUserWallets(userId: string): Promise<Wallet[]>;
  getWalletByCurrency(userId: string, currency: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(userId: string, currency: string, newBalance: string): Promise<Wallet>;
  
  // Virtual Card operations
  getUserVirtualCards(userId: string): Promise<VirtualCard[]>;
  getVirtualCardsByWallet(walletId: number): Promise<VirtualCard[]>;
  createVirtualCard(virtualCard: InsertVirtualCard): Promise<VirtualCard>;
  updateVirtualCard(id: number, updates: UpdateVirtualCard): Promise<VirtualCard>;
  suspendVirtualCard(id: number): Promise<VirtualCard>;
  activateVirtualCard(id: number): Promise<VirtualCard>;
  
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
  
  // Community operations
  getMentors(): Promise<Mentor[]>;
  createMentor(mentor: InsertMentor): Promise<Mentor>;
  getCommunityEvents(): Promise<CommunityEvent[]>;
  createEvent(event: InsertEvent): Promise<CommunityEvent>;
  getInsights(): Promise<Insight[]>;
  createInsight(insight: InsertInsight): Promise<Insight>;
  
  // Documentation operations
  getDocumentationServices(): Promise<DocumentationService[]>;
  createDocumentationService(service: InsertDocService): Promise<DocumentationService>;
  getUserDocumentationOrders(userId: string): Promise<DocumentationOrder[]>;
  createDocumentationOrder(order: InsertDocOrder): Promise<DocumentationOrder>;
  updateDocumentationOrder(id: number, updates: Partial<DocumentationOrder>): Promise<DocumentationOrder>;
  
  // Flight operations
  getUserFlightBookings(userId: string): Promise<FlightBooking[]>;
  createFlightBooking(booking: InsertFlightBooking): Promise<FlightBooking>;
  updateFlightBooking(id: number, updates: Partial<FlightBooking>): Promise<FlightBooking>;
  
  // Loan operations
  getUserLoanApplications(userId: string): Promise<LoanApplication[]>;
  createLoanApplication(application: InsertLoanApplication): Promise<LoanApplication>;
  updateLoanApplication(id: number, updates: Partial<LoanApplication>): Promise<LoanApplication>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<UserProfile>;
  
  // Educational payment operations
  getUserEducationalPayments(userId: string): Promise<EducationalPayment[]>;
  createEducationalPayment(payment: InsertEducationalPayment): Promise<EducationalPayment>;
  
  // Credit builder operations
  getUserCreditBuilders(userId: string): Promise<CreditBuilder[]>;
  createCreditBuilder(builder: InsertCreditBuilder): Promise<CreditBuilder>;
  getUserCreditPayments(userId: string): Promise<CreditPayment[]>;
  createCreditPayment(payment: InsertCreditPayment): Promise<CreditPayment>;
  
  // Loan pre-qualification operations
  getUserLoanPreQualifications(userId: string): Promise<LoanPreQualification[]>;
  createLoanPreQualification(preQualification: InsertLoanPreQualification): Promise<LoanPreQualification>;
  
  // Loan referral operations
  getUserLoanReferrals(userId: string): Promise<LoanReferral[]>;
  createLoanReferral(referral: InsertLoanReferral): Promise<LoanReferral>;
  updateLoanReferralStatus(id: number, status: string): Promise<LoanReferral>;
  
  // Loan partner operations
  getActiveLoanPartners(): Promise<LoanPartner[]>;
  createLoanPartner(partner: InsertLoanPartner): Promise<LoanPartner>;
  
  // Revenue tracking operations
  getReferralRevenue(): Promise<ReferralRevenue[]>;
  createReferralRevenue(revenue: InsertReferralRevenue): Promise<ReferralRevenue>;
  
  // Concierge service operations
  getUserConciergeSubscription(userId: string): Promise<ConciergeSubscription | undefined>;
  createConciergeSubscription(subscription: InsertConciergeSubscription): Promise<ConciergeSubscription>;
  updateConciergeSubscription(id: number, updates: Partial<ConciergeSubscription>): Promise<ConciergeSubscription>;
  cancelConciergeSubscription(userId: string): Promise<ConciergeSubscription>;
  
  // Migration assistant operations
  getAvailableMigrationAssistants(): Promise<MigrationAssistant[]>;
  assignMigrationAssistant(subscriptionId: number, assistantId: number): Promise<ConciergeSubscription>;
  createMigrationAssistant(assistant: InsertMigrationAssistant): Promise<MigrationAssistant>;
  
  // Concierge interaction operations
  getUserConciergeInteractions(userId: string): Promise<ConciergeInteraction[]>;
  createConciergeInteraction(interaction: InsertConciergeInteraction): Promise<ConciergeInteraction>;
  updateConciergeInteraction(id: number, updates: Partial<ConciergeInteraction>): Promise<ConciergeInteraction>;
  
  // Audit log operations
  createConciergeAuditLog(log: InsertConciergeAudit): Promise<ConciergeAuditLog>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: any): Promise<User> {
    // Generate a unique ID for the user
    const userId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async deleteUserByEmail(email: string): Promise<void> {
    await db.delete(users).where(eq(users.email, email));
  }

  // MFA operations
  async updateUserMFASecret(userId: string, secret: string): Promise<void> {
    await db
      .update(users)
      .set({ totpSecret: secret, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async enableUserMFA(userId: string, backupCodes: string[]): Promise<void> {
    await db
      .update(users)
      .set({ 
        mfaEnabled: true, 
        backupCodes: backupCodes,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async disableUserMFA(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        mfaEnabled: false,
        totpSecret: null,
        backupCodes: null,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
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

  // Virtual Card operations
  async getUserVirtualCards(userId: string): Promise<VirtualCard[]> {
    return await db
      .select()
      .from(virtualCards)
      .where(eq(virtualCards.userId, userId))
      .orderBy(desc(virtualCards.createdAt));
  }

  async getVirtualCardsByWallet(walletId: number): Promise<VirtualCard[]> {
    return await db
      .select()
      .from(virtualCards)
      .where(eq(virtualCards.walletId, walletId))
      .orderBy(desc(virtualCards.createdAt));
  }

  async createVirtualCard(virtualCard: InsertVirtualCard): Promise<VirtualCard> {
    const [newCard] = await db.insert(virtualCards).values(virtualCard).returning();
    return newCard;
  }

  async updateVirtualCard(id: number, updates: UpdateVirtualCard): Promise<VirtualCard> {
    const [updatedCard] = await db
      .update(virtualCards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(virtualCards.id, id))
      .returning();
    return updatedCard;
  }

  async suspendVirtualCard(id: number): Promise<VirtualCard> {
    const [suspendedCard] = await db
      .update(virtualCards)
      .set({ status: 'suspended', updatedAt: new Date() })
      .where(eq(virtualCards.id, id))
      .returning();
    return suspendedCard;
  }

  async activateVirtualCard(id: number): Promise<VirtualCard> {
    const [activatedCard] = await db
      .update(virtualCards)
      .set({ status: 'active', updatedAt: new Date() })
      .where(eq(virtualCards.id, id))
      .returning();
    return activatedCard;
  }

  // Community operations
  async getMentors(): Promise<Mentor[]> {
    return await db.select().from(mentors).where(eq(mentors.isActive, true));
  }

  async createMentor(mentor: InsertMentor): Promise<Mentor> {
    const [newMentor] = await db.insert(mentors).values(mentor).returning();
    return newMentor;
  }

  async getCommunityEvents(): Promise<CommunityEvent[]> {
    return await db.select().from(communityEvents)
      .where(eq(communityEvents.isActive, true))
      .orderBy(communityEvents.eventDate);
  }

  async createEvent(event: InsertEvent): Promise<CommunityEvent> {
    const [newEvent] = await db.insert(communityEvents).values(event).returning();
    return newEvent;
  }

  async getInsights(): Promise<Insight[]> {
    return await db.select().from(insights)
      .where(eq(insights.isPublished, true))
      .orderBy(desc(insights.createdAt));
  }

  async createInsight(insight: InsertInsight): Promise<Insight> {
    const [newInsight] = await db.insert(insights).values(insight).returning();
    return newInsight;
  }

  // Documentation operations
  async getDocumentationServices(): Promise<DocumentationService[]> {
    return await db.select().from(documentationServices)
      .where(eq(documentationServices.isActive, true));
  }

  async createDocumentationService(service: InsertDocService): Promise<DocumentationService> {
    const [newService] = await db.insert(documentationServices).values(service).returning();
    return newService;
  }

  async getUserDocumentationOrders(userId: string): Promise<DocumentationOrder[]> {
    return await db.select({
      id: documentationOrders.id,
      userId: documentationOrders.userId,
      serviceId: documentationOrders.serviceId,
      orderNumber: documentationOrders.orderNumber,
      status: documentationOrders.status,
      amount: documentationOrders.amount,
      stripePaymentId: documentationOrders.stripePaymentId,
      deliveryDetails: documentationOrders.deliveryDetails,
      createdAt: documentationOrders.createdAt,
      updatedAt: documentationOrders.updatedAt,
      service: {
        id: documentationServices.id,
        name: documentationServices.name,
        description: documentationServices.description,
        price: documentationServices.price,
        processingTime: documentationServices.processingTime,
      }
    })
    .from(documentationOrders)
    .leftJoin(documentationServices, eq(documentationOrders.serviceId, documentationServices.id))
    .where(eq(documentationOrders.userId, userId))
    .orderBy(desc(documentationOrders.createdAt));
  }

  async createDocumentationOrder(order: InsertDocOrder): Promise<DocumentationOrder> {
    const [newOrder] = await db.insert(documentationOrders).values(order).returning();
    return newOrder;
  }

  async updateDocumentationOrder(id: number, updates: Partial<DocumentationOrder>): Promise<DocumentationOrder> {
    const [updatedOrder] = await db.update(documentationOrders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documentationOrders.id, id))
      .returning();
    return updatedOrder;
  }

  // Flight operations
  async getUserFlightBookings(userId: string): Promise<FlightBooking[]> {
    return await db.select().from(flightBookings)
      .where(eq(flightBookings.userId, userId))
      .orderBy(desc(flightBookings.createdAt));
  }

  async createFlightBooking(booking: InsertFlightBooking): Promise<FlightBooking> {
    const [newBooking] = await db.insert(flightBookings).values(booking).returning();
    return newBooking;
  }

  async updateFlightBooking(id: number, updates: Partial<FlightBooking>): Promise<FlightBooking> {
    const [updatedBooking] = await db.update(flightBookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(flightBookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Loan operations
  async getUserLoanApplications(userId: string): Promise<LoanApplication[]> {
    return await db.select().from(loanApplications).where(eq(loanApplications.userId, userId)).orderBy(desc(loanApplications.createdAt));
  }

  async createLoanApplication(application: InsertLoanApplication): Promise<LoanApplication> {
    const [newApplication] = await db
      .insert(loanApplications)
      .values(application)
      .returning();
    return newApplication;
  }

  async updateLoanApplication(id: number, updates: Partial<LoanApplication>): Promise<LoanApplication> {
    const [application] = await db
      .update(loanApplications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(loanApplications.id, id))
      .returning();
    return application;
  }

  // User profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<UserProfile> {
    const existingProfile = await this.getUserProfile(userId);
    
    if (existingProfile) {
      const [profile] = await db
        .update(userProfiles)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(userProfiles.userId, userId))
        .returning();
      return profile;
    } else {
      // Create new profile if doesn't exist
      const [profile] = await db
        .insert(userProfiles)
        .values({ userId, ...updates })
        .returning();
      return profile;
    }
  }
  // Educational payment operations
  async getUserEducationalPayments(userId: string): Promise<EducationalPayment[]> {
    return await db
      .select()
      .from(educationalPayments)
      .where(eq(educationalPayments.userId, userId))
      .orderBy(desc(educationalPayments.createdAt));
  }

  async createEducationalPayment(payment: InsertEducationalPayment): Promise<EducationalPayment> {
    const [newPayment] = await db.insert(educationalPayments).values(payment).returning();
    return newPayment;
  }

  // Credit builder operations
  async getUserCreditBuilders(userId: string): Promise<CreditBuilder[]> {
    return await db
      .select()
      .from(creditBuilders)
      .where(eq(creditBuilders.userId, userId))
      .orderBy(desc(creditBuilders.createdAt));
  }

  async createCreditBuilder(builder: InsertCreditBuilder): Promise<CreditBuilder> {
    const [newBuilder] = await db.insert(creditBuilders).values(builder).returning();
    return newBuilder;
  }

  async getUserCreditPayments(userId: string): Promise<CreditPayment[]> {
    return await db
      .select()
      .from(creditPayments)
      .where(eq(creditPayments.userId, userId))
      .orderBy(desc(creditPayments.createdAt));
  }

  async createCreditPayment(payment: InsertCreditPayment): Promise<CreditPayment> {
    const [newPayment] = await db.insert(creditPayments).values(payment).returning();
    return newPayment;
  }

  // Loan pre-qualification operations
  async getUserLoanPreQualifications(userId: string): Promise<LoanPreQualification[]> {
    return await db
      .select()
      .from(loanPreQualifications)
      .where(eq(loanPreQualifications.userId, userId))
      .orderBy(desc(loanPreQualifications.createdAt));
  }

  async createLoanPreQualification(preQualification: InsertLoanPreQualification): Promise<LoanPreQualification> {
    const [newPreQualification] = await db
      .insert(loanPreQualifications)
      .values(preQualification)
      .returning();
    return newPreQualification;
  }

  // Loan referral operations
  async getUserLoanReferrals(userId: string): Promise<LoanReferral[]> {
    return await db
      .select()
      .from(loanReferrals)
      .where(eq(loanReferrals.userId, userId))
      .orderBy(desc(loanReferrals.createdAt));
  }

  async createLoanReferral(referral: InsertLoanReferral): Promise<LoanReferral> {
    const [newReferral] = await db
      .insert(loanReferrals)
      .values(referral)
      .returning();
    return newReferral;
  }

  async updateLoanReferralStatus(id: number, status: string): Promise<LoanReferral> {
    const [updatedReferral] = await db
      .update(loanReferrals)
      .set({ status, updatedAt: new Date() })
      .where(eq(loanReferrals.id, id))
      .returning();
    return updatedReferral;
  }

  // Loan partner operations
  async getActiveLoanPartners(): Promise<LoanPartner[]> {
    return await db
      .select()
      .from(loanPartners)
      .where(eq(loanPartners.isActive, true))
      .orderBy(loanPartners.name);
  }

  async createLoanPartner(partner: InsertLoanPartner): Promise<LoanPartner> {
    const [newPartner] = await db
      .insert(loanPartners)
      .values(partner)
      .returning();
    return newPartner;
  }

  // Revenue tracking operations
  async getReferralRevenue(): Promise<ReferralRevenue[]> {
    return await db
      .select()
      .from(referralRevenue)
      .orderBy(desc(referralRevenue.createdAt));
  }

  async createReferralRevenue(revenue: InsertReferralRevenue): Promise<ReferralRevenue> {
    const [newRevenue] = await db
      .insert(referralRevenue)
      .values(revenue)
      .returning();
    return newRevenue;
  }

  // Concierge service operations
  async getUserConciergeSubscription(userId: string): Promise<ConciergeSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(conciergeSubscriptions)
      .where(eq(conciergeSubscriptions.userId, userId))
      .orderBy(desc(conciergeSubscriptions.createdAt))
      .limit(1);
    return subscription;
  }

  async createConciergeSubscription(subscription: InsertConciergeSubscription): Promise<ConciergeSubscription> {
    const [newSubscription] = await db
      .insert(conciergeSubscriptions)
      .values(subscription)
      .returning();
    return newSubscription;
  }

  async updateConciergeSubscription(id: number, updates: Partial<ConciergeSubscription>): Promise<ConciergeSubscription> {
    const [updatedSubscription] = await db
      .update(conciergeSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conciergeSubscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  async cancelConciergeSubscription(userId: string): Promise<ConciergeSubscription> {
    const [cancelledSubscription] = await db
      .update(conciergeSubscriptions)
      .set({ 
        status: 'cancelled', 
        cancelAtPeriodEnd: true,
        updatedAt: new Date() 
      })
      .where(eq(conciergeSubscriptions.userId, userId))
      .returning();
    return cancelledSubscription;
  }

  // Migration assistant operations
  async getAvailableMigrationAssistants(): Promise<MigrationAssistant[]> {
    return await db
      .select()
      .from(migrationAssistants)
      .where(eq(migrationAssistants.isActive, true))
      .orderBy(migrationAssistants.rating);
  }

  async assignMigrationAssistant(subscriptionId: number, assistantId: number): Promise<ConciergeSubscription> {
    const [assistant] = await db
      .select()
      .from(migrationAssistants)
      .where(eq(migrationAssistants.id, assistantId));

    const [updatedSubscription] = await db
      .update(conciergeSubscriptions)
      .set({ 
        assignedMigrationAssistant: assistant.name,
        assistantContactInfo: {
          name: assistant.name,
          email: assistant.email,
          phone: assistant.phone
        },
        updatedAt: new Date() 
      })
      .where(eq(conciergeSubscriptions.id, subscriptionId))
      .returning();

    // Update assistant's current client count
    await db
      .update(migrationAssistants)
      .set({ 
        currentClients: sql`${migrationAssistants.currentClients} + 1`,
        updatedAt: new Date()
      })
      .where(eq(migrationAssistants.id, assistantId));

    return updatedSubscription;
  }

  async createMigrationAssistant(assistant: InsertMigrationAssistant): Promise<MigrationAssistant> {
    const [newAssistant] = await db
      .insert(migrationAssistants)
      .values(assistant)
      .returning();
    return newAssistant;
  }

  // Concierge interaction operations
  async getUserConciergeInteractions(userId: string): Promise<ConciergeInteraction[]> {
    return await db
      .select()
      .from(conciergeInteractions)
      .where(eq(conciergeInteractions.userId, userId))
      .orderBy(desc(conciergeInteractions.createdAt));
  }

  async createConciergeInteraction(interaction: InsertConciergeInteraction): Promise<ConciergeInteraction> {
    const [newInteraction] = await db
      .insert(conciergeInteractions)
      .values(interaction)
      .returning();
    return newInteraction;
  }

  async updateConciergeInteraction(id: number, updates: Partial<ConciergeInteraction>): Promise<ConciergeInteraction> {
    const [updatedInteraction] = await db
      .update(conciergeInteractions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conciergeInteractions.id, id))
      .returning();
    return updatedInteraction;
  }

  // Audit log operations
  async createConciergeAuditLog(log: InsertConciergeAudit): Promise<ConciergeAuditLog> {
    const [newLog] = await db
      .insert(conciergeAuditLog)
      .values(log)
      .returning();
    return newLog;
  }

  // MFA and Security Management Methods
  async updateUserMFA(userId: string, mfaData: {
    mfaEnabled?: boolean;
    totpSecret?: string | null;
    backupCodes?: string[] | null;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        mfaEnabled: mfaData.mfaEnabled,
        totpSecret: mfaData.totpSecret,
        backupCodes: mfaData.backupCodes,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        role,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async logSecurityEvent(eventData: {
    userId?: string;
    eventType: string;
    severity: string;
    description?: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await db
      .insert(securityEvents)
      .values({
        userId: eventData.userId,
        eventType: eventData.eventType,
        severity: eventData.severity,
        description: eventData.description,
        metadata: eventData.metadata,
        ipAddress: eventData.ipAddress,
        userAgent: eventData.userAgent
      });
  }

  async getSecurityEvents(): Promise<SecurityEvent[]> {
    return await db
      .select()
      .from(securityEvents)
      .orderBy(desc(securityEvents.timestamp))
      .limit(50);
  }

  async getAccessLogs(userId?: string): Promise<AccessLog[]> {
    const query = db
      .select()
      .from(accessLogs)
      .orderBy(desc(accessLogs.timestamp))
      .limit(100);

    if (userId) {
      return await query.where(eq(accessLogs.userId, userId));
    }

    return await query;
  }

  async logAccess(accessData: {
    userId?: string;
    action: string;
    resource: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
  }): Promise<void> {
    await db
      .insert(accessLogs)
      .values(accessData);
  }
}

export const storage = new DatabaseStorage();
