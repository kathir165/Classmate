import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler, ApiError } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { sendPasswordResetEmail } from "../utils/email.js";
const router = Router();

const signupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const AVATAR_COLORS = ["#6C5CE7", "#00B894", "#0984E3", "#E17055", "#D63031", "#00CEC9"];

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { name, email, password } = signupSchema.parse(req.body);

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      throw new ApiError(409, "An account with that email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash, avatarColor })
      .returning({ id: users.id, name: users.name, email: users.email, avatarColor: users.avatarColor });

    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({ token, user });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) throw new ApiError(401, "Invalid email or password.");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new ApiError(401, "Invalid email or password.");

    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, avatarColor: user.avatarColor },
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email, avatarColor: users.avatarColor, createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, req.userId!))
      .limit(1);
    if (!user) throw new ApiError(404, "User not found.");
    res.json({ user });
  })
);

// Simple reset flow: generates a reset token (in production this would be
// emailed; here it is returned so the flow is demonstrable end-to-end
// without an external email provider configured).
const resetRequestSchema = z.object({ email: z.string().trim().toLowerCase().email() });
const resetConfirmSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  resetCode: z.string().length(6),
  newPassword: z.string().min(8),
});

const resetCodes = new Map<string, { code: string; expires: number }>();

router.post(
  "/request-password-reset",
  asyncHandler(async (req, res) => {
    const { email } = resetRequestSchema.parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    // Always respond success to avoid leaking which emails are registered.
    if (user) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  resetCodes.set(email, {
    code,
    expires: Date.now() + 15 * 60 * 1000,
  });

  await sendPasswordResetEmail(email, code);

  console.log(`[password reset] Email sent to ${email}`);
}
    res.json({ message: "If that email exists, a reset code has been sent." });
  })
);

router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const { email, resetCode, newPassword } = resetConfirmSchema.parse(req.body);
    const entry = resetCodes.get(email);
    if (!entry || entry.code !== resetCode || entry.expires < Date.now()) {
      throw new ApiError(400, "Invalid or expired reset code.");
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.email, email));
    resetCodes.delete(email);
    res.json({ message: "Password updated. You can now log in." });
  })
);

export default router;
