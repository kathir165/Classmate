import { Router } from "express";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { timetableEntries } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { requireClassMembership, requireClassAdmin } from "../middleware/classAccess.js";
import { asyncHandler, ApiError } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/:classId/timetable",
  requireClassMembership(),
  asyncHandler(async (req, res) => {
    const rows = await db
      .select()
      .from(timetableEntries)
      .where(eq(timetableEntries.classId, req.params.classId));
    res.json({ timetable: rows });
  })
);

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const createSchema = z.object({
  subjectId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, "Use HH:MM format."),
  endTime: z.string().regex(timeRegex, "Use HH:MM format."),
  room: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(1000).optional(),
});

router.post(
  "/:classId/timetable",
  requireClassMembership(),
  requireClassAdmin,
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    if (data.startTime >= data.endTime) {
      throw new ApiError(400, "Start time must be before end time.");
    }
    const [entry] = await db
      .insert(timetableEntries)
      .values({ classId: req.params.classId, ...data })
      .returning();
    res.status(201).json({ entry });
  })
);

router.patch(
  "/:classId/timetable/:entryId",
  requireClassMembership(),
  requireClassAdmin,
  asyncHandler(async (req, res) => {
    const data = createSchema.partial().parse(req.body);
    const [updated] = await db
      .update(timetableEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(timetableEntries.id, req.params.entryId), eq(timetableEntries.classId, req.params.classId)))
      .returning();
    if (!updated) throw new ApiError(404, "Timetable entry not found.");
    res.json({ entry: updated });
  })
);

router.delete(
  "/:classId/timetable/:entryId",
  requireClassMembership(),
  requireClassAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await db
      .delete(timetableEntries)
      .where(and(eq(timetableEntries.id, req.params.entryId), eq(timetableEntries.classId, req.params.classId)))
      .returning();
    if (deleted.length === 0) throw new ApiError(404, "Timetable entry not found.");
    res.json({ message: "Timetable entry deleted." });
  })
);

export default router;
