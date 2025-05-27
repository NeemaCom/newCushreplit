import { db } from "./db";
import { 
  propertyListings, 
  tenantProfiles, 
  housingMatches, 
  housingMessages,
  listingPayments,
  housingReviews,
  type PropertyListing,
  type TenantProfile,
  type HousingMatch,
  type InsertPropertyListing,
  type InsertTenantProfile,
  type InsertHousingMessage,
  PropertyType,
  ListingTier,
  ListingStatus,
  MatchStatus
} from "@shared/housing-schema";
import { eq, and, gte, lte, sql, desc, asc, ilike, inArray } from "drizzle-orm";
import { z } from "zod";

export interface IHousingStorage {
  // Property listings
  createListing(data: InsertPropertyListing): Promise<PropertyListing>;
  getListingById(id: string): Promise<PropertyListing | undefined>;
  getListingsByLandlord(landlordId: string): Promise<PropertyListing[]>;
  updateListing(id: string, data: Partial<InsertPropertyListing>): Promise<PropertyListing>;
  deleteListing(id: string): Promise<void>;
  searchListings(filters: ListingSearchFilters): Promise<PropertyListing[]>;
  
  // Tenant profiles
  createTenantProfile(data: InsertTenantProfile): Promise<TenantProfile>;
  getTenantProfile(userId: string): Promise<TenantProfile | undefined>;
  updateTenantProfile(userId: string, data: Partial<InsertTenantProfile>): Promise<TenantProfile>;
  
  // Matchmaking
  findMatches(tenantProfileId: string): Promise<HousingMatch[]>;
  createMatch(tenantProfileId: string, listingId: string, score: number): Promise<HousingMatch>;
  getMatchesByTenant(tenantProfileId: string): Promise<HousingMatch[]>;
  getMatchesByListing(listingId: string): Promise<HousingMatch[]>;
  
  // Messaging
  sendMessage(data: InsertHousingMessage): Promise<void>;
  getMessages(matchId: string): Promise<any[]>;
  markMessagesAsRead(matchId: string, userId: string): Promise<void>;
  
  // Reviews
  createReview(data: any): Promise<void>;
  getReviewsByListing(listingId: string): Promise<any[]>;
}

export interface ListingSearchFilters {
  city?: string;
  country?: string;
  propertyType?: string;
  minRent?: number;
  maxRent?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  amenities?: string[];
  furnished?: boolean;
  petFriendly?: boolean;
  availableFrom?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'rent' | 'created' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export class HousingMatchmaker implements IHousingStorage {
  // Property listing methods
  async createListing(data: InsertPropertyListing): Promise<PropertyListing> {
    const [listing] = await db.insert(propertyListings).values({
      ...data,
      status: ListingStatus.PENDING,
      listingTier: ListingTier.BASIC,
    }).returning();
    return listing;
  }

  async getListingById(id: string): Promise<PropertyListing | undefined> {
    const [listing] = await db.select().from(propertyListings).where(eq(propertyListings.id, id));
    
    if (listing) {
      // Increment view count
      await db.update(propertyListings)
        .set({ totalViews: sql`${propertyListings.totalViews} + 1` })
        .where(eq(propertyListings.id, id));
    }
    
    return listing;
  }

  async getListingsByLandlord(landlordId: string): Promise<PropertyListing[]> {
    return await db.select()
      .from(propertyListings)
      .where(eq(propertyListings.landlordId, landlordId))
      .orderBy(desc(propertyListings.createdAt));
  }

  async updateListing(id: string, data: Partial<InsertPropertyListing>): Promise<PropertyListing> {
    const [listing] = await db.update(propertyListings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(propertyListings.id, id))
      .returning();
    return listing;
  }

  async deleteListing(id: string): Promise<void> {
    await db.delete(propertyListings).where(eq(propertyListings.id, id));
  }

  async searchListings(filters: ListingSearchFilters): Promise<PropertyListing[]> {
    let query = db.select().from(propertyListings);
    const conditions = [eq(propertyListings.status, ListingStatus.ACTIVE)];

    // Apply filters
    if (filters.city) {
      conditions.push(ilike(propertyListings.city, `%${filters.city}%`));
    }
    
    if (filters.country) {
      conditions.push(eq(propertyListings.country, filters.country));
    }
    
    if (filters.propertyType) {
      conditions.push(eq(propertyListings.propertyType, filters.propertyType));
    }
    
    if (filters.minRent) {
      conditions.push(gte(propertyListings.rentAmount, filters.minRent.toString()));
    }
    
    if (filters.maxRent) {
      conditions.push(lte(propertyListings.rentAmount, filters.maxRent.toString()));
    }
    
    if (filters.minBedrooms) {
      conditions.push(gte(propertyListings.bedrooms, filters.minBedrooms));
    }
    
    if (filters.maxBedrooms) {
      conditions.push(lte(propertyListings.bedrooms, filters.maxBedrooms));
    }
    
    if (filters.furnished !== undefined) {
      conditions.push(eq(propertyListings.furnished, filters.furnished));
    }
    
    if (filters.petFriendly !== undefined) {
      conditions.push(eq(propertyListings.petFriendly, filters.petFriendly));
    }
    
    if (filters.availableFrom) {
      conditions.push(lte(propertyListings.availableFrom, filters.availableFrom));
    }

    query = query.where(and(...conditions));

    // Apply sorting
    if (filters.sortBy === 'rent') {
      query = query.orderBy(filters.sortOrder === 'desc' ? desc(propertyListings.rentAmount) : asc(propertyListings.rentAmount));
    } else if (filters.sortBy === 'popularity') {
      query = query.orderBy(desc(propertyListings.totalViews));
    } else {
      query = query.orderBy(desc(propertyListings.createdAt));
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    return await query.limit(limit).offset(offset);
  }

  // Tenant profile methods
  async createTenantProfile(data: InsertTenantProfile): Promise<TenantProfile> {
    const [profile] = await db.insert(tenantProfiles).values(data).returning();
    return profile;
  }

  async getTenantProfile(userId: string): Promise<TenantProfile | undefined> {
    const [profile] = await db.select().from(tenantProfiles).where(eq(tenantProfiles.userId, userId));
    return profile;
  }

  async updateTenantProfile(userId: string, data: Partial<InsertTenantProfile>): Promise<TenantProfile> {
    const [profile] = await db.update(tenantProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tenantProfiles.userId, userId))
      .returning();
    return profile;
  }

  // Advanced matchmaking algorithm
  async findMatches(tenantProfileId: string): Promise<HousingMatch[]> {
    const [profile] = await db.select().from(tenantProfiles).where(eq(tenantProfiles.id, tenantProfileId));
    if (!profile) throw new Error("Tenant profile not found");

    // Get all active listings that match basic criteria
    const listings = await db.select()
      .from(propertyListings)
      .where(and(
        eq(propertyListings.status, ListingStatus.ACTIVE),
        sql`${propertyListings.city} = ANY(${profile.targetCities})`,
        gte(propertyListings.rentAmount, profile.minBudget),
        lte(propertyListings.rentAmount, profile.maxBudget),
        gte(propertyListings.bedrooms, profile.minBedrooms),
        profile.maxBedrooms ? lte(propertyListings.bedrooms, profile.maxBedrooms) : sql`true`
      ));

    const matches: Array<{ listing: PropertyListing; score: number; factors: Record<string, number> }> = [];

    for (const listing of listings) {
      const score = this.calculateCompatibilityScore(profile, listing);
      if (score.total >= 0.6) { // Minimum 60% compatibility
        matches.push({
          listing,
          score: score.total,
          factors: score.factors
        });
      }
    }

    // Sort by compatibility score
    matches.sort((a, b) => b.score - a.score);

    // Create match records
    const matchRecords: HousingMatch[] = [];
    for (const match of matches.slice(0, 50)) { // Limit to top 50 matches
      const [existingMatch] = await db.select()
        .from(housingMatches)
        .where(and(
          eq(housingMatches.tenantProfileId, tenantProfileId),
          eq(housingMatches.listingId, match.listing.id)
        ));

      if (!existingMatch) {
        const [newMatch] = await db.insert(housingMatches).values({
          tenantProfileId,
          listingId: match.listing.id,
          compatibilityScore: match.score.toString(),
          matchFactors: match.factors,
          status: MatchStatus.PENDING
        }).returning();
        matchRecords.push(newMatch);
      } else {
        matchRecords.push(existingMatch);
      }
    }

    return matchRecords;
  }

  private calculateCompatibilityScore(profile: TenantProfile, listing: PropertyListing): { total: number; factors: Record<string, number> } {
    const factors: Record<string, number> = {};
    let totalWeight = 0;
    let weightedScore = 0;

    // Budget compatibility (25% weight)
    const budgetWeight = 0.25;
    const rentAmount = parseFloat(listing.rentAmount);
    const minBudget = parseFloat(profile.minBudget);
    const maxBudget = parseFloat(profile.maxBudget);
    
    if (rentAmount >= minBudget && rentAmount <= maxBudget) {
      const budgetRange = maxBudget - minBudget;
      const optimalRent = minBudget + (budgetRange * 0.7); // 70% of budget is optimal
      const budgetScore = Math.max(0, 1 - Math.abs(rentAmount - optimalRent) / budgetRange);
      factors.budget = budgetScore;
      weightedScore += budgetScore * budgetWeight;
    } else {
      factors.budget = 0;
    }
    totalWeight += budgetWeight;

    // Location compatibility (20% weight)
    const locationWeight = 0.2;
    const cityMatch = profile.targetCities.includes(listing.city);
    const locationScore = cityMatch ? 1 : 0;
    factors.location = locationScore;
    weightedScore += locationScore * locationWeight;
    totalWeight += locationWeight;

    // Property type compatibility (15% weight)
    const propertyTypeWeight = 0.15;
    const propertyTypeMatch = profile.propertyTypes.length === 0 || profile.propertyTypes.includes(listing.propertyType);
    const propertyTypeScore = propertyTypeMatch ? 1 : 0;
    factors.propertyType = propertyTypeScore;
    weightedScore += propertyTypeScore * propertyTypeWeight;
    totalWeight += propertyTypeWeight;

    // Bedroom compatibility (15% weight)
    const bedroomWeight = 0.15;
    const bedroomMatch = listing.bedrooms >= profile.minBedrooms && 
                        (!profile.maxBedrooms || listing.bedrooms <= profile.maxBedrooms);
    const bedroomScore = bedroomMatch ? 1 : 0;
    factors.bedrooms = bedroomScore;
    weightedScore += bedroomScore * bedroomWeight;
    totalWeight += bedroomWeight;

    // Lifestyle compatibility (10% weight)
    const lifestyleWeight = 0.1;
    let lifestyleScore = 1;
    if (profile.furnished && !listing.furnished) lifestyleScore -= 0.3;
    if (profile.petFriendly && !listing.petFriendly) lifestyleScore -= 0.4;
    if (!profile.smokingAllowed && listing.smokingAllowed) lifestyleScore -= 0.3;
    lifestyleScore = Math.max(0, lifestyleScore);
    factors.lifestyle = lifestyleScore;
    weightedScore += lifestyleScore * lifestyleWeight;
    totalWeight += lifestyleWeight;

    // Amenities compatibility (10% weight)
    const amenitiesWeight = 0.1;
    const requiredAmenities = profile.requiredAmenities || [];
    const listingAmenities = listing.amenities || [];
    const matchedRequired = requiredAmenities.filter(amenity => listingAmenities.includes(amenity));
    const amenitiesScore = requiredAmenities.length > 0 ? matchedRequired.length / requiredAmenities.length : 1;
    factors.amenities = amenitiesScore;
    weightedScore += amenitiesScore * amenitiesWeight;
    totalWeight += amenitiesWeight;

    // Move-in date compatibility (5% weight)
    const dateWeight = 0.05;
    const moveInDate = new Date(profile.moveInDate);
    const availableFrom = new Date(listing.availableFrom);
    const daysDifference = Math.abs((moveInDate.getTime() - availableFrom.getTime()) / (1000 * 60 * 60 * 24));
    const flexibilityDays = profile.moveInFlexibility || 7;
    const dateScore = daysDifference <= flexibilityDays ? 1 : Math.max(0, 1 - (daysDifference - flexibilityDays) / 30);
    factors.moveInDate = dateScore;
    weightedScore += dateScore * dateWeight;
    totalWeight += dateWeight;

    const finalScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
    
    return {
      total: Math.round(finalScore * 100) / 100,
      factors
    };
  }

  async createMatch(tenantProfileId: string, listingId: string, score: number): Promise<HousingMatch> {
    const [match] = await db.insert(housingMatches).values({
      tenantProfileId,
      listingId,
      compatibilityScore: score.toString(),
      status: MatchStatus.PENDING
    }).returning();
    return match;
  }

  async getMatchesByTenant(tenantProfileId: string): Promise<HousingMatch[]> {
    return await db.select()
      .from(housingMatches)
      .where(eq(housingMatches.tenantProfileId, tenantProfileId))
      .orderBy(desc(housingMatches.compatibilityScore));
  }

  async getMatchesByListing(listingId: string): Promise<HousingMatch[]> {
    return await db.select()
      .from(housingMatches)
      .where(eq(housingMatches.listingId, listingId))
      .orderBy(desc(housingMatches.compatibilityScore));
  }

  // Messaging methods
  async sendMessage(data: InsertHousingMessage): Promise<void> {
    await db.insert(housingMessages).values(data);
    
    // Update match with message count and timestamp
    await db.update(housingMatches)
      .set({
        messagesCount: sql`${housingMatches.messagesCount} + 1`,
        lastMessageAt: new Date(),
        status: MatchStatus.CONTACTED
      })
      .where(eq(housingMatches.id, data.matchId));
  }

  async getMessages(matchId: string): Promise<any[]> {
    return await db.select()
      .from(housingMessages)
      .where(eq(housingMessages.matchId, matchId))
      .orderBy(asc(housingMessages.createdAt));
  }

  async markMessagesAsRead(matchId: string, userId: string): Promise<void> {
    await db.update(housingMessages)
      .set({ isRead: true, readAt: new Date() })
      .where(and(
        eq(housingMessages.matchId, matchId),
        eq(housingMessages.recipientId, userId),
        eq(housingMessages.isRead, false)
      ));
  }

  // Review methods
  async createReview(data: any): Promise<void> {
    await db.insert(housingReviews).values(data);
  }

  async getReviewsByListing(listingId: string): Promise<any[]> {
    return await db.select()
      .from(housingReviews)
      .where(and(
        eq(housingReviews.listingId, listingId),
        eq(housingReviews.isPublic, true)
      ))
      .orderBy(desc(housingReviews.createdAt));
  }

  // Listing payment methods
  async createListingPayment(data: {
    listingId: string;
    landlordId: string;
    amount: number;
    currency: string;
    listingTier: string;
    duration: number;
  }): Promise<any> {
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + (data.duration * 24 * 60 * 60 * 1000));

    const [payment] = await db.insert(listingPayments).values({
      ...data,
      amount: data.amount.toString(),
      startsAt,
      expiresAt,
      paymentStatus: 'pending'
    }).returning();

    return payment;
  }

  async updateListingPaymentStatus(paymentId: string, status: string, stripeData?: any): Promise<void> {
    const updateData: any = { paymentStatus: status };
    if (stripeData) {
      if (stripeData.paymentIntentId) updateData.stripePaymentIntentId = stripeData.paymentIntentId;
      if (stripeData.sessionId) updateData.stripeSessionId = stripeData.sessionId;
    }

    await db.update(listingPayments)
      .set(updateData)
      .where(eq(listingPayments.id, paymentId));

    // If payment is successful, update listing tier and expiry
    if (status === 'completed') {
      const [payment] = await db.select().from(listingPayments).where(eq(listingPayments.id, paymentId));
      if (payment) {
        await db.update(propertyListings)
          .set({
            listingTier: payment.listingTier,
            listingExpiresAt: payment.expiresAt,
            status: ListingStatus.ACTIVE
          })
          .where(eq(propertyListings.id, payment.listingId));
      }
    }
  }

  // Analytics and reporting
  async getListingAnalytics(landlordId: string): Promise<any> {
    const listings = await this.getListingsByLandlord(landlordId);
    const listingIds = listings.map(l => l.id);
    
    if (listingIds.length === 0) {
      return {
        totalListings: 0,
        totalViews: 0,
        totalMatches: 0,
        totalMessages: 0,
        averageRating: 0
      };
    }

    const matches = await db.select()
      .from(housingMatches)
      .where(inArray(housingMatches.listingId, listingIds));

    const messages = await db.select()
      .from(housingMessages)
      .where(inArray(housingMessages.matchId, matches.map(m => m.id)));

    const reviews = await db.select()
      .from(housingReviews)
      .where(inArray(housingReviews.listingId, listingIds));

    const totalViews = listings.reduce((sum, listing) => sum + (listing.totalViews || 0), 0);
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + parseFloat(review.rating), 0) / reviews.length 
      : 0;

    return {
      totalListings: listings.length,
      totalViews,
      totalMatches: matches.length,
      totalMessages: messages.length,
      averageRating: Math.round(averageRating * 10) / 10,
      listings: listings.map(listing => ({
        ...listing,
        matchCount: matches.filter(m => m.listingId === listing.id).length,
        messageCount: messages.filter(m => matches.find(match => match.id === m.matchId)?.listingId === listing.id).length
      }))
    };
  }
}

export const housingMatchmaker = new HousingMatchmaker();