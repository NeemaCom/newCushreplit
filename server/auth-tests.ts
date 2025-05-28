import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from './index';
import { storage } from './storage';

describe('Authentication System Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'SecurePassword123!',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    country: 'Nigeria'
  };

  beforeEach(async () => {
    // Clean up test data before each test
    await storage.deleteUserByEmail?.(testUser.email);
  });

  afterEach(async () => {
    // Clean up test data after each test
    await storage.deleteUserByEmail?.(testUser.email);
  });

  describe('User Registration', () => {
    test('should successfully register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('Account created successfully')
      });
      expect(response.body.user).toMatchObject({
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName
      });
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    test('should reject registration with missing required fields', async () => {
      const incompleteUser = { email: testUser.email };
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(incompleteUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should reject registration with invalid email format', async () => {
      const invalidUser = { ...testUser, email: 'invalid-email' };
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Invalid email format');
    });

    test('should reject registration with weak password', async () => {
      const weakPasswordUser = { ...testUser, password: '123' };
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Password must be at least 8 characters');
    });

    test('should reject duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      // Attempt duplicate registration
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('User Sign In', () => {
    beforeEach(async () => {
      // Create a user for sign-in tests
      await request(app)
        .post('/api/auth/signup')
        .send(testUser);
    });

    test('should successfully sign in with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('signed in successfully')
      });
      expect(response.body.user).toMatchObject({
        email: testUser.email,
        firstName: testUser.firstName
      });
      expect(response.headers['set-cookie']).toBeDefined(); // Session cookie should be set
    });

    test('should reject sign in with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should reject sign in with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should reject sign in with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Session Management', () => {
    let userAgent: any;

    beforeEach(async () => {
      // Create and sign in user
      await request(app)
        .post('/api/auth/signup')
        .send(testUser);
      
      userAgent = request.agent(app);
      await userAgent
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password
        });
    });

    test('should access protected route with valid session', async () => {
      const response = await userAgent
        .get('/api/auth/user')
        .expect(200);

      expect(response.body).toMatchObject({
        email: testUser.email,
        firstName: testUser.firstName
      });
    });

    test('should reject access to protected route without session', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .expect(401);

      expect(response.body.message).toContain('Unauthorized');
    });

    test('should successfully sign out and invalidate session', async () => {
      // Sign out
      await userAgent
        .post('/api/auth/signout')
        .expect(200);

      // Try to access protected route after sign out
      const response = await userAgent
        .get('/api/auth/user')
        .expect(401);

      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('Password Security', () => {
    test('should hash passwords before storing', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      const storedUser = await storage.getUserByEmail(testUser.email);
      expect(storedUser?.password).toBeDefined();
      expect(storedUser?.password).not.toBe(testUser.password); // Should be hashed
      expect(storedUser?.password).toMatch(/^\$2[aby]?\$\d+\$/); // bcrypt hash format
    });

    test('should verify password correctly during sign in', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    test('should rate limit repeated failed sign in attempts', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      // Make multiple failed attempts
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/auth/signin')
          .send({
            email: testUser.email,
            password: 'WrongPassword'
          });
      }

      // Next attempt should be rate limited
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: 'WrongPassword'
        })
        .expect(429);

      expect(response.body.message).toContain('Too many requests');
    });
  });

  describe('Input Validation', () => {
    test('should sanitize user input to prevent XSS', async () => {
      const maliciousUser = {
        ...testUser,
        firstName: '<script>alert("xss")</script>',
        lastName: '<img src=x onerror=alert(1)>'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(maliciousUser)
        .expect(201);

      expect(response.body.user.firstName).not.toContain('<script>');
      expect(response.body.user.lastName).not.toContain('<img');
    });

    test('should validate phone number format', async () => {
      const invalidPhoneUser = { ...testUser, phoneNumber: '123' };
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(invalidPhoneUser)
        .expect(400);

      expect(response.body.errors).toContain('Invalid phone number format');
    });
  });
});

// Security Tests
describe('Security Tests', () => {
  test('should not expose sensitive information in error messages', async () => {
    const response = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'nonexistent@example.com',
        password: 'password'
      })
      .expect(401);

    expect(response.body.message).not.toContain('user not found');
    expect(response.body.message).not.toContain('database');
    expect(response.body.message).toBe('Invalid credentials');
  });

  test('should set secure headers', async () => {
    const response = await request(app)
      .get('/api/auth/user')
      .expect(401);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
  });

  test('should use HTTPS-only cookies in production', async () => {
    process.env.NODE_ENV = 'production';
    
    const response = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'test@example.com',
        password: 'password'
      });

    const cookies = response.headers['set-cookie'];
    if (cookies) {
      expect(cookies.some((cookie: string) => cookie.includes('Secure'))).toBe(true);
    }
    
    process.env.NODE_ENV = 'development';
  });
});