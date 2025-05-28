import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import type { Express } from "express";

export function setupGoogleAuth(app: Express) {
  // Configure Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error("No email found in Google profile"));
      }

      // Check if user exists
      let user = await storage.getUserByEmail(email);

      if (user) {
        // Update user info from Google
        await storage.updateUser(user.id, {
          firstName: profile.name?.givenName || user.firstName,
          lastName: profile.name?.familyName || user.lastName,
          profileImageUrl: profile.photos?.[0]?.value || user.profileImageUrl,
          isEmailVerified: true
        });
        user = await storage.getUser(user.id);
      } else {
        // Create new user
        user = await storage.createUser({
          email,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          profileImageUrl: profile.photos?.[0]?.value,
          isEmailVerified: true,
          acceptTerms: true,
          acceptPrivacy: true
        });

        // Create default wallets for new user
        await storage.createWallet({
          userId: user.id,
          currency: 'NGN',
          balance: '0.00',
          isActive: true
        });

        await storage.createWallet({
          userId: user.id,
          currency: 'GBP',
          balance: '0.00',
          isActive: true
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth routes
  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth?error=oauth_failed' }),
    (req, res) => {
      // Successful authentication, redirect to dashboard
      res.redirect('/dashboard');
    }
  );
}