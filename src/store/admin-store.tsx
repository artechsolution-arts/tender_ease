import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";

export type TenderStatus = "Draft" | "Published" | "Closed" | "Evaluated" | "Awarded";
export const TENDER_STATUSES: TenderStatus[] = ["Draft", "Published", "Closed", "Evaluated", "Awarded"];

const STATUS_FLOW: Record<TenderStatus, TenderStatus[]> = {
  Draft: ["Published"],
  Published: ["Closed"],
  Closed: ["Evaluated"],
  Evaluated: ["Awarded"],
  Awarded: [],
};

export function nextStatuses(s: TenderStatus) {
  return STATUS_FLOW[s];
}

export interface TenderDoc { id: string; name: string; size: string; }

export interface TenderVersion {
  version: number;
  editedAt: string;
  editedBy: string;
  changes: string;
  snapshot: Omit<Tender, "history">;
}

export interface Tender {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  estimatedValue: number;
  category: string;
  department: string;
  documents: TenderDoc[];
  eligibleVendorIds: string[];
  status: TenderStatus;
  awardedVendorId?: string;
  createdAt: string;
  history: TenderVersion[];
}

export interface Vendor {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  gst: string;
  pan: string;
  registeredOn: string;
  pastPerformance: number;
  completedTenders: number;
  blacklisted: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "tender_created" | "tender_updated" | "bid_submitted" | "tender_awarded" | "info";
  audience: string;
  targetRole?: "admin" | "vendor" | "all";
  targetVendorIds?: string[];
  channels: ("in_app" | "email")[];
  createdAt: string;
  read: boolean;
  relatedTenderId?: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  status: "queued" | "sent";
}

export interface PendingVendor {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  submittedOn: string;
  status: string;
}

const seedVendors: Vendor[] = [
  { id: "VND-1001", companyName: "Sri Krishna Constructions Pvt Ltd", contactPerson: "K. Ramesh", email: "ramesh@srikrishna.in", phone: "+91 98480 12345", category: "Civil Works", gst: "37AABCS1234N1Z5", pan: "AABCS1234N", registeredOn: "2021-06-14", pastPerformance: 92, completedTenders: 41, blacklisted: false },
  { id: "VND-1002", companyName: "Andhra IT Solutions", contactPerson: "P. Lakshmi", email: "lakshmi@andhrait.com", phone: "+91 90000 22341", category: "IT / e-Gov", gst: "37AAACA9988P1ZK", pan: "AAACA9988P", registeredOn: "2020-02-09", pastPerformance: 87, completedTenders: 28, blacklisted: false },
  { id: "VND-1003", companyName: "Godavari Supplies & Logistics", contactPerson: "M. Naidu", email: "naidu@godavarisl.in", phone: "+91 99887 33421", category: "Goods / Supplies", gst: "37AABCG7766R1Z3", pan: "AABCG7766R", registeredOn: "2019-11-30", pastPerformance: 78, completedTenders: 53, blacklisted: false },
  { id: "VND-1004", companyName: "Coastal Infra Engineers", contactPerson: "S. Reddy", email: "reddy@coastalinfra.in", phone: "+91 94404 55661", category: "Civil Works", gst: "37AAECC2233K1Z9", pan: "AAECC2233K", registeredOn: "2018-04-21", pastPerformance: 84, completedTenders: 36, blacklisted: false },
  { id: "VND-1005", companyName: "Vijaya Consultancy Services", contactPerson: "R. Sita", email: "sita@vijayacs.in", phone: "+91 93939 11220", category: "Consultancy", gst: "37AADCV4455M1ZT", pan: "AADCV4455M", registeredOn: "2022-08-01", pastPerformance: 90, completedTenders: 14, blacklisted: false },
  { id: "VND-1006", companyName: "Krishna Valley Traders", contactPerson: "B. Anil", email: "anil@krishnavalley.in", phone: "+91 90909 87654", category: "Goods / Supplies", gst: "37AAACK9911L1Z2", pan: "AAACK9911L", registeredOn: "2017-09-12", pastPerformance: 62, completedTenders: 22, blacklisted: true },
  { id: "VND-1007", companyName: "Tirumala Engineering Works", contactPerson: "V. Suresh", email: "suresh@tirumalaengg.in", phone: "+91 99491 66554", category: "Civil Works", gst: "37AAFCT3322Q1Z7", pan: "AAFCT3322Q", registeredOn: "2016-03-19", pastPerformance: 81, completedTenders: 47, blacklisted: false },
  { id: "VND-1008", companyName: "Nellore HealthMed Pvt Ltd", contactPerson: "Dr. P. Anitha", email: "anitha@nellorehm.in", phone: "+91 95050 44778", category: "Healthcare", gst: "37AABCN1199W1ZF", pan: "AABCN1199W", registeredOn: "2020-12-05", pastPerformance: 88, completedTenders: 19, blacklisted: false },
];

const seedPending: PendingVendor[] = [
  { id: "VEN-2026-1045", company: "New Vendor Ltd", contact: "New Vendor Contact", email: "newvendor@example.com", phone: "9876543210", submittedOn: "2026-04-27", status: "Pending Review" }
];

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d); };

const seedTenders: Tender[] = [
  { id: "TND-2025-041", name: "Construction of 4-Lane Bypass Road – Vijayawada Phase II", description: "Earthwork, bituminous concrete, drainage and street lighting for 7.4 km stretch.", startDate: addDays(-5), endDate: addDays(15), estimatedValue: 245000000, category: "Civil Works", department: "Roads & Buildings", documents: [{ id: "d1", name: "NIT_Notice.pdf", size: "320 KB" }, { id: "d2", name: "BoQ.xlsx", size: "112 KB" }, { id: "d3", name: "Tech_Specs.pdf", size: "1.4 MB" }], eligibleVendorIds: ["VND-1001", "VND-1004", "VND-1007"], status: "Published", createdAt: addDays(-5), history: [] },
  { id: "TND-2025-042", name: "Supply & Installation of Smart Classroom Equipment", description: "Interactive panels, audio systems and content servers for 220 government schools.", startDate: addDays(-2), endDate: addDays(20), estimatedValue: 118000000, category: "IT / e-Gov", department: "School Education", documents: [{ id: "d1", name: "NIT_Notice.pdf", size: "280 KB" }, { id: "d2", name: "Eligibility.pdf", size: "96 KB" }], eligibleVendorIds: ["VND-1002", "VND-1005"], status: "Published", createdAt: addDays(-2), history: [] },
  { id: "TND-2025-043", name: "Procurement of Generic Medicines – Q2 2026", description: "Annual rate contract for 86 generic formulations across district hospitals.", startDate: addDays(-10), endDate: addDays(-2), estimatedValue: 41000000, category: "Healthcare", department: "Health & Family Welfare", documents: [{ id: "d1", name: "NIT_Notice.pdf", size: "210 KB" }], eligibleVendorIds: ["VND-1003", "VND-1008"], status: "Closed", createdAt: addDays(-10), history: [] },
  { id: "TND-2025-044", name: "AP Secretariat HVAC Modernization", description: "Replacement of central AHU and BMS upgrade for Block 3 & 4.", startDate: addDays(-20), endDate: addDays(-7), estimatedValue: 87000000, category: "Civil Works", department: "R&B Dept.", documents: [{ id: "d1", name: "NIT.pdf", size: "180 KB" }], eligibleVendorIds: ["VND-1001", "VND-1004", "VND-1007"], status: "Awarded", awardedVendorId: "VND-1004", createdAt: addDays(-20), history: [] },
  { id: "TND-2025-045", name: "GIS Mapping for Urban Local Bodies", description: "Drone-based survey, GIS basemap creation and asset tagging across 12 ULBs.", startDate: addDays(2), endDate: addDays(35), estimatedValue: 24000000, category: "Consultancy", department: "MA & UD", documents: [{ id: "d1", name: "Draft_NIT.pdf", size: "220 KB" }], eligibleVendorIds: ["VND-1005"], status: "Draft", createdAt: addDays(-1), history: [] },
];

interface AdminCtx {
  vendors: Vendor[];
  pendingVendors: PendingVendor[];
  tenders: Tender[];
  notifications: AppNotification[];
  emails: EmailLog[];
  unreadCount: number;
  createTender: (t: Omit<Tender, "id" | "createdAt" | "history" | "status">) => Tender;
  updateTender: (id: string, patch: Partial<Tender>, changes: string) => void;
  changeStatus: (id: string, next: TenderStatus, awardedVendorId?: string) => void;
  deleteTender: (id: string) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  approveVendor: (id: string) => void;
  rejectVendor: (id: string) => void;
  addPendingVendor: (v: Omit<PendingVendor, "status" | "submittedOn">) => void;
}

const Ctx = createContext<AdminCtx | null>(null);
const fmtTime = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const saved = localStorage.getItem("admin_vendors");
      return saved ? JSON.parse(saved) : seedVendors;
    } catch { return seedVendors; }
  });
  
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>(() => {
    try {
      const saved = localStorage.getItem("admin_pending");
      return saved ? JSON.parse(saved) : seedPending;
    } catch { return seedPending; }
  });

  const [tenders, setTenders] = useState<Tender[]>(() => {
    try {
      const saved = localStorage.getItem("admin_tenders");
      return saved ? JSON.parse(saved) : seedTenders;
    } catch { return seedTenders; }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem("admin_notifications");
      return saved ? JSON.parse(saved) : [
        { id: uid("ntf"), title: "Welcome, Officer", body: "Tender Management System ready. Pending: 2 evaluations.", type: "info", audience: "Admin", targetRole: "admin", channels: ["in_app"], createdAt: fmtTime(), read: false },
        { id: uid("ntf"), title: "Vendor console ready", body: "Your eligible tenders, document status and award updates will appear here.", type: "info", audience: "Coastal Infra Engineers", targetRole: "vendor", targetVendorIds: ["VND-1004"], channels: ["in_app"], createdAt: fmtTime(), read: false },
      ];
    } catch { return []; }
  });

  const [emails, setEmails] = useState<EmailLog[]>([]);

  useEffect(() => {
    localStorage.setItem("admin_vendors", JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem("admin_pending", JSON.stringify(pendingVendors));
  }, [pendingVendors]);

  useEffect(() => {
    localStorage.setItem("admin_tenders", JSON.stringify(tenders));
  }, [tenders]);

  useEffect(() => {
    localStorage.setItem("admin_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const pushNotification = useCallback((n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
    setNotifications((prev) => [{ ...n, id: uid("ntf"), createdAt: fmtTime(), read: false }, ...prev]);
  }, []);

  const queueEmails = useCallback((to: string[], subject: string, body: string) => {
    setEmails((prev) => [
      ...to.map((addr) => ({ id: uid("eml"), to: addr, subject, body, sentAt: fmtTime(), status: "sent" as const })),
      ...prev,
    ]);
  }, []);

  const vendorEmails = useCallback((ids: string[]) =>
    vendors.filter((v) => ids.includes(v.id) && !v.blacklisted).map((v) => v.email),
  [vendors]);

  const createTender: AdminCtx["createTender"] = useCallback((t) => {
    const id = `TND-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 899))}`;
    const tender: Tender = { ...t, id, status: "Draft", createdAt: fmtTime(), history: [] };
    setTenders((p) => [tender, ...p]);
    pushNotification({
      title: `New tender drafted: ${t.name}`,
      body: `${t.eligibleVendorIds.length} vendor(s) marked eligible. Currently in Draft.`,
      type: "tender_created", audience: "Admin", targetRole: "admin", channels: ["in_app"], relatedTenderId: id,
    });
    return tender;
  }, [pushNotification]);

  const updateTender: AdminCtx["updateTender"] = useCallback((id, patch, changes) => {
    setTenders((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const snapshot = { ...t } as Partial<Tender>;
      delete snapshot.history;
      const version: TenderVersion = {
        version: t.history.length + 1,
        editedAt: fmtTime(),
        editedBy: "Sri. R. Venkatesh, IAS",
        changes,
        snapshot: snapshot as Omit<Tender, "history">,
      };
      const updated: Tender = { ...t, ...patch, history: [version, ...t.history] };
      const targets = vendorEmails(updated.eligibleVendorIds);
      pushNotification({
        title: `Tender updated: ${updated.name}`,
        body: `${changes}. ${targets.length} eligible vendor(s) notified.`,
        type: "tender_updated", audience: `${targets.length} vendors`, targetRole: "vendor", targetVendorIds: updated.eligibleVendorIds,
        channels: ["in_app", "email"], relatedTenderId: id,
      });
      queueEmails(targets, `[AP e-Procurement] Update on ${id}`, `The tender "${updated.name}" has been updated. Change: ${changes}.`);
      return updated;
    }));
  }, [pushNotification, queueEmails, vendorEmails]);

  const changeStatus: AdminCtx["changeStatus"] = useCallback((id, next, awardedVendorId) => {
    setTenders((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const snapshot = { ...t } as Partial<Tender>; delete snapshot.history;
      const version: TenderVersion = {
        version: t.history.length + 1, editedAt: fmtTime(), editedBy: "Sri. R. Venkatesh, IAS",
        changes: `Status changed: ${t.status} → ${next}${awardedVendorId ? ` (awarded to ${awardedVendorId})` : ""}`,
        snapshot: snapshot as Omit<Tender, "history">,
      };
      const updated: Tender = { ...t, status: next, awardedVendorId: awardedVendorId ?? t.awardedVendorId, history: [version, ...t.history] };

      if (next === "Published") {
        const targets = vendorEmails(updated.eligibleVendorIds);
        pushNotification({ title: `Tender published: ${updated.name}`, body: `NIT ${updated.id} is now live. Bid submission deadline: ${updated.endDate}.`, type: "tender_created", audience: `${targets.length} vendors`, targetRole: "vendor", targetVendorIds: updated.eligibleVendorIds, channels: ["in_app", "email"], relatedTenderId: id });
        queueEmails(targets, `[AP e-Procurement] New Tender ${id}`, `A new tender "${updated.name}" has been published. Bid submission deadline: ${updated.endDate}.`);
      } else if (next === "Awarded" && awardedVendorId) {
        const winner = vendors.find((v) => v.id === awardedVendorId);
        const losers = vendors.filter((v) => updated.eligibleVendorIds.includes(v.id) && v.id !== awardedVendorId && !v.blacklisted);
        if (winner) {
          pushNotification({ title: `Tender awarded: ${updated.name}`, body: `Letter of Award issued to ${winner.companyName}.`, type: "tender_awarded", audience: "Admin", targetRole: "admin", channels: ["in_app"], relatedTenderId: id });
          pushNotification({ title: `LoA issued: ${updated.name}`, body: `Congratulations. You have been awarded NIT ${updated.id}. Please report within 7 working days.`, type: "tender_awarded", audience: winner.companyName, targetRole: "vendor", targetVendorIds: [winner.id], channels: ["in_app", "email"], relatedTenderId: id });
          if (losers.length) {
            pushNotification({ title: `Tender outcome: ${updated.name}`, body: `NIT ${updated.id} has been awarded to another bidder. Thank you for participating.`, type: "info", audience: `${losers.length} unsuccessful vendors`, targetRole: "vendor", targetVendorIds: losers.map((l) => l.id), channels: ["in_app", "email"], relatedTenderId: id });
          }
          queueEmails([winner.email], `[AP e-Procurement] LoA – ${id}`, `Congratulations. You have been awarded the tender "${updated.name}". Please report within 7 working days.`);
          queueEmails(losers.map((l) => l.email), `[AP e-Procurement] Tender ${id} – Outcome`, `Thank you for participating in tender "${updated.name}". The contract has been awarded to another bidder.`);
        }
      } else {
        pushNotification({ title: `Tender ${next.toLowerCase()}: ${updated.name}`, body: `${updated.id} moved to ${next}.`, type: "info", audience: "Admin", targetRole: "admin", channels: ["in_app"], relatedTenderId: id });
      }
      return updated;
    }));
  }, [pushNotification, queueEmails, vendors, vendorEmails]);

  const deleteTender = useCallback((id: string) => setTenders((p) => p.filter((t) => t.id !== id)), []);
  const markAllRead = useCallback(() => setNotifications((p) => p.map((n) => ({ ...n, read: true }))), []);
  const markRead = useCallback((id: string) => setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n))), []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const approveVendor = useCallback((id: string) => {
    const pr = pendingVendors.find(v => v.id === id);
    if (!pr) return;

    const newVendor: Vendor = {
      id: pr.id,
      companyName: pr.company,
      contactPerson: pr.contact,
      email: pr.email,
      phone: pr.phone,
      category: "Services", // Default
      gst: "PENDING",
      pan: "PENDING",
      registeredOn: pr.submittedOn,
      pastPerformance: 100,
      completedTenders: 0,
      blacklisted: false,
    };

    setVendors(prev => [...prev, newVendor]);
    setPendingVendors(prev => prev.filter(v => v.id !== id));
    
    pushNotification({
      title: "Vendor Approved",
      body: `${pr.company} has been approved and added to the directory.`,
      type: "info",
      audience: "Admin",
      targetRole: "admin",
      channels: ["in_app"],
    });
  }, [pendingVendors, pushNotification]);

  const rejectVendor = useCallback((id: string) => {
    setPendingVendors(prev => prev.filter(v => v.id !== id));
  }, []);

  const addPendingVendor = useCallback((v: Omit<PendingVendor, "status" | "submittedOn">) => {
    const newPr: PendingVendor = {
      ...v,
      status: "Pending Review",
      submittedOn: new Date().toISOString().slice(0, 10),
    };
    setPendingVendors(prev => [newPr, ...prev]);
    pushNotification({
      title: "New Vendor Registration",
      body: `${v.company} has submitted a registration request.`,
      type: "info",
      audience: "Admin",
      targetRole: "admin",
      channels: ["in_app"],
    });
  }, [pushNotification]);

  const value: AdminCtx = { 
    vendors, 
    pendingVendors,
    tenders, 
    notifications, 
    emails, 
    unreadCount, 
    createTender, 
    updateTender, 
    changeStatus, 
    deleteTender, 
    markAllRead, 
    markRead,
    approveVendor,
    rejectVendor,
    addPendingVendor
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdmin must be used inside <AdminStoreProvider>");
  return c;
}

export const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
export const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
export const fmtDateTime = (s: string) =>
  new Date(s).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
