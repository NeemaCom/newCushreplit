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
  currency: varchar("currency").notNull(), // NGN, GBP, USD, EUR
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Virtual cards table for card functionality
export const virtualCards = pgTable("virtual_cards", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  cardNumber: varchar("card_number").notNull().unique(),
  expiryMonth: varchar("expiry_month").notNull(),
  expiryYear: varchar("expiry_year").notNull(),
  cvv: varchar("cvv").notNull(),
  cardHolderName: varchar("card_holder_name").notNull(),
  cardType: varchar("card_type").notNull().default("virtual"), // virtual, physical
  status: varchar("status").notNull().default("active"), // active, suspended, expired
  spendingLimit: decimal("spending_limit", { precision: 15, scale: 2 }).default("1000.00"),
  currency: varchar("currency").notNull(),
  issuer: varchar("issuer").default("Cush Financial"),
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

// Mentors table for community section
export const mentors = pgTable("mentors", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  expertise: varchar("expertise").notNull(),
  bio: text("bio"),
  profileImage: varchar("profile_image"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  availability: jsonb("availability").default("{}"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mentor sessions table
export const mentorSessions = pgTable("mentor_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  mentorId: integer("mentor_id").notNull().references(() => mentors.id),
  sessionDate: timestamp("session_date").notNull(),
  duration: integer("duration").notNull().default(60), // minutes
  status: varchar("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  meetingLink: varchar("meeting_link"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community events table
export const communityEvents = pgTable("community_events", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  location: varchar("location"),
  isVirtual: boolean("is_virtual").default(true),
  meetingLink: varchar("meeting_link"),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event registrations table
export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => communityEvents.id),
  registeredAt: timestamp("registered_at").defaultNow(),
});

// Insights/articles table
export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: varchar("category").notNull(), // visa-guide, tips, news
  author: varchar("author").notNull(),
  featuredImage: varchar("featured_image"),
  isPublished: boolean("is_published").default(true),
  readTime: integer("read_time").default(5), // minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documentation services table
export const documentationServices = pgTable("documentation_services", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  processingTime: varchar("processing_time"), // "5-7 business days"
  requirements: jsonb("requirements").default("[]"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Documentation orders table
export const documentationOrders = pgTable("documentation_orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  serviceId: integer("service_id").notNull().references(() => documentationServices.id),
  orderNumber: varchar("order_number").notNull().unique(),
  status: varchar("status").notNull().default("pending"), // pending, processing, completed, cancelled
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  stripePaymentId: varchar("stripe_payment_id"),
  deliveryDetails: jsonb("delivery_details").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Flight bookings table
export const flightBookings = pgTable("flight_bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  bookingReference: varchar("booking_reference").notNull().unique(),
  origin: varchar("origin").notNull(),
  destination: varchar("destination").notNull(),
  departureDate: timestamp("departure_date").notNull(),
  returnDate: timestamp("return_date"),
  passengers: integer("passengers").notNull().default(1),
  flightClass: varchar("flight_class").notNull().default("economy"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  cushMarkup: decimal("cush_markup", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, confirmed, cancelled
  airlineData: jsonb("airline_data").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const loanApplications = pgTable("loan_applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  loanType: varchar("loan_type").notNull(),
  amount: varchar("amount").notNull(),
  purpose: text("purpose").notNull(),
  duration: varchar("duration").notNull(),
  income: varchar("income").notNull(),
  employment: varchar("employment").notNull(),
  country: varchar("country").notNull(),
  
  // Personal Information
  fullName: varchar("full_name").notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  address: text("address").notNull(),
  
  // Financial Information
  bankName: varchar("bank_name").notNull(),
  accountNumber: varchar("account_number").notNull(),
  creditScore: varchar("credit_score"),
  
  // Application Status
  status: varchar("status").default("pending"),
  approvedAmount: varchar("approved_amount"),
  interestRate: varchar("interest_rate"),
  
  // Supporting Documents
  identificationDoc: varchar("identification_doc"),
  incomeProof: varchar("income_proof"),
  bankStatements: varchar("bank_statements"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  bio: text("bio"),
  phoneNumber: varchar("phone_number"),
  address: text("address"),
  dateOfBirth: varchar("date_of_birth"),
  nationality: varchar("nationality"),
  occupation: varchar("occupation"),
  company: varchar("company"),
  
  // Preferences
  timezone: varchar("timezone").default("UTC"),
  language: varchar("language").default("en"),
  currency: varchar("currency").default("GBP"),
  
  // Verification Status
  isPhoneVerified: boolean("is_phone_verified").default(false),
  isEmailVerified: boolean("is_email_verified").default(false),
  isIdentityVerified: boolean("is_identity_verified").default(false),
  
  // Custom avatar upload
  customAvatarUrl: varchar("custom_avatar_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Educational Fee Payments
export const educationalPayments = pgTable("educational_payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  paymentType: varchar("payment_type").notNull(), // 'tuition', 'sevis', 'wes'
  institutionName: varchar("institution_name").notNull(),
  studentId: varchar("student_id"),
  amount: varchar("amount").notNull(),
  currency: varchar("currency").notNull().default("USD"),
  status: varchar("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  paymentMethod: varchar("payment_method"), // 'bank_transfer', 'card', 'wallet'
  transactionId: varchar("transaction_id"),
  paymentReference: varchar("payment_reference"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata"), // Additional payment details
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credit Builder Solutions
export const creditBuilders = pgTable("credit_builders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  productType: varchar("product_type").notNull(), // 'secured_card', 'credit_builder_loan', 'authorized_user'
  providerName: varchar("provider_name").notNull(),
  accountNumber: varchar("account_number"),
  creditLimit: varchar("credit_limit"),
  interestRate: varchar("interest_rate"),
  monthlyPayment: varchar("monthly_payment"),
  status: varchar("status").notNull().default("active"), // 'active', 'closed', 'pending_approval'
  applicationDate: timestamp("application_date").defaultNow(),
  approvalDate: timestamp("approval_date"),
  currentBalance: varchar("current_balance").default("0.00"),
  paymentHistory: jsonb("payment_history"), // Track payment history
  creditScore: varchar("credit_score"), // User's current credit score
  scoreProvider: varchar("score_provider"), // 'experian', 'equifax', 'transunion'
  lastScoreUpdate: timestamp("last_score_update"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credit Builder Payments
export const creditPayments = pgTable("credit_payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  creditBuilderId: integer("credit_builder_id").references(() => creditBuilders.id),
  amount: varchar("amount").notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  status: varchar("status").notNull().default("pending"), // 'pending', 'completed', 'late', 'missed'
  paymentMethod: varchar("payment_method"),
  transactionId: varchar("transaction_id"),
  isAutoPay: boolean("is_auto_pay").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  wallets: many(wallets),
  virtualCards: many(virtualCards),
  transactions: many(transactions),
  immigrationCases: many(immigrationCases),
  chatMessages: many(chatMessages),
  mentorSessions: many(mentorSessions),
  eventRegistrations: many(eventRegistrations),
  documentationOrders: many(documentationOrders),
  flightBookings: many(flightBookings),
  loanApplications: many(loanApplications),
  educationalPayments: many(educationalPayments),
  creditBuilders: many(creditBuilders),
  creditPayments: many(creditPayments),
}));

export const mentorsRelations = relations(mentors, ({ many }) => ({
  sessions: many(mentorSessions),
}));

export const mentorSessionsRelations = relations(mentorSessions, ({ one }) => ({
  user: one(users, {
    fields: [mentorSessions.userId],
    references: [users.id],
  }),
  mentor: one(mentors, {
    fields: [mentorSessions.mentorId],
    references: [mentors.id],
  }),
}));

export const communityEventsRelations = relations(communityEvents, ({ many }) => ({
  registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id],
  }),
  event: one(communityEvents, {
    fields: [eventRegistrations.eventId],
    references: [communityEvents.id],
  }),
}));

export const documentationServicesRelations = relations(documentationServices, ({ many }) => ({
  orders: many(documentationOrders),
}));

export const documentationOrdersRelations = relations(documentationOrders, ({ one }) => ({
  user: one(users, {
    fields: [documentationOrders.userId],
    references: [users.id],
  }),
  service: one(documentationServices, {
    fields: [documentationOrders.serviceId],
    references: [documentationServices.id],
  }),
}));

export const flightBookingsRelations = relations(flightBookings, ({ one }) => ({
  user: one(users, {
    fields: [flightBookings.userId],
    references: [users.id],
  }),
}));

export const loanApplicationsRelations = relations(loanApplications, ({ one }) => ({
  user: one(users, {
    fields: [loanApplications.userId],
    references: [users.id],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  virtualCards: many(virtualCards),
}));

export const virtualCardsRelations = relations(virtualCards, ({ one }) => ({
  user: one(users, {
    fields: [virtualCards.userId],
    references: [users.id],
  }),
  wallet: one(wallets, {
    fields: [virtualCards.walletId],
    references: [wallets.id],
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

// New schemas for additional features
export const insertMentorSchema = createInsertSchema(mentors).omit({
  id: true,
  createdAt: true,
});

export const insertMentorSessionSchema = createInsertSchema(mentorSessions).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(communityEvents).omit({
  id: true,
  createdAt: true,
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocServiceSchema = createInsertSchema(documentationServices).omit({
  id: true,
  createdAt: true,
});

export const insertDocOrderSchema = createInsertSchema(documentationOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFlightBookingSchema = createInsertSchema(flightBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const flightSearchSchema = z.object({
  origin: z.string().min(3),
  destination: z.string().min(3),
  departureDate: z.string(),
  returnDate: z.string().optional(),
  passengers: z.number().min(1).max(9),
  flightClass: z.enum(["economy", "business", "first"]),
});

export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertVirtualCardSchema = createInsertSchema(virtualCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateVirtualCardSchema = createInsertSchema(virtualCards).omit({
  id: true,
  userId: true,
  walletId: true,
  cardNumber: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Educational Payment schemas
export const insertEducationalPaymentSchema = createInsertSchema(educationalPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Credit Builder schemas
export const insertCreditBuilderSchema = createInsertSchema(creditBuilders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreditPaymentSchema = createInsertSchema(creditPayments).omit({
  id: true,
  createdAt: true,
});

// Loan Pre-Qualification Schema
export const loanPreQualifications = pgTable("loan_pre_qualifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  status: varchar("status").notNull().default("in_progress"), // in_progress, qualified, not_qualified, referred
  creditScore: varchar("credit_score"),
  monthlyIncome: varchar("monthly_income"),
  employmentStatus: varchar("employment_status"),
  loanPurpose: varchar("loan_purpose"),
  requestedAmount: varchar("requested_amount"),
  qualificationScore: integer("qualification_score"), // 0-100 internal scoring
  qualifiedLoanTypes: jsonb("qualified_loan_types"), // array of qualified loan products
  riskCategory: varchar("risk_category"), // low, medium, high
  preQualificationData: jsonb("pre_qualification_data"), // encrypted sensitive data
  consentGiven: boolean("consent_given").default(false),
  privacyPolicyAccepted: boolean("privacy_policy_accepted").default(false),
  dataRetentionExpiry: timestamp("data_retention_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partner Loan Providers
export const loanPartners = pgTable("loan_partners", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  apiEndpoint: varchar("api_endpoint"),
  isActive: boolean("is_active").default(true),
  supportedLoanTypes: jsonb("supported_loan_types"),
  minCreditScore: integer("min_credit_score"),
  maxLoanAmount: varchar("max_loan_amount"),
  referralFeeStructure: jsonb("referral_fee_structure"), // fee rates and structure
  apiKeyId: varchar("api_key_id"), // reference to secure key storage
  partnerCode: varchar("partner_code").unique(),
  webhookUrl: varchar("webhook_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loan Referrals
export const loanReferrals = pgTable("loan_referrals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  preQualificationId: integer("pre_qualification_id").references(() => loanPreQualifications.id),
  partnerId: integer("partner_id").references(() => loanPartners.id),
  referralCode: varchar("referral_code").unique().notNull(),
  status: varchar("status").notNull().default("pending"), // pending, submitted, approved, rejected, funded, cancelled
  partnerReferralId: varchar("partner_referral_id"), // partner's tracking ID
  loanAmount: varchar("loan_amount"),
  interestRate: varchar("interest_rate"),
  loanTerm: varchar("loan_term"),
  expectedFee: varchar("expected_fee"),
  actualFee: varchar("actual_fee"),
  feeStatus: varchar("fee_status").default("pending"), // pending, earned, paid
  submittedAt: timestamp("submitted_at"),
  responseAt: timestamp("response_at"),
  fundedAt: timestamp("funded_at"),
  partnerResponse: jsonb("partner_response"),
  errorDetails: jsonb("error_details"),
  retryCount: integer("retry_count").default(0),
  lastRetryAt: timestamp("last_retry_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Revenue Tracking
export const referralRevenue = pgTable("referral_revenue", {
  id: serial("id").primaryKey(),
  referralId: integer("referral_id").references(() => loanReferrals.id),
  partnerId: integer("partner_id").references(() => loanPartners.id),
  feeType: varchar("fee_type").notNull(), // origination, referral, percentage
  feeAmount: varchar("fee_amount").notNull(),
  currency: varchar("currency").default("USD"),
  status: varchar("status").default("pending"), // pending, earned, paid, disputed
  earnedAt: timestamp("earned_at"),
  paidAt: timestamp("paid_at"),
  paymentReference: varchar("payment_reference"),
  reconciliationData: jsonb("reconciliation_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Validation schemas for loan pre-qualification
export const loanPreQualificationSchema = z.object({
  monthlyIncome: z.string().min(1, "Monthly income is required"),
  employmentStatus: z.enum(["employed", "self_employed", "unemployed", "student", "retired"]),
  loanPurpose: z.enum(["business", "education", "personal", "debt_consolidation", "home_improvement"]),
  requestedAmount: z.string().min(1, "Loan amount is required"),
  creditScore: z.string().optional(),
  consentGiven: z.boolean().refine(val => val === true, "Consent is required"),
  privacyPolicyAccepted: z.boolean().refine(val => val === true, "Privacy policy acceptance is required"),
});

export const insertLoanPreQualificationSchema = createInsertSchema(loanPreQualifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoanPartnerSchema = createInsertSchema(loanPartners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoanReferralSchema = createInsertSchema(loanReferrals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReferralRevenueSchema = createInsertSchema(referralRevenue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

// New types for additional features
export type Mentor = typeof mentors.$inferSelect;
export type InsertMentor = z.infer<typeof insertMentorSchema>;
export type MentorSession = typeof mentorSessions.$inferSelect;
export type InsertMentorSession = z.infer<typeof insertMentorSessionSchema>;
export type CommunityEvent = typeof communityEvents.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type Insight = typeof insights.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type DocumentationService = typeof documentationServices.$inferSelect;
export type InsertDocService = z.infer<typeof insertDocServiceSchema>;
export type DocumentationOrder = typeof documentationOrders.$inferSelect;
export type InsertDocOrder = z.infer<typeof insertDocOrderSchema>;
export type FlightBooking = typeof flightBookings.$inferSelect;
export type InsertFlightBooking = z.infer<typeof insertFlightBookingSchema>;
export type FlightSearchRequest = z.infer<typeof flightSearchSchema>;

export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

// Virtual Card Types
export type VirtualCard = typeof virtualCards.$inferSelect;
export type InsertVirtualCard = z.infer<typeof insertVirtualCardSchema>;
export type UpdateVirtualCard = z.infer<typeof updateVirtualCardSchema>;

// Educational Payment Types
export type EducationalPayment = typeof educationalPayments.$inferSelect;
export type InsertEducationalPayment = z.infer<typeof insertEducationalPaymentSchema>;

// Credit Builder Types
export type CreditBuilder = typeof creditBuilders.$inferSelect;
export type InsertCreditBuilder = z.infer<typeof insertCreditBuilderSchema>;
export type CreditPayment = typeof creditPayments.$inferSelect;
export type InsertCreditPayment = z.infer<typeof insertCreditPaymentSchema>;

// Loan Pre-Qualification & Referral Types
export type LoanPreQualification = typeof loanPreQualifications.$inferSelect;
export type InsertLoanPreQualification = z.infer<typeof insertLoanPreQualificationSchema>;
export type LoanPartner = typeof loanPartners.$inferSelect;
export type InsertLoanPartner = z.infer<typeof insertLoanPartnerSchema>;
export type LoanReferral = typeof loanReferrals.$inferSelect;
export type InsertLoanReferral = z.infer<typeof insertLoanReferralSchema>;
export type ReferralRevenue = typeof referralRevenue.$inferSelect;
export type InsertReferralRevenue = z.infer<typeof insertReferralRevenueSchema>;
