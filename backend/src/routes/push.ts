import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { pushSubscriptions } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getVapidPublicKey, pushConfigured } from "../utils/push.js";

const router = Router();

router.get(
  "/vapid-public-key",
  asyncHandler(async (_req, res) => {
    res.json({ publicKey: getVapidPublicKey(), configured: pushConfigured });
  })
);

router.use(requireAuth);

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  userAgent: z.string().max(255).optional(),
});

// Upsert by endpoint: re-subscribing the same device (e.g. after logging
// out and back in on the same phone) just refreshes the row.
router.post(
  "/subscribe",
  asyncHandler(async (req, res) => {
    const { endpoint, keys, userAgent } = subscribeSchema.parse(req.body);

    const [existing] = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);

    if (existing) {
      await db
        .update(pushSubscriptions)
        .set({ userId: req.userId!, p256dh: keys.p256dh, auth: keys.auth, userAgent })
        .where(eq(pushSubscriptions.endpoint, endpoint));
    } else {
      await db.insert(pushSubscriptions).values({
        userId: req.userId!,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
      });
    }

    res.status(201).json({ message: "Subscribed to push notifications." });
  })
);

const unsubscribeSchema = z.object({ endpoint: z.string().url() });

router.post(
  "/unsubscribe",
  asyncHandler(async (req, res) => {
    const { endpoint } = unsubscribeSchema.parse(req.body);
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
    res.json({ message: "Unsubscribed." });
  })
);

export default router;
