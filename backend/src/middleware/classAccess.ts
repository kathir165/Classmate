import type { Request, Response, NextFunction } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { classMembers } from "../db/schema.js";
import { ApiError } from "../utils/asyncHandler.js";

declare global {
  namespace Express {
    interface Request {
      membership?: { classId: string; role: "student" | "admin" };
    }
  }
}

/**
 * Ensures the authenticated user belongs to the class referenced by
 * `classId` (route param, or explicitly passed field name). Attaches
 * the membership (including role) to the request for downstream use.
 * This check ALWAYS happens server-side — never trust the client.
 */
export function requireClassMembership(paramName = "classId") {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const classId = req.params[paramName] || req.body[paramName];
    if (!classId) throw new ApiError(400, "classId is required.");

    const [membership] = await db
      .select()
      .from(classMembers)
      .where(and(eq(classMembers.classId, classId), eq(classMembers.userId, req.userId!)))
      .limit(1);

    if (!membership) {
      throw new ApiError(403, "You are not a member of this class.");
    }

    req.membership = { classId, role: membership.role };
    next();
  };
}

/** Must be used AFTER requireClassMembership. Restricts to admins/class reps. */
export function requireClassAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.membership || req.membership.role !== "admin") {
    throw new ApiError(403, "Only class representatives can perform this action.");
  }
  next();
}
