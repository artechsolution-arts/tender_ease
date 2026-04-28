import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";


export type UserRole = "admin" | "vendor";

export interface DemoUser {
  email: string;
  name: string;
  role: UserRole;
  organization: string;
  vendorId?: string;
  isVerificationPending?: boolean;
  verificationStep?: 1 | 2 | 3 | 4 | 5;
}

interface DemoAccount extends DemoUser {
  password: string;
}

const initialDemoAccounts: DemoAccount[] = [
  {
    email: "admin@apeprocurement.gov.in",
    password: "admin123",
    name: "Sri. R. Venkatesh, IAS",
    role: "admin",
    organization: "Tender Inviting Authority · R&B Dept.",
  },
  {
    email: "vendor@coastalinfra.in",
    password: "vendor123",
    name: "S. Reddy",
    role: "vendor",
    organization: "Coastal Infra Engineers",
    vendorId: "VND-1004",
  },
  {
    email: "ramya@gmail.com",
    password: "password",
    name: "Ramya",
    role: "vendor",
    organization: "AR",
    vendorId: "VEN-2026-1045",
    isVerificationPending: true,
    verificationStep: 2,
  },
];

interface AuthCtx {
  currentUser: DemoUser | null;
  demoAccounts: Pick<DemoAccount, "email" | "password" | "role" | "organization">[];
  login: (email: string, password: string) => DemoUser | null;
  logout: () => void;
  registerVendor: (account: Omit<DemoAccount, "role" | "vendorId">) => void;
  updateVerificationStep: (step: number) => void;
  submitVerification: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<DemoAccount[]>(() => {
    try {
      const saved = localStorage.getItem("demoAccounts");
      return saved ? JSON.parse(saved) : initialDemoAccounts;
    } catch {
      return initialDemoAccounts;
    }
  });
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem("demoAccounts", JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  const login = useCallback((email: string, password: string) => {
    const account = accounts.find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
    );
    if (!account) return null;
    const { password: _password, ...user } = account;
    setCurrentUser(user);
    return user;
  }, [accounts]);

  const logout = useCallback(() => setCurrentUser(null), []);

  const registerVendor = useCallback((account: Omit<DemoAccount, "role" | "vendorId">) => {
    const newVendor: DemoAccount = {
      ...account,
      role: "vendor",
      vendorId: `VEN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      isVerificationPending: true,
      verificationStep: 2,
    };
    setAccounts((prev) => [...prev, newVendor]);
  }, []);

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const updateVerificationStep = (step: number) => {
    if (!currentUser) return;
    const updated = { ...currentUser, verificationStep: step as 1 | 2 | 3 | 4 | 5 };
    setCurrentUser(updated);
    setAccounts(prev => prev.map(a => a.email === currentUser.email ? { ...a, verificationStep: step as 1 | 2 | 3 | 4 | 5 } : a));
    localStorage.setItem("currentUser", JSON.stringify(updated));
  };

  const submitVerification = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, isVerificationPending: true, verificationStep: 4 as 1 | 2 | 3 | 4 | 5 };
    setCurrentUser(updated);
    setAccounts(prev => prev.map(a => a.email === currentUser.email ? { ...a, isVerificationPending: true, verificationStep: 4 as 1 | 2 | 3 | 4 | 5 } : a));
    localStorage.setItem("currentUser", JSON.stringify(updated));
  };

  const publicAccounts = useMemo(
    () => accounts.map(({ email, password, role, organization }) => ({ email, password, role, organization })),
    [accounts],
  );

  return <Ctx.Provider value={{ currentUser, demoAccounts: publicAccounts, login, logout, registerVendor, updateVerificationStep, submitVerification }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}