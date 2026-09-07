import { Router } from "express";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { subjects } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { requireClassMembership, requireClassAdmin } from "../middleware/classAccess.js";
import { asyncHandler, ApiError } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/:classId/subjects",
  requireClassMembership(),
  asyncHandler(async (req, res) => {
    const rows = await db.select().from(subjects).where(eq(subjects.classId, req.params.classId));
    res.json({ subjects: rows });
  })
);

const createSchema = z.object({
  name: z.string().trim().min(1).max(150),
  teacher: z.string().trim().max(150).optional(),
  room: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(2000).optional(),
  colorTag: z.string().trim().max(20).optional(),
});

router.post(
  "/:classId/subjects",
  requireClassMembership(),
  requireClassAdmin,
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const [subject] = await db
      .insert(subjects)
      .values({ classId: req.params.classId, ...data })
      .returning();
    res.status(201).json({ subject });
  })
);

router.patch(
  "/:classId/subjects/:subjectId",
  requireClassMembership(),
  requireClassAdmin,
  asyncHandler(async (req, res) => {
    const data = createSchema.partial().parse(req.body);
    const [updated] = await db
      .update(subjects)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(subjects.id, req.params.subjectId), eq(subjects.classId, req.params.classId)))
      .returning();
    if (!updated) throw new ApiError(404, "Subject not found in this class.");
    res.json({ subject: updated });
  })
);

router.delete(
  "/:classId/subjects/:subjectId",
  requireClassMembership(),
  requireClassAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await db
      .delete(subjects)
      .where(and(eq(subjects.id, req.params.subjectId), eq(subjects.classId, req.params.classId)))
      .returning();
    if (deleted.length === 0) throw new ApiError(404, "Subject not found in this class.");
    res.json({ message: "Subject deleted." });
  })
);

export default router;
