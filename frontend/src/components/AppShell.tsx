import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarClock,
  BookOpen,
  ClipboardList,
  Megaphone,
  Users,
  UserRound,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useClasses } from "../context/ClassContext";
import { Avatar } from "./Avatar";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/timetable", label: "Timetable", icon: CalendarClock },
  { to: "/homework", label: "Homework", icon: ClipboardList },
  { to: "/subjects", label: "Subjects", icon: BookOpen },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/members", label: "Members", icon: Users },
];

const MOBILE_NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/timetable", label: "Timetable", icon: CalendarClock },
  { to: "/homework", label: "Homework", icon: ClipboardList },
  { to: "/subjects", label: "Subjects", icon: BookOpen },
];

const MOBILE_MENU_ITEMS = [
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/members", label: "Members", icon: Users },
  { to: "/profile", label: "Profile", icon: UserRound },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const { classes, activeClass, setActiveClassId } = useClasses();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleMobileLogout() {
    setMobileMenuOpen(false);
    logout();
  }

  return (
    <div className="min-h-screen bg-base flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-base-border bg-base-panel/60 shrink-0">
        <div className="h-16 flex items-center px-5 border-b border-base-border">
          <span className="font-display font-bold text-lg tracking-tight text-ink">
            Class<span className="text-accent">Mate</span>
          </span>
        </div>

        <div className="p-3 border-b border-base-border relative">
          <button
            onClick={() => setSwitcherOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-base-raised border border-base-border hover:border-accent/40 transition-colors"
          >
            <div className="min-w-0 text-left">
              <p className="text-xs text-ink-faint leading-none mb-1">Class</p>
              <p className="text-sm font-medium text-ink truncate">{activeClass?.name || "No class"}</p>
            </div>
            <ChevronDown size={16} className="text-ink-faint shrink-0" />
          </button>
          {switcherOpen && classes.length > 0 && (
            <div className="absolute left-3 right-3 mt-1 card p-1 z-20 max-h-64 overflow-auto">
              {classes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveClassId(c.id);
                    setSwitcherOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-base-border/60 transition-colors ${
                    c.id === activeClass?.id ? "text-accent" : "text-ink"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-ink-muted hover:text-ink hover:bg-base-raised"
                }`
              }
            >
              <item.icon size={18} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-base-border space-y-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-accent/10 text-accent" : "text-ink-muted hover:text-ink hover:bg-base-raised"
              }`
            }
          >
            <Avatar name={user?.name || ""} color={user?.avatarColor} size={20} />
            <span className="truncate">{user?.name}</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-accent/10 text-accent" : "text-ink-muted hover:text-ink hover:bg-base-raised"
              }`
            }
          >
            <Settings size={18} />
            Settings
          </NavLink>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-muted hover:text-bad hover:bg-bad/10 transition-colors"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden h-14 flex items-center justify-between px-4 border-b border-base-border bg-base-panel/60 sticky top-0 z-30">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg text-ink-muted hover:text-ink hover:bg-base-raised transition-colors"
            aria-label="Open menu"
            title="Menu"
          >
            <Menu size={22} />
          </button>

          <span className="font-display font-bold text-base text-ink">
            Class<span className="text-accent">Mate</span>
          </span>

          {classes.length > 1 ? (
            <select
              value={activeClass?.id}
              onChange={(e) => setActiveClassId(e.target.value)}
              className="bg-base-raised border border-base-border text-xs text-ink rounded-md px-2 py-1.5 max-w-[32%]"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <Avatar name={user?.name || ""} color={user?.avatarColor} size={28} />
          )}
        </header>

        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>

        {/* Mobile navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-base-panel border-t border-base-border flex items-center justify-around z-30">
          {MOBILE_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[11px] font-medium transition-colors ${
                  isActive ? "text-accent" : "text-ink-faint"
                }`
              }
            >
              <item.icon size={20} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <button
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            />

            <aside className="absolute left-0 top-0 bottom-0 w-[min(84vw,320px)] bg-base-panel border-r border-base-border shadow-2xl flex flex-col">
              <div className="h-16 flex items-center justify-between px-5 border-b border-base-border shrink-0">
                <span className="font-display font-bold text-lg tracking-tight text-ink">
                  Class<span className="text-accent">Mate</span>
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-base-raised transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 border-b border-base-border">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={user?.name || ""} color={user?.avatarColor} size={40} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
                    <p className="text-xs text-ink-faint truncate">{activeClass?.name || "No class"}</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "text-ink-muted hover:text-ink hover:bg-base-raised"
                      }`
                    }
                  >
                    <item.icon size={19} strokeWidth={2} />
                    {item.label}
                  </NavLink>
                ))}

                <div className="my-3 border-t border-base-border" />

                {MOBILE_MENU_ITEMS.filter((item) => !NAV_ITEMS.some((nav) => nav.to === item.to)).map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "text-ink-muted hover:text-ink hover:bg-base-raised"
                      }`
                    }
                  >
                    <item.icon size={19} strokeWidth={2} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="p-3 border-t border-base-border shrink-0">
                <button
                  onClick={handleMobileLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-ink-muted hover:text-bad hover:bg-bad/10 transition-colors"
                >
                  <LogOut size={19} />
                  Log out
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
