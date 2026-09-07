import { Router } from "express";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { homework } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { requireClassMembership } from "../middleware/classAccess.js";
import { asyncHandler, ApiError } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/:classId/homework",
  requireClassMembership(),
  asyncHandler(async (req, res) => {
    const rows = await db.select().from(homework).where(eq(homework.classId, req.params.classId));
    res.json({ homework: rows });
  })
);

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(3000).optional(),
  dueDate: z.coerce.date(),
  subjectId: z.string().uuid().optional(),
});

// Any class member can add homework — not just admins — since coursework
// tracking is a shared student responsibility, not an administrative one.
router.post(
  "/:classId/homework",
  requireClassMembership(),
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const [item] = await db
      .insert(homework)
      .values({ classId: req.params.classId, createdBy: req.userId!, ...data })
      .returning();
    res.status(201).json({ homework: item });
  })
);

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(3000).optional(),
  dueDate: z.coerce.date().optional(),
  subjectId: z.string().uuid().nullable().optional(),
  status: z.enum(["pending", "completed"]).optional(),
});

router.patch(
  "/:classId/homework/:homeworkId",
  requireClassMembership(),
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const [updated] = await db
      .update(homework)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(homework.id, req.params.homeworkId), eq(homework.classId, req.params.classId)))
      .returning();
    if (!updated) throw new ApiError(404, "Homework item not found.");
    res.json({ homework: updated });
  })
);

router.delete(
  "/:classId/homework/:homeworkId",
  requireClassMembership(),
  asyncHandler(async (req, res) => {
    const deleted = await db
      .delete(homework)
      .where(and(eq(homework.id, req.params.homeworkId), eq(homework.classId, req.params.classId)))
      .returning();
    if (deleted.length === 0) throw new ApiError(404, "Homework item not found.");
    res.json({ message: "Homework deleted." });
  })
);

export default router;
