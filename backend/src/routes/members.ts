import { Router } from "express";
import { z } from "zod";
import { eq, and, ne } from "drizzle-orm";
import { db } from "../db/index.js";
import { classMembers, users } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { requireClassMembership, requireClassAdmin } from "../middleware/classAccess.js";
import { asyncHandler, ApiError } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/:classId/members",
  requireClassMembership(),
  asyncHandler(async (req, res) => {
    const rows = await db
      .select({
        id: classMembers.id,
        userId: users.id,
        name: users.name,
        avatarColor: users.avatarColor,
        role: classMembers.role,
        joinedAt: classMembers.joinedAt,
      })
      .from(classMembers)
      .innerJoin(users, eq(classMembers.userId, users.id))
      .where(eq(classMembers.classId, req.params.classId));
    res.json({ members: rows });
  })
);

const roleSchema = z.object({ role: z.enum(["student", "admin"]) });

router.patch(
  "/:classId/members/:memberId/role",
  requireClassMembership(),
  requireClassAdmin,
  asyncHandler(async (req, res) => {
    const { role } = roleSchema.parse(req.body);
    const [updated] = await db
      .update(classMembers)
      .set({ role })
      .where(and(eq(classMembers.id, req.params.memberId), eq(classMembers.classId, req.params.classId)))
      .returning();
    if (!updated) throw new ApiError(404, "Member not found in this class.");
    res.json({ member: updated });
  })
);

router.delete(
  "/:classId/members/:memberId",
  requireClassMembership(),
  requireClassAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await db
      .delete(classMembers)
      .where(and(eq(classMembers.id, req.params.memberId), eq(classMembers.classId, req.params.classId)))
      .returning();
    if (deleted.length === 0) throw new ApiError(404, "Member not found in this class.");
    res.json({ message: "Member removed." });
  })
);

export default router;
