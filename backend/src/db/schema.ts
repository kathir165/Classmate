import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  time,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["student", "admin"]);
export const priorityEnum = pgEnum("priority", ["low", "normal", "high"]);
export const homeworkStatusEnum = pgEnum("homework_status", [
  "pending",
  "completed",
]);

// ---------- USERS ----------
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  avatarColor: varchar("avatar_color", { length: 20 }).default("#6C5CE7"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
}));

// ---------- CLASSES ----------
export const classes = pgTable("classes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  code: varchar("code", { length: 12 }).notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex("classes_code_idx").on(table.code),
}));

// ---------- CLASS MEMBERS ----------
export const classMembers = pgTable("class_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: roleEnum("role").default("student").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  uniqueMembership: uniqueIndex("class_members_unique_idx").on(table.classId, table.userId),
  classIdx: index("class_members_class_idx").on(table.classId),
  userIdx: index("class_members_user_idx").on(table.userId),
}));

// ---------- SUBJECTS ----------
export const subjects = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 150 }).notNull(),
  teacher: varchar("teacher", { length: 150 }),
  room: varchar("room", { length: 60 }),
  notes: text("notes"),
  colorTag: varchar("color_tag", { length: 20 }).default("#6C5CE7"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  classIdx: index("subjects_class_idx").on(table.classId),
}));

// ---------- TIMETABLE ----------
// dayOfWeek: 0 = Sunday ... 6 = Saturday
export const timetableEntries = pgTable("timetable_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  room: varchar("room", { length: 60 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  classIdx: index("timetable_class_idx").on(table.classId),
  dayIdx: index("timetable_day_idx").on(table.classId, table.dayOfWeek),
}));

// ---------- HOMEWORK ----------
export const homework = pgTable("homework", {
  id: uuid("id").defaultRandom().primaryKey(),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  status: homeworkStatusEnum("status").default("pending").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  classIdx: index("homework_class_idx").on(table.classId),
  dueDateIdx: index("homework_due_date_idx").on(table.classId, table.dueDate),
}));

// ---------- ANNOUNCEMENTS ----------
export const announcements = pgTable("announcements", {
  id: uuid("id").defaultRandom().primaryKey(),
  classId: uuid("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  priority: priorityEnum("priority").default("normal").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  classIdx: index("announcements_class_idx").on(table.classId),
}));

// ---------- PUSH SUBSCRIPTIONS ----------
// One row per subscribed device/browser (a user can have several — phone,
// laptop, etc.). Endpoint is unique per device+browser install.
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  userAgent: varchar("user_agent", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  endpointIdx: uniqueIndex("push_subscriptions_endpoint_idx").on(table.endpoint),
  userIdx: index("push_subscriptions_user_idx").on(table.userId),
}));

// ---------- RELATIONS ----------
export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(classMembers),
  createdClasses: many(classes),
  pushSubscriptions: many(pushSubscriptions),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, { fields: [pushSubscriptions.userId], references: [users.id] }),
}));

export const classesRelations = relations(classes, ({ many, one }) => ({
  members: many(classMembers),
  subjects: many(subjects),
  timetableEntries: many(timetableEntries),
  homework: many(homework),
  announcements: many(announcements),
  creator: one(users, { fields: [classes.createdBy], references: [users.id] }),
}));

export const classMembersRelations = relations(classMembers, ({ one }) => ({
  class: one(classes, { fields: [classMembers.classId], references: [classes.id] }),
  user: one(users, { fields: [classMembers.userId], references: [users.id] }),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  class: one(classes, { fields: [subjects.classId], references: [classes.id] }),
  timetableEntries: many(timetableEntries),
  homework: many(homework),
}));

export const timetableRelations = relations(timetableEntries, ({ one }) => ({
  class: one(classes, { fields: [timetableEntries.classId], references: [classes.id] }),
  subject: one(subjects, { fields: [timetableEntries.subjectId], references: [subjects.id] }),
}));

export const homeworkRelations = relations(homework, ({ one }) => ({
  class: one(classes, { fields: [homework.classId], references: [classes.id] }),
  subject: one(subjects, { fields: [homework.subjectId], references: [subjects.id] }),
  creator: one(users, { fields: [homework.createdBy], references: [users.id] }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  class: one(classes, { fields: [announcements.classId], references: [classes.id] }),
  creator: one(users, { fields: [announcements.createdBy], references: [users.id] }),
}));
