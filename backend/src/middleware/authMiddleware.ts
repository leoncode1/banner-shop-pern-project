import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Hard-assert env variable at load time
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET is not defined");
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}
// Removed blind casting
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // No longer read from authorization header
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({message: "Unauthorized."});
    }

    try{
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

      if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("userId" in decoded) ||
      !("role" in decoded)
      ) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      req.user = {
        userId: decoded.userId as string,
        role: decoded.role as string,
      };

      next();

    } catch(error){
      return res.status(401).json({message: "Invalid or expired token"});
    }
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// Look at this for refresh token soon
export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const authHeader = req.headers.authorization;
    const token = req.cookies.accessToken;

    if(!token){
      return next(); // No cookie = guest
    }

    try{
      const decoded =jwt.verify(token, ACCESS_TOKEN_SECRET);

      if(
        typeof decoded !== "object" || decoded === null ||
        !("userId" in decoded) || !("role" in decoded)  
      ){
        return next();
      }

        req.user = {
          userId: decoded.userId as string,
          role: decoded.role as string,
        };

    }catch(error){
      // Ignore invalid token
    }

    next();
  } catch {
    // Ignore invalid token for optional auth
  }
  // Remove next();
};
