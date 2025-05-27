import type { Express } from "express";
import { housingMatchmaker } from "./housing-matchmaker";
import { 
  insertPropertyListingSchema, 
  insertTenantProfileSchema,
  insertHousingMessageSchema,
  insertHousingReviewSchema,
  ListingTier
} from "@shared/housing-schema";
import { isAuthenticated } from "./replitAuth";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Listing tier pricing
const LISTING_PRICING = {
  basic: { price: 0, duration: 30, features: ["Basic listing", "Standard search visibility"] },
  featured: { price: 29.99, duration: 30, features: ["Featured placement", "Enhanced visibility", "Priority in search"] },
  premium: { price: 79.99, duration: 30, features: ["Top placement", "Highlighted listing", "Premium badge", "Analytics dashboard"] }
};

export function registerHousingRoutes(app: Express) {
  // Property listing routes
  app.post("/api/housing/listings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const validatedData = insertPropertyListingSchema.parse({
        ...req.body,
        landlordId: userId
      });

      const listing = await housingMatchmaker.createListing(validatedData);
      res.json(listing);
    } catch (error: any) {
      console.error("Error creating listing:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/housing/listings/search", async (req, res) => {
    try {
      const filters = {
        city: req.query.city as string,
        country: req.query.country as string,
        propertyType: req.query.propertyType as string,
        minRent: req.query.minRent ? parseFloat(req.query.minRent as string) : undefined,
        maxRent: req.query.maxRent ? parseFloat(req.query.maxRent as string) : undefined,
        minBedrooms: req.query.minBedrooms ? parseInt(req.query.minBedrooms as string) : undefined,
        maxBedrooms: req.query.maxBedrooms ? parseInt(req.query.maxBedrooms as string) : undefined,
        furnished: req.query.furnished === 'true',
        petFriendly: req.query.petFriendly === 'true',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as 'rent' | 'created' | 'popularity',
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const listings = await housingMatchmaker.searchListings(filters);
      res.json(listings);
    } catch (error: any) {
      console.error("Error searching listings:", error);
      res.status(500).json({ message: "Failed to search listings" });
    }
  });

  app.get("/api/housing/listings/:id", async (req, res) => {
    try {
      const listing = await housingMatchmaker.getListingById(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      // Get reviews for this listing
      const reviews = await housingMatchmaker.getReviewsByListing(req.params.id);
      
      res.json({ ...listing, reviews });
    } catch (error: any) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  app.get("/api/housing/my-listings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const listings = await housingMatchmaker.getListingsByLandlord(userId);
      const analytics = await housingMatchmaker.getListingAnalytics(userId);
      
      res.json({ listings, analytics });
    } catch (error: any) {
      console.error("Error fetching user listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  app.put("/api/housing/listings/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const listing = await housingMatchmaker.getListingById(req.params.id);
      if (!listing || listing.landlordId !== userId) {
        return res.status(404).json({ message: "Listing not found or unauthorized" });
      }

      const validatedData = insertPropertyListingSchema.partial().parse(req.body);
      const updatedListing = await housingMatchmaker.updateListing(req.params.id, validatedData);
      
      res.json(updatedListing);
    } catch (error: any) {
      console.error("Error updating listing:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/housing/listings/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const listing = await housingMatchmaker.getListingById(req.params.id);
      if (!listing || listing.landlordId !== userId) {
        return res.status(404).json({ message: "Listing not found or unauthorized" });
      }

      await housingMatchmaker.deleteListing(req.params.id);
      res.json({ message: "Listing deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });

  // Tenant profile routes
  app.post("/api/housing/tenant-profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const validatedData = insertTenantProfileSchema.parse({
        ...req.body,
        userId
      });

      const profile = await housingMatchmaker.createTenantProfile(validatedData);
      res.json(profile);
    } catch (error: any) {
      console.error("Error creating tenant profile:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/housing/tenant-profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await housingMatchmaker.getTenantProfile(userId);
      res.json(profile);
    } catch (error: any) {
      console.error("Error fetching tenant profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/housing/tenant-profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const validatedData = insertTenantProfileSchema.partial().parse(req.body);
      const profile = await housingMatchmaker.updateTenantProfile(userId, validatedData);
      
      res.json(profile);
    } catch (error: any) {
      console.error("Error updating tenant profile:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Matchmaking routes
  app.get("/api/housing/matches", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await housingMatchmaker.getTenantProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      const matches = await housingMatchmaker.findMatches(profile.id);
      res.json(matches);
    } catch (error: any) {
      console.error("Error finding matches:", error);
      res.status(500).json({ message: "Failed to find matches" });
    }
  });

  app.get("/api/housing/my-matches", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await housingMatchmaker.getTenantProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Tenant profile not found" });
      }

      const matches = await housingMatchmaker.getMatchesByTenant(profile.id);
      res.json(matches);
    } catch (error: any) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Messaging routes
  app.post("/api/housing/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const validatedData = insertHousingMessageSchema.parse({
        ...req.body,
        senderId: userId
      });

      await housingMatchmaker.sendMessage(validatedData);
      res.json({ message: "Message sent successfully" });
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/housing/messages/:matchId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const messages = await housingMatchmaker.getMessages(req.params.matchId);
      
      // Mark messages as read for this user
      await housingMatchmaker.markMessagesAsRead(req.params.matchId, userId);
      
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Review routes
  app.post("/api/housing/reviews", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const validatedData = insertHousingReviewSchema.parse({
        ...req.body,
        reviewerId: userId
      });

      await housingMatchmaker.createReview(validatedData);
      res.json({ message: "Review created successfully" });
    } catch (error: any) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Listing payment routes
  app.post("/api/housing/listings/:id/upgrade", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { tier } = req.body;
      if (!tier || !Object.keys(LISTING_PRICING).includes(tier)) {
        return res.status(400).json({ message: "Invalid listing tier" });
      }

      const listing = await housingMatchmaker.getListingById(req.params.id);
      if (!listing || listing.landlordId !== userId) {
        return res.status(404).json({ message: "Listing not found or unauthorized" });
      }

      const pricing = LISTING_PRICING[tier as keyof typeof LISTING_PRICING];
      
      if (pricing.price === 0) {
        // Free tier - just update directly
        await housingMatchmaker.updateListing(req.params.id, { listingTier: tier });
        return res.json({ message: "Listing updated to basic tier" });
      }

      // Create payment for paid tiers
      const payment = await housingMatchmaker.createListingPayment({
        listingId: req.params.id,
        landlordId: userId,
        amount: pricing.price,
        currency: 'USD',
        listingTier: tier,
        duration: pricing.duration
      });

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Listing Package`,
                description: `${pricing.duration} days of ${tier} listing features`,
              },
              unit_amount: Math.round(pricing.price * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/housing/listings/${req.params.id}?upgraded=true`,
        cancel_url: `${req.protocol}://${req.get('host')}/housing/listings/${req.params.id}`,
        metadata: {
          paymentId: payment.id,
          listingId: req.params.id,
          tier
        }
      });

      // Update payment with Stripe session ID
      await housingMatchmaker.updateListingPaymentStatus(payment.id, 'pending', { 
        sessionId: session.id 
      });

      res.json({ 
        sessionId: session.id,
        paymentId: payment.id,
        checkoutUrl: session.url 
      });
    } catch (error: any) {
      console.error("Error creating listing upgrade:", error);
      res.status(500).json({ message: "Failed to create upgrade payment" });
    }
  });

  // Stripe webhook for listing payments
  app.post("/api/housing/webhook/stripe", async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentId = session.metadata?.paymentId;
        
        if (paymentId) {
          await housingMatchmaker.updateListingPaymentStatus(paymentId, 'completed', {
            sessionId: session.id,
            paymentIntentId: session.payment_intent
          });
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Error processing Stripe webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Get listing pricing information
  app.get("/api/housing/pricing", (req, res) => {
    res.json(LISTING_PRICING);
  });

  // Analytics routes
  app.get("/api/housing/analytics", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const analytics = await housingMatchmaker.getListingAnalytics(userId);
      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
}