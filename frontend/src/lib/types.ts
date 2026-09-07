export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt?: string;
}

export interface ClassSummary {
  id: string;
  name: string;
  description: string | null;
  code: string;
  role: "student" | "admin";
  joinedAt: string;
}

export interface Subject {
  id: string;
  classId: string;
  name: string;
  teacher: string | null;
  room: string | null;
  notes: string | null;
  colorTag: string;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  subjectId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  notes: string | null;
}

export interface HomeworkItem {
  id: string;
  classId: string;
  subjectId: string | null;
  title: string;
  description: string | null;
  dueDate: string;
  status: "pending" | "completed";
  createdBy: string;
}

export interface Announcement {
  id: string;
  classId: string;
  title: string;
  message: string;
  priority: "low" | "normal" | "high";
  createdBy: string;
  createdAt: string;
}

export interface Member {
  id: string;
  userId: string;
  name: string;
  avatarColor: string;
  role: "student" | "admin";
  joinedAt: string;
}

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
