import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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

  const httpServer = createServer(app);
  return httpServer;
}
