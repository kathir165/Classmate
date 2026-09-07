import { Router } from "express";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { announcements } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { requireClassMembership, requireClassAdmin } from "../middleware/classAccess.js";
import { asyncHandler, ApiError } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/:classId/announcements",
  requireClassMembership(),
  asyncHandler(async (req, res) => {
    const rows = await db
      .select()
      .from(announcements)
      .where(eq(announcements.classId, req.params.classId))
      .orderBy(desc(announcements.createdAt));
    res.json({ announcements: rows });
  })
);

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(3000),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});

router.post(
  "/:classId/announcements",
  requireClassMembership(),
  requireClassAdmin,
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const [item] = await db
      .insert(announcements)
      .values({ classId: req.params.classId, createdBy: req.userId!, ...data })
      .returning();
    res.status(201).json({ announcement: item });
  })
);

router.delete(
  "/:classId/announcements/:announcementId",
  requireClassMembership(),
  requireClassAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await db
      .delete(announcements)
      .where(and(eq(announcements.id, req.params.announcementId), eq(announcements.classId, req.params.classId)))
      .returning();
    if (deleted.length === 0) throw new ApiError(404, "Announcement not found.");
    res.json({ message: "Announcement deleted." });
  })
);

export default router;
