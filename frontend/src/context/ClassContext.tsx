import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../lib/api";
import type { ClassSummary } from "../lib/types";

interface ClassContextValue {
  classes: ClassSummary[];
  activeClass: ClassSummary | null;
  setActiveClassId: (id: string) => void;
  loading: boolean;
  refreshClasses: () => Promise<void>;
}

const ClassContext = createContext<ClassContextValue | undefined>(undefined);

export function ClassProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [activeClassId, setActiveClassIdState] = useState<string | null>(
    localStorage.getItem("classmate_active_class")
  );
  const [loading, setLoading] = useState(true);

  async function refreshClasses() {
    if (!user) {
      setClasses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { classes } = await api.get<{ classes: ClassSummary[] }>("/users/me/classes");
      setClasses(classes);
      if (!activeClassId && classes.length > 0) {
        setActiveClassId(classes[0].id);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function setActiveClassId(id: string) {
    setActiveClassIdState(id);
    localStorage.setItem("classmate_active_class", id);
  }

  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0] || null;

  return (
    <ClassContext.Provider value={{ classes, activeClass, setActiveClassId, loading, refreshClasses }}>
      {children}
    </ClassContext.Provider>
  );
}

export function useClasses() {
  const ctx = useContext(ClassContext);
  if (!ctx) throw new Error("useClasses must be used within ClassProvider");
  return ctx;
}
