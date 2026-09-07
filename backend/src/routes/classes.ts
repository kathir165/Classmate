import { Router } from "express";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { classes, classMembers } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { requireClassMembership, requireClassAdmin } from "../middleware/classAccess.js";
import { asyncHandler, ApiError } from "../utils/asyncHandler.js";
import { generateClassCode } from "../utils/classCode.js";

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional(),
});

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, description } = createSchema.parse(req.body);

    // Retry on the rare chance of a code collision.
    let code = generateClassCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const [existing] = await db.select().from(classes).where(eq(classes.code, code)).limit(1);
      if (!existing) break;
      code = generateClassCode();
    }

    const [newClass] = await db
      .insert(classes)
      .values({ name, description, code, createdBy: req.userId! })
      .returning();

    // Creator automatically becomes the class representative / admin.
    await db.insert(classMembers).values({
      classId: newClass.id,
      userId: req.userId!,
      role: "admin",
    });

    res.status(201).json({ class: newClass });
  })
);

const joinSchema = z.object({ code: z.string().trim().toUpperCase().min(4).max(12) });

router.post(
  "/join",
  asyncHandler(async (req, res) => {
    const { code } = joinSchema.parse(req.body);

    const [targetClass] = await db.select().from(classes).where(eq(classes.code, code)).limit(1);
    if (!targetClass) throw new ApiError(404, "Invalid class code.");

    const [existingMembership] = await db
      .select()
      .from(classMembers)
      .where(and(eq(classMembers.classId, targetClass.id), eq(classMembers.userId, req.userId!)))
      .limit(1);
    if (existingMembership) throw new ApiError(409, "You're already a member of this class.");

    await db.insert(classMembers).values({
      classId: targetClass.id,
      userId: req.userId!,
      role: "student",
    });

    res.status(201).json({ class: targetClass });
  })
);

router.get(
  "/:classId",
  requireClassMembership(),
  asyncHandler(async (req, res) => {
    const [classData] = await db.select().from(classes).where(eq(classes.id, req.params.classId)).limit(1);
    if (!classData) throw new ApiError(404, "Class not found.");
    res.json({ class: classData, role: req.membership!.role });
  })
);

const updateSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(2000).optional(),
});

router.patch(
  "/:classId",
  requireClassMembership(),
  requireClassAdmin,
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const [updated] = await db
      .update(classes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(classes.id, req.params.classId))
      .returning();
    res.json({ class: updated });
  })
);

export default router;
