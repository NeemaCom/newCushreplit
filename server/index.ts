import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { 
  securityHeaders, 
  apiRateLimit, 
  validateRequest,
  securityLogger,
  maskSensitiveData 
} from "./security";

const app = express();

// Apply enterprise security headers first
app.use(securityHeaders);

// Trust proxy for accurate IP detection
app.set('trust proxy', 1);

// Apply rate limiting to API routes
app.use('/api/', apiRateLimit);

// Secure body parsing with limits
app.use(express.json({ 
  limit: "10mb",
  verify: (req, res, buffer) => {
    if (buffer.length > 1024 * 1024) { // Log large payloads
      securityLogger.logSuspiciousActivity(
        req.ip || 'unknown',
        'LARGE_PAYLOAD',
        { size: buffer.length, path: req.path }
      );
    }
  }
}));
app.use(express.urlencoded({ 
  extended: false, 
  limit: "10mb",
  parameterLimit: 100 
}));

// Request validation and sanitization
app.use(validateRequest);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Add health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      security: 'enterprise-grade'
    });
  });

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const ip = req.ip || req.connection.remoteAddress;

    // Mask sensitive data for logging
    const sanitizedBody = maskSensitiveData(req.body);
    
    // Log security-relevant errors
    if (status === 401 || status === 403 || status === 429) {
      securityLogger.logSecurityEvent('ERROR_RESPONSE', {
        status,
        message,
        ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        body: sanitizedBody
      }, status === 429 ? 'high' : 'medium');
    }

    log(`Security Error ${status}: ${message} from ${ip}`);
    
    // Don't leak sensitive error details in production
    const responseMessage = process.env.NODE_ENV === 'production' && status >= 500
      ? 'Internal server error'
      : message;

    res.status(status).json({ 
      message: responseMessage,
      timestamp: new Date().toISOString()
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
