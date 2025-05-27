import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Property listings table
export const propertyListings = pgTable(
  "property_listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    landlordId: varchar("landlord_id").notNull(), // User ID of the landlord
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    propertyType: varchar("property_type").notNull(), // apartment, house, room, co-living
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    neighborhood: varchar("neighborhood", { length: 100 }),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    
    // Pricing
    rentAmount: decimal("rent_amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
    utilitiesIncluded: boolean("utilities_included").default(false),
    
    // Property details
    bedrooms: integer("bedrooms").notNull(),
    bathrooms: integer("bathrooms").notNull(), // Changed to integer for simplicity
    squareMeters: integer("square_meters"),
    furnished: boolean("furnished").default(false),
    petFriendly: boolean("pet_friendly").default(false),
    smokingAllowed: boolean("smoking_allowed").default(false),
    
    // Amenities (stored as JSON array)
    amenities: jsonb("amenities").$type<string[]>().default([]),
    
    // Images (URLs stored as JSON array)
    images: jsonb("images").$type<string[]>().default([]),
    
    // Availability
    availableFrom: timestamp("available_from").notNull(),
    availableTo: timestamp("available_to"),
    minStayMonths: integer("min_stay_months").default(1),
    maxStayMonths: integer("max_stay_months"),
    
    // Status and verification
    status: varchar("status").notNull().default("pending"), // pending, active, inactive, rented
    isVerified: boolean("is_verified").default(false),
    verificationNotes: text("verification_notes"),
    
    // Listing tier and payments
    listingTier: varchar("listing_tier").notNull().default("basic"), // basic, featured, premium
    listingExpiresAt: timestamp("listing_expires_at"),
    totalViews: integer("total_views").default(0),
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_listings_city_country").on(table.city, table.country),
    index("idx_listings_property_type").on(table.propertyType),
    index("idx_listings_status").on(table.status),
    index("idx_listings_landlord").on(table.landlordId),
    index("idx_listings_rent_range").on(table.rentAmount),
  ]
);

// Tenant profiles for housing search
export const tenantProfiles = pgTable(
  "tenant_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id").notNull().unique(), // Link to users table
    
    // Target location preferences
    targetCities: jsonb("target_cities").$type<string[]>().default([]),
    targetCountries: jsonb("target_countries").$type<string[]>().default([]),
    neighborhoods: jsonb("neighborhoods").$type<string[]>().default([]),
    
    // Budget and preferences
    minBudget: decimal("min_budget", { precision: 10, scale: 2 }).notNull(),
    maxBudget: decimal("max_budget", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    
    // Housing preferences
    propertyTypes: jsonb("property_types").$type<string[]>().default([]), // apartment, house, room, co-living
    minBedrooms: integer("min_bedrooms").default(1),
    maxBedrooms: integer("max_bedrooms"),
    minBathrooms: decimal("min_bathrooms", { precision: 3, scale: 1 }).default(1),
    
    // Move-in preferences
    moveInDate: timestamp("move_in_date").notNull(),
    moveInFlexibility: integer("move_in_flexibility").default(7), // days flexible
    minStayMonths: integer("min_stay_months").default(6),
    maxStayMonths: integer("max_stay_months"),
    
    // Lifestyle preferences
    furnished: boolean("furnished").default(true),
    petFriendly: boolean("pet_friendly").default(false),
    smokingAllowed: boolean("smoking_allowed").default(false),
    quietEnvironment: boolean("quiet_environment").default(false),
    socialEnvironment: boolean("social_environment").default(true),
    
    // Required amenities
    requiredAmenities: jsonb("required_amenities").$type<string[]>().default([]),
    preferredAmenities: jsonb("preferred_amenities").$type<string[]>().default([]),
    
    // Personal info for matching
    bio: text("bio"),
    age: integer("age"),
    occupation: varchar("occupation", { length: 100 }),
    languages: jsonb("languages").$type<string[]>().default([]),
    lifestyle: varchar("lifestyle", { length: 50 }), // student, professional, nomad, etc.
    
    // Search activity
    isActive: boolean("is_active").default(true),
    lastActiveAt: timestamp("last_active_at").defaultNow(),
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_tenant_cities").on(table.targetCities),
    index("idx_tenant_budget").on(table.minBudget, table.maxBudget),
    index("idx_tenant_move_in").on(table.moveInDate),
    index("idx_tenant_active").on(table.isActive),
  ]
);

// Housing matches between tenants and listings
export const housingMatches = pgTable(
  "housing_matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantProfileId: uuid("tenant_profile_id").notNull().references(() => tenantProfiles.id),
    listingId: uuid("listing_id").notNull().references(() => propertyListings.id),
    
    // Match scoring
    compatibilityScore: decimal("compatibility_score", { precision: 5, scale: 2 }).notNull(),
    matchFactors: jsonb("match_factors").$type<Record<string, number>>().default({}),
    
    // Match status
    status: varchar("status").notNull().default("pending"), // pending, viewed, contacted, declined, expired
    tenantInterest: boolean("tenant_interest"),
    landlordInterest: boolean("landlord_interest"),
    
    // Communication tracking
    messagesCount: integer("messages_count").default(0),
    lastMessageAt: timestamp("last_message_at"),
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_matches_tenant").on(table.tenantProfileId),
    index("idx_matches_listing").on(table.listingId),
    index("idx_matches_score").on(table.compatibilityScore),
    index("idx_matches_status").on(table.status),
  ]
);

// Messages between tenants and landlords
export const housingMessages = pgTable(
  "housing_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: uuid("match_id").notNull().references(() => housingMatches.id),
    senderId: varchar("sender_id").notNull(), // User ID
    recipientId: varchar("recipient_id").notNull(), // User ID
    
    // Message content
    message: text("message").notNull(),
    messageType: varchar("message_type").default("text"), // text, image, document
    attachments: jsonb("attachments").$type<string[]>().default([]),
    
    // Status
    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at"),
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_messages_match").on(table.matchId),
    index("idx_messages_sender").on(table.senderId),
    index("idx_messages_recipient").on(table.recipientId),
    index("idx_messages_created").on(table.createdAt),
  ]
);

// Listing payments and subscriptions
export const listingPayments = pgTable(
  "listing_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id").notNull().references(() => propertyListings.id),
    landlordId: varchar("landlord_id").notNull(),
    
    // Payment details
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    listingTier: varchar("listing_tier").notNull(), // basic, featured, premium
    duration: integer("duration").notNull(), // days
    
    // Stripe payment info
    stripePaymentIntentId: varchar("stripe_payment_intent_id"),
    stripeSessionId: varchar("stripe_session_id"),
    paymentStatus: varchar("payment_status").notNull().default("pending"),
    
    // Validity period
    startsAt: timestamp("starts_at").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_payments_listing").on(table.listingId),
    index("idx_payments_landlord").on(table.landlordId),
    index("idx_payments_status").on(table.paymentStatus),
  ]
);

// Reviews and ratings
export const housingReviews = pgTable(
  "housing_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id").notNull().references(() => propertyListings.id),
    reviewerId: varchar("reviewer_id").notNull(), // Tenant user ID
    landlordId: varchar("landlord_id").notNull(),
    
    // Review content
    rating: decimal("rating", { precision: 2, scale: 1 }).notNull(), // 1.0 to 5.0
    title: varchar("title", { length: 200 }),
    comment: text("comment"),
    
    // Specific ratings
    communicationRating: decimal("communication_rating", { precision: 2, scale: 1 }),
    accuracyRating: decimal("accuracy_rating", { precision: 2, scale: 1 }),
    cleanlinessRating: decimal("cleanliness_rating", { precision: 2, scale: 1 }),
    locationRating: decimal("location_rating", { precision: 2, scale: 1 }),
    
    // Review status
    isVerified: boolean("is_verified").default(false),
    isPublic: boolean("is_public").default(true),
    
    // Metadata
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_reviews_listing").on(table.listingId),
    index("idx_reviews_rating").on(table.rating),
    index("idx_reviews_verified").on(table.isVerified),
  ]
);

// Insert and select schemas
export const insertPropertyListingSchema = createInsertSchema(propertyListings, {
  title: z.string().min(10).max(200),
  description: z.string().min(20),
  propertyType: z.enum(["apartment", "house", "room", "co-living", "studio"]),
  rentAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().min(0.5).max(20),
  currency: z.string().length(3),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalViews: true,
});

export const insertTenantProfileSchema = createInsertSchema(tenantProfiles, {
  targetCities: z.array(z.string()).min(1),
  minBudget: z.string().regex(/^\d+(\.\d{1,2})?$/),
  maxBudget: z.string().regex(/^\d+(\.\d{1,2})?$/),
  moveInDate: z.date().min(new Date()),
  bio: z.string().max(500),
  age: z.number().int().min(18).max(100),
  languages: z.array(z.string()).default([]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActiveAt: true,
});

export const insertHousingMessageSchema = createInsertSchema(housingMessages, {
  message: z.string().min(1).max(2000),
  messageType: z.enum(["text", "image", "document"]).default("text"),
}).omit({
  id: true,
  createdAt: true,
  isRead: true,
  readAt: true,
});

export const insertHousingReviewSchema = createInsertSchema(housingReviews, {
  rating: z.number().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().max(1000),
  communicationRating: z.number().min(1).max(5).optional(),
  accuracyRating: z.number().min(1).max(5).optional(),
  cleanlinessRating: z.number().min(1).max(5).optional(),
  locationRating: z.number().min(1).max(5).optional(),
}).omit({
  id: true,
  createdAt: true,
  isVerified: true,
});

// Type exports
export type PropertyListing = typeof propertyListings.$inferSelect;
export type InsertPropertyListing = z.infer<typeof insertPropertyListingSchema>;

export type TenantProfile = typeof tenantProfiles.$inferSelect;
export type InsertTenantProfile = z.infer<typeof insertTenantProfileSchema>;

export type HousingMatch = typeof housingMatches.$inferSelect;
export type HousingMessage = typeof housingMessages.$inferSelect;
export type InsertHousingMessage = z.infer<typeof insertHousingMessageSchema>;

export type ListingPayment = typeof listingPayments.$inferSelect;
export type HousingReview = typeof housingReviews.$inferSelect;
export type InsertHousingReview = z.infer<typeof insertHousingReviewSchema>;

// Enum definitions for consistent usage
export const PropertyType = {
  APARTMENT: "apartment",
  HOUSE: "house", 
  ROOM: "room",
  CO_LIVING: "co-living",
  STUDIO: "studio",
} as const;

export const ListingTier = {
  BASIC: "basic",
  FEATURED: "featured", 
  PREMIUM: "premium",
} as const;

export const ListingStatus = {
  PENDING: "pending",
  ACTIVE: "active",
  INACTIVE: "inactive", 
  RENTED: "rented",
} as const;

export const MatchStatus = {
  PENDING: "pending",
  VIEWED: "viewed",
  CONTACTED: "contacted",
  DECLINED: "declined",
  EXPIRED: "expired",
} as const;