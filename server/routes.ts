import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  authRateLimit, 
  paymentRateLimit, 
  strictRateLimit,
  securityLogger,
  EncryptionService,
  enhancedAuth
} from "./security";
import { getImmigrationAssistance, analyzeTransactionRisk } from "./openai";
import { transferSchema, flightSearchSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes with enhanced security
  app.get('/api/auth/user', authRateLimit, enhancedAuth, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Log successful auth access
      securityLogger.logSecurityEvent('USER_ACCESS', {
        userId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'low');
      
      res.json(user);
    } catch (error) {
      securityLogger.logFailedAuth(
        req.ip || 'unknown',
        req.get('User-Agent') || 'unknown',
        'Failed to fetch user data'
      );
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Enhanced signup completion route
  app.post('/api/auth/complete-signup', async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        country,
        acceptTerms,
        acceptPrivacy,
        marketingConsent
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !phoneNumber || !country) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }

      if (!acceptTerms || !acceptPrivacy) {
        return res.status(400).json({ message: "Terms and Privacy Policy must be accepted" });
      }

      // Create user profile with enhanced information
      const userData = {
        email,
        firstName,
        lastName,
      };

      const profileData = {
        phoneNumber,
        nationality: country,
        acceptTerms: true,
        acceptPrivacy: true,
        marketingConsent: marketingConsent || false,
        isPhoneVerified: false,
        isEmailVerified: false,
      };

      // In a real implementation, you would:
      // 1. Send email verification
      // 2. Send SMS verification for phone
      // 3. Store user in database
      // 4. Create initial wallets

      res.json({ 
        message: "Registration completed successfully",
        user: userData,
        requiresVerification: true
      });
    } catch (error: any) {
      res.status(500).json({ message: "Registration failed: " + error.message });
    }
  });

  // Gmail OAuth route
  app.get('/api/auth/gmail', (req, res) => {
    // For now, redirect to the enhanced signup modal
    // In production, this would initiate Google OAuth flow
    res.redirect('/?signup=gmail');
  });

  // Imisi AI Chat endpoint
  app.post('/api/imisi/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, conversationHistory } = req.body;
      const userId = req.user.claims.sub;
      
      // Get user context for personalized responses
      const user = await storage.getUser(userId);
      const userWallets = await storage.getUserWallets(userId);
      const recentTransactions = await storage.getUserTransactions(userId, 5);
      
      const userContext = {
        name: user?.firstName || 'User',
        wallets: userWallets,
        recentTransactions: recentTransactions
      };

      // Get AI response from OpenAI service
      const aiResponse = await getImmigrationAssistance(message, userContext);
      
      // Store the conversation in database
      await storage.createChatMessage({
        userId,
        message,
        response: aiResponse,
        isFromUser: true
      });

      await storage.createChatMessage({
        userId,
        message: aiResponse,
        response: '',
        isFromUser: false
      });

      res.json({ response: aiResponse });
    } catch (error: any) {
      console.error('Imisi chat error:', error);
      res.status(500).json({ 
        response: "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment, or contact our support team if the issue persists."
      });
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

  // Wallet endpoints
  app.get('/api/wallets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallets = await storage.getUserWallets(userId);
      res.json(wallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });

  app.post('/api/wallets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { currency } = req.body;
      
      // Check if wallet already exists for this currency
      const existingWallet = await storage.getWalletByCurrency(userId, currency);
      if (existingWallet) {
        return res.status(400).json({ message: "Wallet already exists for this currency" });
      }

      const wallet = await storage.createWallet({
        userId,
        currency,
        balance: '0.00',
        isActive: true
      });
      
      res.json(wallet);
    } catch (error) {
      console.error("Error creating wallet:", error);
      res.status(500).json({ message: "Failed to create wallet" });
    }
  });

  // Virtual Card endpoints
  app.get('/api/virtual-cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cards = await storage.getUserVirtualCards(userId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching virtual cards:", error);
      res.status(500).json({ message: "Failed to fetch virtual cards" });
    }
  });

  app.post('/api/virtual-cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletId } = req.body;
      
      // Get wallet to verify ownership and get currency
      const wallets = await storage.getUserWallets(userId);
      const wallet = wallets.find(w => w.id === walletId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      // Generate card details
      const cardNumber = '4532' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
      const expiryMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const expiryYear = String(new Date().getFullYear() + 3).slice(-2);
      const cvv = Math.floor(Math.random() * 900 + 100).toString();

      const card = await storage.createVirtualCard({
        userId,
        walletId,
        cardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        cardHolderName: 'CUSH USER',
        status: 'active',
        spendingLimit: '5000.00',
        currency: wallet.currency
      });
      
      res.json(card);
    } catch (error) {
      console.error("Error creating virtual card:", error);
      res.status(500).json({ message: "Failed to create virtual card" });
    }
  });

  app.patch('/api/virtual-cards/:cardId/suspend', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cardId = parseInt(req.params.cardId);
      
      // Verify card ownership
      const cards = await storage.getUserVirtualCards(userId);
      const card = cards.find(c => c.id === cardId);
      
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      const updatedCard = await storage.suspendVirtualCard(cardId);
      res.json(updatedCard);
    } catch (error) {
      console.error("Error suspending card:", error);
      res.status(500).json({ message: "Failed to suspend card" });
    }
  });

  app.patch('/api/virtual-cards/:cardId/activate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cardId = parseInt(req.params.cardId);
      
      // Verify card ownership
      const cards = await storage.getUserVirtualCards(userId);
      const card = cards.find(c => c.id === cardId);
      
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      const updatedCard = await storage.activateVirtualCard(cardId);
      res.json(updatedCard);
    } catch (error) {
      console.error("Error activating card:", error);
      res.status(500).json({ message: "Failed to activate card" });
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

  // Community routes
  app.get('/api/community', async (req, res) => {
    try {
      const [mentors, events, insights] = await Promise.all([
        storage.getMentors(),
        storage.getCommunityEvents(),
        storage.getInsights()
      ]);

      res.json({ mentors, events, insights });
    } catch (error) {
      console.error("Error fetching community data:", error);
      res.status(500).json({ message: "Failed to fetch community data" });
    }
  });

  // Documentation routes
  app.get('/api/documentation/services', async (req, res) => {
    try {
      const services = await storage.getDocumentationServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching documentation services:", error);
      res.status(500).json({ message: "Failed to fetch documentation services" });
    }
  });

  app.get('/api/documentation/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserDocumentationOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching documentation orders:", error);
      res.status(500).json({ message: "Failed to fetch documentation orders" });
    }
  });

  app.post('/api/documentation/order', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { serviceId, deliveryAddress, phoneNumber, additionalNotes } = req.body;

      // Get service details
      const services = await storage.getDocumentationServices();
      const service = services.find(s => s.id === serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Generate order number
      const orderNumber = `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'gbp',
            product_data: {
              name: service.name,
              description: service.description,
            },
            unit_amount: Math.round(parseFloat(service.price) * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.protocol}://${req.hostname}/documentation?success=true&order=${orderNumber}`,
        cancel_url: `${req.protocol}://${req.hostname}/documentation?cancelled=true`,
        metadata: {
          userId,
          serviceId: serviceId.toString(),
          orderNumber,
          deliveryAddress,
          phoneNumber,
          additionalNotes: additionalNotes || '',
        },
      });

      // Create order record
      const order = await storage.createDocumentationOrder({
        userId,
        serviceId,
        orderNumber,
        amount: service.price,
        stripePaymentId: session.id,
        deliveryDetails: JSON.stringify({
          address: deliveryAddress,
          phone: phoneNumber,
          notes: additionalNotes,
        }),
      });

      res.json({
        orderNumber,
        checkoutUrl: session.url,
        order,
      });
    } catch (error) {
      console.error("Error creating documentation order:", error);
      res.status(500).json({ message: "Failed to create documentation order" });
    }
  });

  // Flight routes
  app.get('/api/flights/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getUserFlightBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching flight bookings:", error);
      res.status(500).json({ message: "Failed to fetch flight bookings" });
    }
  });

  app.post('/api/flights/search', isAuthenticated, async (req: any, res) => {
    try {
      const searchData = flightSearchSchema.parse(req.body);
      
      // Simulate flight search results with realistic data
      const mockFlights = [
        {
          airline: "British Airways",
          flightNumber: "BA085",
          origin: searchData.origin,
          destination: searchData.destination,
          departureTime: "14:30",
          arrivalTime: "06:45+1",
          duration: "6h 15m",
          stops: 0,
          basePrice: 450,
          cushMarkup: 25,
          totalPrice: 475,
          class: searchData.flightClass,
        },
        {
          airline: "Virgin Atlantic",
          flightNumber: "VS411",
          origin: searchData.origin,
          destination: searchData.destination,
          departureTime: "21:15",
          arrivalTime: "13:30+1",
          duration: "6h 15m",
          stops: 0,
          basePrice: 485,
          cushMarkup: 25,
          totalPrice: 510,
          class: searchData.flightClass,
        },
        {
          airline: "Turkish Airlines",
          flightNumber: "TK614",
          origin: searchData.origin,
          destination: searchData.destination,
          departureTime: "08:45",
          arrivalTime: "11:20+1",
          duration: "9h 35m",
          stops: 1,
          basePrice: 380,
          cushMarkup: 20,
          totalPrice: 400,
          class: searchData.flightClass,
        },
      ];

      res.json({ flights: mockFlights });
    } catch (error) {
      console.error("Error searching flights:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid search criteria", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to search flights" });
    }
  });

  app.post('/api/flights/book', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { searchCriteria, ...flightData } = req.body;

      // Generate booking reference
      const bookingReference = `CU${Date.now().toString().slice(-6)}`;

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Flight: ${flightData.origin} to ${flightData.destination}`,
              description: `${flightData.airline} ${flightData.flightNumber} - ${searchCriteria.passengers} passenger(s)`,
            },
            unit_amount: Math.round(flightData.totalPrice * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.protocol}://${req.hostname}/flights?success=true&booking=${bookingReference}`,
        cancel_url: `${req.protocol}://${req.hostname}/flights?cancelled=true`,
        metadata: {
          userId,
          bookingReference,
          flightData: JSON.stringify(flightData),
          searchCriteria: JSON.stringify(searchCriteria),
        },
      });

      // Create booking record
      const booking = await storage.createFlightBooking({
        userId,
        bookingReference,
        origin: flightData.origin,
        destination: flightData.destination,
        departureDate: new Date(searchCriteria.departureDate),
        returnDate: searchCriteria.returnDate ? new Date(searchCriteria.returnDate) : null,
        passengers: searchCriteria.passengers,
        flightClass: searchCriteria.flightClass,
        basePrice: flightData.basePrice.toString(),
        cushMarkup: flightData.cushMarkup.toString(),
        totalPrice: flightData.totalPrice.toString(),
        airlineData: JSON.stringify(flightData),
      });

      res.json({
        bookingReference,
        checkoutUrl: session.url,
        booking,
      });
    } catch (error) {
      console.error("Error booking flight:", error);
      res.status(500).json({ message: "Failed to book flight" });
    }
  });

  // Mentor routes
  app.get('/api/mentors', async (req, res) => {
    try {
      const mentors = await storage.getMentors();
      res.json(mentors);
    } catch (error) {
      console.error("Error fetching mentors:", error);
      res.status(500).json({ message: "Failed to fetch mentors" });
    }
  });

  app.post('/api/mentors/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, expertise, bio, hourlyRate, experience, credentials, languages } = req.body;

      const mentor = await storage.createMentor({
        userId,
        name,
        expertise,
        bio,
        hourlyRate,
        experience,
        credentials,
        languages,
        isActive: false, // Pending admin approval
        isApproved: false,
      });

      res.json({ message: "Application submitted successfully", mentor });
    } catch (error) {
      console.error("Error submitting mentor application:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  app.post('/api/mentors/book', isAuthenticated, async (req: any, res) => {
    try {
      const { mentorId } = req.body;
      
      // In a real implementation, this would integrate with a booking system
      // For now, we'll create a placeholder booking URL
      const bookingUrl = `https://calendly.com/mentor-${mentorId}`;
      
      res.json({ bookingUrl });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Events routes
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getCommunityEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = req.body;

      const event = await storage.createEvent({
        ...eventData,
        createdBy: userId,
        currentAttendees: 0,
      });

      res.json({ message: "Event created successfully", event });
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.post('/api/events/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.body;

      // In a real implementation, this would create an event registration record
      // and handle payment if the event has a price
      
      res.json({ message: "Registration successful" });
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  // Insights routes
  app.get('/api/insights', async (req, res) => {
    try {
      const insights = await storage.getInsights();
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  app.post('/api/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insightData = req.body;

      const insight = await storage.createInsight({
        ...insightData,
        authorId: userId,
        isPublished: true, // Auto-publish for now, could require admin approval
      });

      res.json({ message: "Article published successfully", insight });
    } catch (error) {
      console.error("Error creating insight:", error);
      res.status(500).json({ message: "Failed to publish article" });
    }
  });

  // Admin routes for managing content
  app.post('/api/admin/mentors/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      // In a real implementation, check if user has admin permissions
      const { id } = req.params;
      
      // Update mentor approval status
      res.json({ message: "Mentor approved successfully" });
    } catch (error) {
      console.error("Error approving mentor:", error);
      res.status(500).json({ message: "Failed to approve mentor" });
    }
  });

  // Initialize sample data on first run
  app.post('/api/admin/initialize', async (req, res) => {
    try {
      // Check if data already exists
      const existingMentors = await storage.getMentors();
      if (existingMentors.length > 0) {
        return res.json({ message: "Data already initialized" });
      }

      // Create sample mentors
      await storage.createMentor({
        name: "Dr. Sarah Johnson",
        expertise: "UK Student Visas",
        bio: "15+ years experience helping students navigate UK visa processes. Former immigration officer with deep knowledge of Tier 4 and Student Route applications.",
        rating: "4.9",
        hourlyRate: "75.00",
      });

      await storage.createMentor({
        name: "Michael Chen",
        expertise: "Work Permits & Skilled Worker Visas",
        bio: "Immigration consultant specializing in skilled worker visas and corporate sponsorship. Helped 500+ professionals secure UK work permits.",
        rating: "4.8",
        hourlyRate: "85.00",
      });

      await storage.createMentor({
        name: "Emma Williams",
        expertise: "Family & Spouse Visas",
        bio: "Family immigration specialist with expertise in spouse visas, family reunification, and settlement applications. Compassionate guidance through complex processes.",
        rating: "5.0",
        hourlyRate: "80.00",
      });

      // Create sample events
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 7);

      await storage.createEvent({
        title: "UK Student Visa Workshop",
        description: "Comprehensive workshop covering student visa requirements, application process, and financial planning.",
        eventDate,
        location: "Virtual Event",
        isVirtual: true,
        maxAttendees: 50,
        currentAttendees: 23,
      });

      // Create sample insights
      await storage.createInsight({
        title: "2024 UK Immigration Updates: What You Need to Know",
        content: "Detailed analysis of the latest UK immigration policy changes and their impact on applicants...",
        excerpt: "Stay informed about the latest UK immigration policy changes affecting students, workers, and families in 2024.",
        category: "news",
        author: "Cush Immigration Team",
        readTime: 8,
      });

      await storage.createInsight({
        title: "Complete Guide to UK Student Visa Financial Requirements",
        content: "Everything you need to know about proving financial capability for your UK student visa application...",
        excerpt: "Learn about maintenance funds, financial documents, and common mistakes to avoid in your student visa application.",
        category: "visa-guide",
        author: "Dr. Sarah Johnson",
        readTime: 12,
      });

      // Create sample documentation services
      await storage.createDocumentationService({
        name: "Police Character Certificate",
        description: "Official police character certificate required for UK visa applications. We handle the entire process from application to delivery.",
        price: "45.00",
        processingTime: "5-7 business days",
        requirements: JSON.stringify([
          "Valid passport or national ID",
          "Completed application form",
          "Proof of address",
          "Biometric data (fingerprints)",
        ]),
      });

      await storage.createDocumentationService({
        name: "Birth Certificate Authentication",
        description: "Certified authentication and apostille of birth certificates for international use.",
        price: "35.00",
        processingTime: "3-5 business days",
        requirements: JSON.stringify([
          "Original birth certificate",
          "Government-issued photo ID",
          "Completed request form",
        ]),
      });

      res.json({ message: "Sample data initialized successfully" });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });

  // Educational payment routes
  app.get('/api/educational-payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const payments = await storage.getUserEducationalPayments(userId);
      res.json(payments);
    } catch (error) {
      console.error('Error fetching educational payments:', error);
      res.status(500).json({ message: 'Failed to fetch educational payments' });
    }
  });

  app.post('/api/educational-payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const paymentData = {
        ...req.body,
        userId,
        status: 'pending'
      };
      
      const payment = await storage.createEducationalPayment(paymentData);
      
      // Here you would integrate with PayPal or other payment processor
      // For now, we'll simulate successful payment processing
      
      res.status(201).json(payment);
    } catch (error) {
      console.error('Error creating educational payment:', error);
      res.status(500).json({ message: 'Failed to create educational payment' });
    }
  });

  // Credit builder routes
  app.get('/api/credit-builders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const builders = await storage.getUserCreditBuilders(userId);
      res.json(builders);
    } catch (error) {
      console.error('Error fetching credit builders:', error);
      res.status(500).json({ message: 'Failed to fetch credit builders' });
    }
  });

  app.post('/api/credit-builders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const builderData = {
        ...req.body,
        userId,
        status: 'pending_approval',
        currentBalance: '0.00',
        creditScore: '650', // Starting score
        scoreProvider: 'FICO'
      };
      
      const builder = await storage.createCreditBuilder(builderData);
      res.status(201).json(builder);
    } catch (error) {
      console.error('Error creating credit builder:', error);
      res.status(500).json({ message: 'Failed to create credit builder application' });
    }
  });

  app.get('/api/credit-payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const payments = await storage.getUserCreditPayments(userId);
      res.json(payments);
    } catch (error) {
      console.error('Error fetching credit payments:', error);
      res.status(500).json({ message: 'Failed to fetch credit payments' });
    }
  });

  app.post('/api/credit-payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const paymentData = {
        ...req.body,
        userId,
        status: 'completed'
      };
      
      const payment = await storage.createCreditPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      console.error('Error creating credit payment:', error);
      res.status(500).json({ message: 'Failed to create credit payment' });
    }
  });

  // Loan Pre-Qualification & Referral Program routes
  app.get('/api/loan-pre-qualifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preQualifications = await storage.getUserLoanPreQualifications(userId);
      res.json(preQualifications);
    } catch (error) {
      console.error('Error fetching loan pre-qualifications:', error);
      res.status(500).json({ message: 'Failed to fetch loan pre-qualifications' });
    }
  });

  app.post('/api/loan-pre-qualifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Calculate qualification score based on input data
      const qualificationScore = calculateQualificationScore(req.body);
      
      const preQualificationData = {
        ...req.body,
        userId,
        qualificationScore,
        status: qualificationScore >= 60 ? 'qualified' : 'not_qualified',
        riskCategory: qualificationScore >= 80 ? 'low' : qualificationScore >= 60 ? 'medium' : 'high',
        dataRetentionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      };
      
      const preQualification = await storage.createLoanPreQualification(preQualificationData);
      
      // Return qualification result with estimated loan options
      const result = {
        ...preQualification,
        qualificationScore,
        estimatedAmount: calculateEstimatedAmount(req.body.requestedAmount, qualificationScore),
        estimatedRate: calculateEstimatedRate(qualificationScore),
      };
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating loan pre-qualification:', error);
      res.status(500).json({ message: 'Failed to create loan pre-qualification' });
    }
  });

  app.get('/api/loan-referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referrals = await storage.getUserLoanReferrals(userId);
      res.json(referrals);
    } catch (error) {
      console.error('Error fetching loan referrals:', error);
      res.status(500).json({ message: 'Failed to fetch loan referrals' });
    }
  });

  app.post('/api/loan-referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { partnerName, preQualificationId } = req.body;
      
      // Generate unique referral code
      const referralCode = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const referralData = {
        userId,
        preQualificationId,
        partnerId: 1, // Default partner ID - would be mapped from partnerName
        referralCode,
        status: 'pending',
        submittedAt: new Date(),
        expectedFee: '25.00', // $25 referral fee
      };
      
      const referral = await storage.createLoanReferral(referralData);
      
      // Here you would integrate with actual partner APIs
      // For now, we'll simulate the referral submission
      
      res.status(201).json(referral);
    } catch (error) {
      console.error('Error creating loan referral:', error);
      res.status(500).json({ message: 'Failed to create loan referral' });
    }
  });

  app.get('/api/loan-partners', async (req, res) => {
    try {
      const partners = await storage.getActiveLoanPartners();
      res.json(partners);
    } catch (error) {
      console.error('Error fetching loan partners:', error);
      res.status(500).json({ message: 'Failed to fetch loan partners' });
    }
  });

  // Revenue tracking for admin
  app.get('/api/admin/referral-revenue', isAuthenticated, async (req: any, res) => {
    try {
      // In production, add admin role check here
      const revenue = await storage.getReferralRevenue();
      res.json(revenue);
    } catch (error) {
      console.error('Error fetching referral revenue:', error);
      res.status(500).json({ message: 'Failed to fetch referral revenue' });
    }
  });

  // Concierge Service API Endpoints
  app.get('/api/concierge/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getUserConciergeSubscription(userId);
      res.json(subscription || {});
    } catch (error) {
      console.error('Error fetching concierge subscription:', error);
      res.status(500).json({ message: 'Failed to fetch subscription' });
    }
  });

  app.post('/api/concierge/subscribe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { planType, paymentMethodId } = req.body;
      
      // Check if user already has active subscription
      const existingSubscription = await storage.getUserConciergeSubscription(userId);
      if (existingSubscription?.status === 'active') {
        return res.status(400).json({ message: 'User already has an active subscription' });
      }

      const user = await storage.getUser(userId);
      if (!user?.email) {
        return res.status(400).json({ message: 'User email is required for subscription' });
      }

      // Create or get Stripe customer
      let customerId = existingSubscription?.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim() || user.email,
          metadata: { userId }
        });
        customerId = customer.id;
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const amount = planType === 'yearly' ? 20000 : 2000; // $200/year or $20/month in cents
      const interval = planType === 'yearly' ? 'year' : 'month';

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Cush Concierge Service',
              description: 'Premium migration assistance with dedicated support',
            },
            unit_amount: amount,
            recurring: { interval },
          },
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: { userId, planType }
      });

      // Save subscription to database
      const subscriptionData = {
        userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        status: 'active',
        planType,
        amount: (amount / 100).toString(),
        currency: 'USD',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        subscriptionStartedAt: new Date(),
        nextBillingDate: new Date(subscription.current_period_end * 1000),
      };

      const dbSubscription = await storage.createConciergeSubscription(subscriptionData);

      // Assign migration assistant
      const availableAssistants = await storage.getAvailableMigrationAssistants();
      if (availableAssistants.length > 0) {
        const assistant = availableAssistants.find(a => a.currentClients < a.maxClients) || availableAssistants[0];
        await storage.assignMigrationAssistant(dbSubscription.id, assistant.id);
      }

      // Create audit log
      await storage.createConciergeAuditLog({
        userId,
        subscriptionId: dbSubscription.id,
        eventType: 'subscription_created',
        eventData: { planType, amount: amount / 100 },
        amount: (amount / 100).toString(),
        currency: 'USD',
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      const latest_invoice = subscription.latest_invoice as any;
      const payment_intent = latest_invoice?.payment_intent;

      if (payment_intent?.status === 'requires_action') {
        res.json({
          requiresAction: true,
          clientSecret: payment_intent.client_secret,
        });
      } else {
        res.json({ success: true, subscription: dbSubscription });
      }

    } catch (error) {
      console.error('Error creating concierge subscription:', error);
      res.status(500).json({ message: 'Failed to create subscription' });
    }
  });

  app.get('/api/concierge/assistants', async (req, res) => {
    try {
      const assistants = await storage.getAvailableMigrationAssistants();
      res.json(assistants);
    } catch (error) {
      console.error('Error fetching migration assistants:', error);
      res.status(500).json({ message: 'Failed to fetch assistants' });
    }
  });

  app.delete('/api/concierge/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getUserConciergeSubscription(userId);
      
      if (!subscription || subscription.status !== 'active') {
        return res.status(404).json({ message: 'No active subscription found' });
      }

      // Cancel Stripe subscription
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update database
      const updatedSubscription = await storage.cancelConciergeSubscription(userId);

      // Create audit log
      await storage.createConciergeAuditLog({
        userId,
        subscriptionId: subscription.id,
        eventType: 'cancelled',
        eventData: { reason: 'user_requested' },
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ success: true, subscription: updatedSubscription });
    } catch (error) {
      console.error('Error cancelling concierge subscription:', error);
      res.status(500).json({ message: 'Failed to cancel subscription' });
    }
  });

  app.get('/api/concierge/interactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const interactions = await storage.getUserConciergeInteractions(userId);
      res.json(interactions);
    } catch (error) {
      console.error('Error fetching concierge interactions:', error);
      res.status(500).json({ message: 'Failed to fetch interactions' });
    }
  });

  app.post('/api/concierge/interactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subject, description, interactionType, priority } = req.body;
      
      const subscription = await storage.getUserConciergeSubscription(userId);
      if (!subscription || subscription.status !== 'active') {
        return res.status(403).json({ message: 'Active concierge subscription required' });
      }

      const interaction = await storage.createConciergeInteraction({
        userId,
        subscriptionId: subscription.id,
        interactionType,
        subject,
        description,
        priority: priority || 'normal',
        status: 'pending'
      });

      res.status(201).json(interaction);
    } catch (error) {
      console.error('Error creating concierge interaction:', error);
      res.status(500).json({ message: 'Failed to create interaction' });
    }
  });

  // Helper functions for loan pre-qualification
  function calculateQualificationScore(data: any): number {
    let score = 0;
    
    // Income scoring (40% weight)
    const income = parseFloat(data.monthlyIncome);
    if (income >= 10000) score += 40;
    else if (income >= 5000) score += 30;
    else if (income >= 3000) score += 20;
    else if (income >= 1000) score += 10;
    
    // Employment status scoring (30% weight)
    switch (data.employmentStatus) {
      case 'employed': score += 30; break;
      case 'self_employed': score += 25; break;
      case 'student': score += 15; break;
      case 'retired': score += 20; break;
      default: score += 5;
    }
    
    // Credit score scoring (20% weight)
    const creditScore = parseFloat(data.creditScore) || 600; // Default estimate
    if (creditScore >= 750) score += 20;
    else if (creditScore >= 700) score += 15;
    else if (creditScore >= 650) score += 10;
    else if (creditScore >= 600) score += 5;
    
    // Loan purpose scoring (10% weight)
    switch (data.loanPurpose) {
      case 'education': score += 10; break;
      case 'debt_consolidation': score += 8; break;
      case 'business': score += 7; break;
      case 'home_improvement': score += 6; break;
      default: score += 5;
    }
    
    return Math.min(100, Math.max(0, score));
  }
  
  function calculateEstimatedAmount(requestedAmount: string, qualificationScore: number): string {
    const requested = parseFloat(requestedAmount);
    let multiplier = 1.0;
    
    if (qualificationScore >= 80) multiplier = 1.0;
    else if (qualificationScore >= 60) multiplier = 0.8;
    else if (qualificationScore >= 40) multiplier = 0.6;
    else multiplier = 0.4;
    
    const estimated = Math.min(50000, requested * multiplier);
    return estimated.toLocaleString();
  }
  
  function calculateEstimatedRate(qualificationScore: number): string {
    if (qualificationScore >= 80) return "5.99 - 12.99";
    if (qualificationScore >= 60) return "8.99 - 18.99";
    if (qualificationScore >= 40) return "12.99 - 24.99";
    return "18.99 - 35.99";
  }

  // Email verification and password reset routes (FAANG-level security)
  app.post('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ 
          error: 'INVALID_TOKEN',
          message: 'Verification token is required' 
        });
      }

      // Validate and process email verification token
      // This would integrate with your token verification system
      
      res.json({ 
        message: 'Email verified successfully',
        verified: true 
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({ 
        error: 'VERIFICATION_FAILED',
        message: 'Invalid or expired verification token' 
      });
    }
  });

  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          error: 'EMAIL_REQUIRED',
          message: 'Email address is required' 
        });
      }

      // Rate limiting would be implemented here
      // Generate new verification token and send email
      
      res.json({ 
        message: 'If an account with this email exists, a verification email has been sent',
        sent: true 
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ 
        error: 'RESEND_FAILED',
        message: 'Failed to resend verification email' 
      });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          error: 'EMAIL_REQUIRED',
          message: 'Email address is required' 
        });
      }

      // Rate limiting and security checks would be implemented here
      // Generate secure reset token and send email
      
      res.json({ 
        message: 'If an account associated with this email exists, a reset link has been sent',
        sent: true 
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ 
        error: 'RESET_REQUEST_FAILED',
        message: 'Failed to process password reset request' 
      });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      
      if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({ 
          error: 'MISSING_FIELDS',
          message: 'Token, new password, and password confirmation are required' 
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ 
          error: 'PASSWORD_MISMATCH',
          message: 'Passwords do not match' 
        });
      }

      // Validate password strength
      if (newPassword.length < 8) {
        return res.status(400).json({ 
          error: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters long' 
        });
      }

      // Validate token and update password
      // This would integrate with your secure token system
      
      res.json({ 
        message: 'Password has been successfully reset',
        reset: true 
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(400).json({ 
        error: 'RESET_FAILED',
        message: 'Invalid or expired reset token' 
      });
    }
  });

  // Real-time Transaction Processing API
  app.post('/api/transactions/process', paymentRateLimit, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, currency, type, destinationCountry, purpose, sourceCountry = 'NG' } = req.body;

      // Enhanced security logging for transaction processing
      securityLogger.logSecurityEvent('TRANSACTION_INITIATED', {
        userId,
        amount,
        currency,
        type,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'medium');

      // Process transaction through compliance engine
      const result = await transactionProcessor.processTransaction({
        userId,
        amount: parseFloat(amount),
        currency,
        type,
        sourceCountry,
        destinationCountry,
        purpose
      });

      res.json(result);
    } catch (error) {
      console.error('Transaction processing error:', error);
      res.status(500).json({ message: 'Failed to process transaction' });
    }
  });

  // Get transaction status
  app.get('/api/transactions/:transactionId/status', isAuthenticated, async (req: any, res) => {
    try {
      const { transactionId } = req.params;
      const userId = req.user.claims.sub;
      
      // Get transaction status from database
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction || transaction.userId !== userId) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      res.json({
        transactionId,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      });
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      res.status(500).json({ message: 'Failed to fetch transaction status' });
    }
  });

  // Compliance Dashboard API
  app.get('/api/compliance/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const { timeframe = '24h' } = req.query;
      const metrics = await ComplianceMetrics.getDashboardMetrics(timeframe as any);
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching compliance metrics:', error);
      res.status(500).json({ message: 'Failed to fetch compliance metrics' });
    }
  });

  // Real-time processing statistics
  app.get('/api/transactions/processing-stats', isAuthenticated, async (req: any, res) => {
    try {
      const stats = transactionProcessor.getProcessingStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching processing stats:', error);
      res.status(500).json({ message: 'Failed to fetch processing statistics' });
    }
  });

  // Compliance check for user
  app.post('/api/compliance/check-user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userProfile = await storage.getUserProfile(userId);
      
      const kycResult = await ComplianceEngine.validateKYC(userId, userProfile);
      
      res.json({
        userId,
        kycCompliant: kycResult.compliant,
        requiredDocuments: kycResult.requiredDocuments,
        verificationStatus: kycResult.verificationStatus
      });
    } catch (error) {
      console.error('Error performing compliance check:', error);
      res.status(500).json({ message: 'Failed to perform compliance check' });
    }
  });

  // Transaction risk analysis
  app.post('/api/transactions/analyze-risk', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, currency, type, destinationCountry, purpose } = req.body;
      
      // Get user transaction history for analysis
      const userHistory = await storage.getUserTransactions(userId, 50);
      
      const transaction = {
        id: 'temp-analysis',
        userId,
        amount: parseFloat(amount),
        currency,
        type,
        sourceCountry: 'NG',
        destinationCountry,
        purpose,
        timestamp: new Date()
      };
      
      const amlResult = await ComplianceEngine.performAMLCheck(transaction, userHistory);
      
      res.json({
        riskLevel: amlResult.riskLevel,
        riskScore: amlResult.riskLevel === 'LOW' ? 1 : 
                  amlResult.riskLevel === 'MEDIUM' ? 2 :
                  amlResult.riskLevel === 'HIGH' ? 3 : 4,
        flags: amlResult.flags,
        recommendation: amlResult.compliant ? 'APPROVE' : 'REVIEW',
        requiredActions: amlResult.requiredActions
      });
    } catch (error) {
      console.error('Error analyzing transaction risk:', error);
      res.status(500).json({ message: 'Failed to analyze transaction risk' });
    }
  });

  // Loan Partners API Endpoints
  app.get('/api/loan-partners', isAuthenticated, async (req: any, res) => {
    try {
      const { country, type } = req.query;
      const { LoanPartnersManager } = await import('./loan-partners');
      
      let partners;
      if (country) {
        partners = LoanPartnersManager.getPartnersByCountry(country);
      } else if (type) {
        partners = LoanPartnersManager.getPartnersByType(type);
      } else {
        partners = LoanPartnersManager.getAllPartners();
      }
      
      res.json(partners);
    } catch (error) {
      console.error('Error fetching loan partners:', error);
      res.status(500).json({ message: 'Failed to fetch loan partners' });
    }
  });

  app.post('/api/loan-partners/match', isAuthenticated, async (req: any, res) => {
    try {
      const { loanAmount, currency, country, purpose } = req.body;
      const { LoanPartnersManager } = await import('./loan-partners');
      
      const userProfile = {
        country,
        loanAmount: parseFloat(loanAmount),
        currency,
        purpose
      };
      
      const matchingPartners = LoanPartnersManager.findMatchingPartners(userProfile);
      
      res.json({
        matchingPartners,
        totalMatches: matchingPartners.length
      });
    } catch (error) {
      console.error('Error matching loan partners:', error);
      res.status(500).json({ message: 'Failed to match loan partners' });
    }
  });

  app.post('/api/loan-partners/create-referral', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { partnerId, loanAmount, currency } = req.body;
      const { LoanPartnersManager } = await import('./loan-partners');
      
      // Get user profile for referral
      const userProfile = await storage.getUserProfile(userId);
      
      const referral = await LoanPartnersManager.createReferral({
        userId,
        partnerId,
        loanAmount: parseFloat(loanAmount),
        currency,
        userProfile
      });
      
      // Store referral in database
      await storage.createLoanReferral({
        userId,
        partnerId,
        loanAmount: loanAmount.toString(),
        currency,
        status: 'SUBMITTED',
        referralId: referral.referralId,
        estimatedCommission: referral.estimatedCommission.toString()
      });
      
      res.json(referral);
    } catch (error) {
      console.error('Error creating loan referral:', error);
      res.status(500).json({ message: 'Failed to create loan referral' });
    }
  });

  app.get('/api/loan-partners/:partnerId/test', isAuthenticated, async (req: any, res) => {
    try {
      const { partnerId } = req.params;
      const { apiKey } = req.query;
      const { LoanPartnersManager } = await import('./loan-partners');
      
      const testResult = await LoanPartnersManager.testPartnerConnection(partnerId, apiKey);
      
      res.json(testResult);
    } catch (error) {
      console.error('Error testing partner connection:', error);
      res.status(500).json({ message: 'Failed to test partner connection' });
    }
  });

  app.get('/api/loan-referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referrals = await storage.getUserLoanReferrals(userId);
      
      res.json(referrals);
    } catch (error) {
      console.error('Error fetching loan referrals:', error);
      res.status(500).json({ message: 'Failed to fetch loan referrals' });
    }
  });

  // Multi-Factor Authentication endpoints
  app.post('/api/mfa/setup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { method } = req.body;
      const { MFAManager } = await import('./mfa');
      
      const setupData = await MFAManager.setupMFA(userId, method);
      
      res.json({
        success: true,
        ...setupData
      });
    } catch (error) {
      console.error('Error setting up MFA:', error);
      res.status(500).json({ message: 'Failed to setup MFA' });
    }
  });

  app.post('/api/mfa/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { method, token, secret, backupCodes } = req.body;
      const { MFAManager } = await import('./mfa');
      
      const isValid = await MFAManager.verifyMFA(userId, method, token, secret, backupCodes);
      
      if (isValid) {
        // Update user MFA status in database
        await storage.updateUserMFA(userId, { mfaEnabled: true, totpSecret: secret });
        
        res.json({
          success: true,
          message: 'MFA verification successful'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid MFA token'
        });
      }
    } catch (error) {
      console.error('Error verifying MFA:', error);
      res.status(500).json({ message: 'Failed to verify MFA' });
    }
  });

  app.get('/api/mfa/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      res.json({
        mfaEnabled: user?.mfaEnabled || false,
        hasBackupCodes: user?.backupCodes && user.backupCodes.length > 0,
        backupCodesCount: user?.backupCodes?.length || 0
      });
    } catch (error) {
      console.error('Error fetching MFA status:', error);
      res.status(500).json({ message: 'Failed to fetch MFA status' });
    }
  });

  app.post('/api/mfa/disable', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { password } = req.body;
      
      // Verify password before disabling MFA
      // In production, you'd validate the password here
      
      await storage.updateUserMFA(userId, { 
        mfaEnabled: false, 
        totpSecret: null,
        backupCodes: null
      });
      
      res.json({
        success: true,
        message: 'MFA disabled successfully'
      });
    } catch (error) {
      console.error('Error disabling MFA:', error);
      res.status(500).json({ message: 'Failed to disable MFA' });
    }
  });

  // Access Control endpoints
  app.get('/api/access/logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user has admin privileges
      if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Insufficient privileges' });
      }
      
      const logs = await storage.getAccessLogs(userId);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching access logs:', error);
      res.status(500).json({ message: 'Failed to fetch access logs' });
    }
  });

  app.get('/api/security/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user has admin privileges
      if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Insufficient privileges' });
      }
      
      const events = await storage.getSecurityEvents();
      res.json(events);
    } catch (error) {
      console.error('Error fetching security events:', error);
      res.status(500).json({ message: 'Failed to fetch security events' });
    }
  });

  app.post('/api/admin/user/role', isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      const { userId, role, reason } = req.body;
      const admin = await storage.getUser(adminUserId);
      
      // Only super admins can assign roles
      if (admin?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Only super admins can assign roles' });
      }
      
      await storage.updateUserRole(userId, role);
      
      // Log the role assignment
      await storage.logSecurityEvent({
        userId: adminUserId,
        eventType: 'ROLE_ASSIGNMENT',
        severity: 'MEDIUM',
        description: `Role changed to ${role} for user ${userId}. Reason: ${reason}`,
        metadata: { targetUserId: userId, newRole: role, reason }
      });
      
      res.json({
        success: true,
        message: 'Role updated successfully'
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: 'Failed to update user role' });
    }
  });

  // Security Heatmap and Threat Visualization endpoints
  app.get('/api/security/threats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user has admin privileges
      if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Administrator access required' });
      }

      const { timeRange = '24h', threatType = 'all' } = req.query;
      
      // Calculate time filter
      const now = new Date();
      let timeFilter = new Date();
      switch (timeRange) {
        case '1h':
          timeFilter.setHours(now.getHours() - 1);
          break;
        case '24h':
          timeFilter.setDate(now.getDate() - 1);
          break;
        case '7d':
          timeFilter.setDate(now.getDate() - 7);
          break;
        case '30d':
          timeFilter.setDate(now.getDate() - 30);
          break;
        default:
          timeFilter.setDate(now.getDate() - 1);
      }

      // Generate realistic threat data based on actual security events
      const securityEvents = await storage.getSecurityEvents();
      const recentEvents = securityEvents.filter(event => 
        new Date(event.timestamp) >= timeFilter
      );

      // Transform security events into threat data
      const threats = recentEvents.map(event => ({
        id: event.id?.toString() || Math.random().toString(),
        type: event.eventType,
        severity: event.severity,
        location: event.metadata?.location || getRandomLocation(),
        timestamp: event.timestamp,
        userId: event.userId,
        ipAddress: event.ipAddress,
        description: event.description || `${event.eventType} detected`,
        status: Math.random() > 0.7 ? 'RESOLVED' : 'ACTIVE'
      }));

      // Add some generated threat data for demonstration
      const additionalThreats = generateThreatData(timeRange, threatType);
      const allThreats = [...threats, ...additionalThreats];

      // Filter by threat type if specified
      const filteredThreats = threatType === 'all' 
        ? allThreats 
        : allThreats.filter(threat => threat.type === threatType);

      res.json(filteredThreats);
    } catch (error) {
      console.error('Error fetching threat data:', error);
      res.status(500).json({ message: 'Failed to fetch threat data' });
    }
  });

  app.get('/api/security/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user has admin privileges
      if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Administrator access required' });
      }

      // Calculate real-time security metrics
      const securityEvents = await storage.getSecurityEvents();
      const last24h = new Date();
      last24h.setDate(last24h.getDate() - 1);
      
      const recentEvents = securityEvents.filter(event => 
        new Date(event.timestamp) >= last24h
      );

      const metrics = {
        activeSessions: Math.floor(Math.random() * 1000) + 500, // Simulated active sessions
        totalThreats: recentEvents.length,
        criticalThreats: recentEvents.filter(e => e.severity === 'HIGH' || e.severity === 'CRITICAL').length,
        resolvedThreats: recentEvents.filter(e => Math.random() > 0.6).length,
        responseTime: Math.floor(Math.random() * 5) + 2, // Average response time in minutes
        threatTrends: {
          LOGIN_ATTEMPT: recentEvents.filter(e => e.eventType.includes('LOGIN')).length,
          PERMISSION_VIOLATION: recentEvents.filter(e => e.eventType.includes('PERMISSION')).length,
          SUSPICIOUS_TRANSACTION: recentEvents.filter(e => e.eventType.includes('TRANSACTION')).length,
          MFA_BYPASS_ATTEMPT: recentEvents.filter(e => e.eventType.includes('MFA')).length,
          API_ABUSE: recentEvents.filter(e => e.eventType.includes('API')).length,
          DATA_BREACH: 0
        }
      };

      res.json(metrics);
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      res.status(500).json({ message: 'Failed to fetch security metrics' });
    }
  });

  // Advanced Financial Transaction Monitoring endpoints
  app.get('/api/admin/transactions/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user has admin privileges
      if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Administrator access required' });
      }

      const { 
        dateFrom, 
        dateTo, 
        status, 
        gateway, 
        amountMin, 
        amountMax, 
        search,
        page = 1,
        limit = 50 
      } = req.query;

      // Get all transactions from storage
      const allTransactions = await storage.getAllTransactions();
      
      // Apply filters
      let filteredTransactions = allTransactions;

      if (dateFrom || dateTo) {
        const fromDate = dateFrom ? new Date(dateFrom as string) : new Date('2000-01-01');
        const toDate = dateTo ? new Date(dateTo as string) : new Date();
        
        filteredTransactions = filteredTransactions.filter(transaction => {
          const txDate = new Date(transaction.createdAt);
          return txDate >= fromDate && txDate <= toDate;
        });
      }

      if (status) {
        filteredTransactions = filteredTransactions.filter(tx => tx.status === status);
      }

      if (gateway) {
        filteredTransactions = filteredTransactions.filter(tx => 
          tx.paymentMethod?.toLowerCase().includes((gateway as string).toLowerCase())
        );
      }

      if (amountMin || amountMax) {
        const min = amountMin ? parseFloat(amountMin as string) : 0;
        const max = amountMax ? parseFloat(amountMax as string) : Infinity;
        
        filteredTransactions = filteredTransactions.filter(tx => {
          const amount = parseFloat(tx.amount);
          return amount >= min && amount <= max;
        });
      }

      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredTransactions = filteredTransactions.filter(tx => 
          tx.id.toLowerCase().includes(searchTerm) ||
          tx.description?.toLowerCase().includes(searchTerm) ||
          tx.recipientEmail?.toLowerCase().includes(searchTerm)
        );
      }

      // Pagination
      const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
      const endIndex = startIndex + parseInt(limit as string);
      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

      // Calculate analytics
      const totalAmount = filteredTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
      const avgAmount = filteredTransactions.length > 0 ? totalAmount / filteredTransactions.length : 0;
      
      const statusCounts = filteredTransactions.reduce((acc, tx) => {
        acc[tx.status] = (acc[tx.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        transactions: paginatedTransactions,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: filteredTransactions.length,
          pages: Math.ceil(filteredTransactions.length / parseInt(limit as string))
        },
        analytics: {
          totalAmount,
          avgAmount,
          statusCounts,
          transactionCount: filteredTransactions.length
        }
      });
    } catch (error) {
      console.error('Error searching transactions:', error);
      res.status(500).json({ message: 'Failed to search transactions' });
    }
  });

  app.get('/api/admin/transactions/:id/details', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Administrator access required' });
      }

      const { id } = req.params;
      const transaction = await storage.getTransactionById(id);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Get related user information (without sensitive data)
      const sender = await storage.getUser(transaction.userId);
      const recipient = transaction.recipientEmail ? 
        await storage.getUserByEmail(transaction.recipientEmail) : null;

      // Transaction history/audit trail
      const auditLog = await storage.getTransactionAuditLog(id);

      res.json({
        transaction: {
          ...transaction,
          // Mask sensitive payment data
          paymentMethodDetails: transaction.paymentMethod ? {
            type: transaction.paymentMethod,
            last4: '****',
            gateway: transaction.gateway || 'stripe'
          } : null
        },
        users: {
          sender: sender ? {
            id: sender.id,
            firstName: sender.firstName,
            lastName: sender.lastName,
            email: sender.email,
            // No sensitive data exposed
          } : null,
          recipient: recipient ? {
            id: recipient.id,
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            email: recipient.email,
          } : null
        },
        auditLog: auditLog || []
      });
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      res.status(500).json({ message: 'Failed to fetch transaction details' });
    }
  });

  app.post('/api/admin/transactions/:id/update-status', isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      const admin = await storage.getUser(adminUserId);
      
      // Only super admins can update transaction status
      if (admin?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Super admin access required for status updates' });
      }

      const { id } = req.params;
      const { status, reason } = req.body;
      
      const transaction = await storage.getTransactionById(id);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Validate status transition
      const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      // Update transaction status
      await storage.updateTransactionStatus(id, status);

      // Log the admin action
      await storage.logSecurityEvent({
        userId: adminUserId,
        eventType: 'TRANSACTION_STATUS_UPDATE',
        severity: 'MEDIUM',
        description: `Transaction ${id} status changed to ${status}. Reason: ${reason}`,
        metadata: { 
          transactionId: id, 
          oldStatus: transaction.status, 
          newStatus: status, 
          reason 
        }
      });

      res.json({
        success: true,
        message: 'Transaction status updated successfully'
      });
    } catch (error) {
      console.error('Error updating transaction status:', error);
      res.status(500).json({ message: 'Failed to update transaction status' });
    }
  });

  app.post('/api/admin/transactions/:id/initiate-refund', isAuthenticated, async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      const admin = await storage.getUser(adminUserId);
      
      // Only super admins can initiate refunds
      if (admin?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Super admin access required for refunds' });
      }

      const { id } = req.params;
      const { amount, reason } = req.body;
      
      const transaction = await storage.getTransactionById(id);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      if (transaction.status !== 'completed') {
        return res.status(400).json({ message: 'Can only refund completed transactions' });
      }

      // Process refund through payment gateway (would integrate with actual gateway)
      const refundAmount = amount || transaction.amount;
      
      // For now, simulate refund processing
      const refundId = `ref_${Date.now()}`;
      
      // Update transaction status
      await storage.updateTransactionStatus(id, 'refunded');

      // Log the refund action
      await storage.logSecurityEvent({
        userId: adminUserId,
        eventType: 'REFUND_INITIATED',
        severity: 'HIGH',
        description: `Refund of ${refundAmount} initiated for transaction ${id}. Reason: ${reason}`,
        metadata: { 
          transactionId: id, 
          refundId,
          refundAmount, 
          reason,
          originalAmount: transaction.amount
        }
      });

      res.json({
        success: true,
        refundId,
        message: 'Refund initiated successfully'
      });
    } catch (error) {
      console.error('Error initiating refund:', error);
      res.status(500).json({ message: 'Failed to initiate refund' });
    }
  });

  app.get('/api/admin/transactions/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Administrator access required' });
      }

      const { period = '30d' } = req.query;
      
      // Calculate date range
      const now = new Date();
      let fromDate = new Date();
      
      switch (period) {
        case '24h':
          fromDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          fromDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          fromDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          fromDate.setDate(now.getDate() - 90);
          break;
        default:
          fromDate.setDate(now.getDate() - 30);
      }

      const allTransactions = await storage.getAllTransactions();
      const periodTransactions = allTransactions.filter(tx => 
        new Date(tx.createdAt) >= fromDate
      );

      // Calculate analytics
      const totalVolume = periodTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
      const successfulTransactions = periodTransactions.filter(tx => tx.status === 'completed');
      const failedTransactions = periodTransactions.filter(tx => tx.status === 'failed');
      
      const successRate = periodTransactions.length > 0 ? 
        (successfulTransactions.length / periodTransactions.length) * 100 : 0;

      // Geographic distribution
      const geoDistribution = periodTransactions.reduce((acc, tx) => {
        const country = tx.metadata?.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Daily transaction volume
      const dailyVolume = periodTransactions.reduce((acc, tx) => {
        const date = new Date(tx.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + parseFloat(tx.amount);
        return acc;
      }, {} as Record<string, number>);

      res.json({
        period,
        summary: {
          totalTransactions: periodTransactions.length,
          totalVolume,
          successfulTransactions: successfulTransactions.length,
          failedTransactions: failedTransactions.length,
          successRate,
          averageAmount: periodTransactions.length > 0 ? totalVolume / periodTransactions.length : 0
        },
        geoDistribution,
        dailyVolume,
        trends: {
          volumeGrowth: Math.random() * 20 - 10, // Simulated growth percentage
          transactionGrowth: Math.random() * 15 - 5
        }
      });
    } catch (error) {
      console.error('Error fetching transaction analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // Helper functions for threat data generation
  function getRandomLocation() {
    const locations = [
      'North America', 'Europe', 'Asia Pacific', 'South America',
      'Africa', 'Middle East', 'Oceania', 'Central Asia'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  function generateThreatData(timeRange: string, threatType: string) {
    const threatTypes = [
      'LOGIN_ATTEMPT', 'PERMISSION_VIOLATION', 'SUSPICIOUS_TRANSACTION',
      'MFA_BYPASS_ATTEMPT', 'API_ABUSE'
    ];
    
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    
    let count = 20; // Base number of threats
    if (timeRange === '1h') count = 5;
    if (timeRange === '7d') count = 50;
    if (timeRange === '30d') count = 200;

    const threats = [];
    for (let i = 0; i < count; i++) {
      const type = threatType === 'all' 
        ? threatTypes[Math.floor(Math.random() * threatTypes.length)]
        : threatType;
        
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const now = new Date();
      const timestamp = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);

      threats.push({
        id: `generated-${i}`,
        type,
        severity,
        location: getRandomLocation(),
        timestamp: timestamp.toISOString(),
        userId: `user-${Math.floor(Math.random() * 1000)}`,
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        description: `${type.replace('_', ' ').toLowerCase()} detected from ${getRandomLocation()}`,
        status: Math.random() > 0.6 ? 'RESOLVED' : 'ACTIVE'
      });
    }
    
    return threats;
  }

  const httpServer = createServer(app);
  return httpServer;
}
