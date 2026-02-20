import rateLimit from "express-rate-limit";

// General limiter (optional for global use)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for guest lookup
export const guestLookupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // only 10 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many lookup attempts. Please try again later."
  }
});
