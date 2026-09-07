import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, RequireClass } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Timetable from "./pages/Timetable";
import Subjects from "./pages/Subjects";
import Homework from "./pages/Homework";
import Announcements from "./pages/Announcements";
import Members from "./pages/Members";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />

        <Route element={<AppShell />}>
          <Route
            path="/dashboard"
            element={
              <RequireClass>
                <Dashboard />
              </RequireClass>
            }
          />
          <Route
            path="/timetable"
            element={
              <RequireClass>
                <Timetable />
              </RequireClass>
            }
          />
          <Route
            path="/subjects"
            element={
              <RequireClass>
                <Subjects />
              </RequireClass>
            }
          />
          <Route
            path="/homework"
            element={
              <RequireClass>
                <Homework />
              </RequireClass>
            }
          />
          <Route
            path="/announcements"
            element={
              <RequireClass>
                <Announcements />
              </RequireClass>
            }
          />
          <Route
            path="/members"
            element={
              <RequireClass>
                <Members />
              </RequireClass>
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
