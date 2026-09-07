import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, classMembers, classes } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth);

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  avatarColor: z.string().trim().max(20).optional(),
});

router.patch(
  "/me",
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, req.userId!))
      .returning({ id: users.id, name: users.name, email: users.email, avatarColor: users.avatarColor });
    res.json({ user });
  })
);

// All classes the current user belongs to, with their role in each.
router.get(
  "/me/classes",
  asyncHandler(async (req, res) => {
    const rows = await db
      .select({
        id: classes.id,
        name: classes.name,
        description: classes.description,
        code: classes.code,
        role: classMembers.role,
        joinedAt: classMembers.joinedAt,
      })
      .from(classMembers)
      .innerJoin(classes, eq(classMembers.classId, classes.id))
      .where(eq(classMembers.userId, req.userId!));
    res.json({ classes: rows });
  })
);

export default router;
