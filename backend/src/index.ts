import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import classRoutes from "./routes/classes.js";
import memberRoutes from "./routes/members.js";
import subjectRoutes from "./routes/subjects.js";
import timetableRoutes from "./routes/timetable.js";
import homeworkRoutes from "./routes/homework.js";
import announcementRoutes from "./routes/announcements.js";
import pushRoutes from "./routes/push.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { startClassReminderScheduler } from "./jobs/classReminders.js";

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",");
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/classes", classRoutes);
// Members, subjects, timetable, homework, announcements are all scoped
// under /api/classes/:classId/... since they always belong to a class.
app.use("/api/classes", memberRoutes);
app.use("/api/classes", subjectRoutes);
app.use("/api/classes", timetableRoutes);
app.use("/api/classes", homeworkRoutes);
app.use("/api/classes", announcementRoutes);
app.use("/api/push", pushRoutes);

app.use((_req, res) => res.status(404).json({ error: "Route not found." }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ClassMate API running on http://localhost:${PORT}`);
  startClassReminderScheduler();
});
