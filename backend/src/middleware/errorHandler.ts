import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/asyncHandler.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed.",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Postgres unique-constraint violation
  if (typeof err === "object" && err !== null && (err as any).code === "23505") {
    return res.status(409).json({ error: "That record already exists." });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Something went wrong. Please try again." });
}
