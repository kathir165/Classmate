import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;
const EXPIRY = process.env.JWT_EXPIRY || "7d";

if (!SECRET) {
  throw new Error("JWT_SECRET is not set. Copy .env.example to .env and configure it.");
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRY });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, SECRET) as TokenPayload;
}
