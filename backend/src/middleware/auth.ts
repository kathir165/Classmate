import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/asyncHandler.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing or invalid authorization header.");
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    throw new ApiError(401, "Session expired or invalid. Please log in again.");
  }
}
