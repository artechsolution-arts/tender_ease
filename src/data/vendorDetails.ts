import type { Vendor } from "@/store/admin-store";

export interface CompletedProject {
  id: string;
  name: string;
  tenderRef: string;
  department: string;
  value: number;
  completedOn: string;
  rating: number; // 1–5
  remarks: string;
}

export interface BlacklistEntry {
  orderNo: string;
  date: string;
  authority: string;
  duration: string;
  reason: string;
  description: string;
  relatedTender?: string;
}

export interface VendorDocument {
  id: string;
  name: string;
  type: "PDF" | "JPG" | "ZIP";
  fileRef: string;
  uploadedOn: string;
  size: string;
  status: "Verified" | "Pending Review" | "Rejected";
  verifiedBy?: string;
  validUntil?: string;
  docNo: string;
  issuedBy: string;
  group: string;
}

export interface VendorDetail {
  address: string;
  city: string;
  state: string;
  turnoverLakhs: number;
  yearsActive: number;
  employees: number;
  completedProjects: CompletedProject[];
  blacklistEntry?: BlacklistEntry;
}

// Seeded random so the same vendor ID always produces the same details
function seededRand(seed: string, idx: number): number {
  let h = idx * 2654435761;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  return ((h >>> 0) / 0xffffffff);
}

function pick<T>(arr: T[], seed: string, idx: number): T {
  return arr[Math.floor(seededRand(seed, idx) * arr.length)];
}

const DEPARTMENTS = [
  "Roads & Buildings", "Public Works", "Health", "Education",
  "Digital Services", "Sanitation", "Irrigation", "Municipal",
  "Culture", "Energy", "Agriculture", "Forest",
];
const TENDER_PREFIXES = ["NIT/RB", "NIT/PW", "NIT/HLT", "NIT/EDU", "NIT/DS", "NIT/SAN", "NIT/MUN"];
const PROJECT_TEMPLATES: [string, string][] = [
  ["Road Widening & Strengthening", "Civil Works"],
  ["Office Complex Renovation", "Civil Works"],
  ["Fiber Network Deployment", "IT & Telecom"],
  ["Medical Equipment Supply", "Healthcare"],
  ["Catering & Housekeeping Services", "Services"],
  ["Solar Panel Installation", "Energy"],
  ["Water Treatment Plant Upgrade", "Infrastructure"],
  ["Waste Collection & Disposal", "Services"],
  ["CCTV Surveillance System", "IT & Telecom"],
  ["School Furniture Supply", "Goods / Supplies"],
  ["ERP Software Implementation", "IT & Telecom"],
  ["Drainage Rehabilitation", "Civil Works"],
  ["Community Health Centre Construction", "Healthcare"],
  ["Outdoor Advertising Structures", "Services"],
  ["Fleet Vehicle Procurement", "Transport"],
  ["Pumping Station Modernisation", "Infrastructure"],
  ["Ambulance Supply & AMC", "Healthcare"],
  ["LED Street Light Replacement", "Energy"],
  ["Library Digitisation Services", "IT & Telecom"],
  ["Road Marking & Signage", "Civil Works"],
];
const REMARKS_GOOD = [
  "Completed ahead of schedule. Work quality rated excellent by inspection team.",
  "All deliverables met as per contract. Zero defect liability claims.",
  "Timely completion with commendable quality. Recommended for future bids.",
  "Performed well under tight timeline. Final inspection passed without observations.",
  "Good workmanship. Minor snags resolved promptly during DLP.",
];
const REMARKS_AVG = [
  "Work completed with minor delay of 3 weeks due to monsoon disruption. No penalty levied.",
  "Quality marginally below specification in Phase-2; rectified after inspection notice.",
  "Completed within extended time limit. Performance bond encashed partially.",
  "Acceptable quality overall. A few recurring defects during DLP resolved finally.",
];

const BLACKLIST_REASONS = [
  {
    reason: "Sub-standard material supply",
    description:
      "Vendor supplied M20-grade concrete instead of specified M30 in a bridge-deck project, causing structural deficiency. Third-party audit confirmed the deviation. After show-cause proceedings under GFR 174, the competent authority ordered debarment.",
    relatedTender: "NIT/RB/2023-24/017",
  },
  {
    reason: "Abandonment of contract",
    description:
      "Vendor abandoned a sewerage-network project mid-way (35% physical progress) citing cash-flow issues, causing the department to re-tender at an additional cost of ₹18.4 L. Risk-purchase action initiated; performance guarantee forfeited.",
    relatedTender: "NIT/SAN/2022-23/029",
  },
  {
    reason: "Submission of forged documents",
    description:
      "During document verification, the vendor was found to have submitted a forged ISO 9001 certificate and falsified prior-work completion certificates. FIR registered under IPC §468. CVC recommendation triggered debarment.",
    relatedTender: "NIT/DS/2023-24/004",
  },
  {
    reason: "Non-payment of labour wages",
    description:
      "Vendor failed to disburse wages to 74 contract workers for 4 consecutive months. District Labour Office issued notice; vendor did not comply. Penalty of ₹3.2 L imposed. Debarment recommended by the executing agency.",
    relatedTender: "NIT/MUN/2022-23/041",
  },
  {
    reason: "Cartel formation / bid rigging",
    description:
      "Vendor was found to be part of a price-fixing cartel in collusion with two other bidders. CCI inquiry confirmed identical cost structures across bids. Debarred as per CVC circular dated 14-Nov-2023 on anti-competitive practices.",
  },
];

const AUTHORITIES = [
  "Chief Engineer, R&B Department, GoAP",
  "Director General, Municipal Administration, GoAP",
  "Commissioner, Health & Family Welfare, GoAP",
  "Principal Secretary, IT & Electronics Department, GoAP",
  "Superintending Engineer, PWD Zone-III",
];

export function getVendorDetail(v: Vendor): VendorDetail {
  const s = v.id; // seed string

  const addresses = ["#12, Industrial Estate", "#4B, APIIC Colony", "Plot 7, Govt. Contractor Nagar", "#88-C, Ring Road"];
  const cities = ["Vijayawada", "Visakhapatnam", "Guntur", "Tirupati", "Kurnool", "Nellore", "Kakinada"];
  const states = ["Andhra Pradesh"];

  const address = pick(addresses, s, 1);
  const city = pick(cities, s, 2);
  const state = pick(states, s, 3);
  const turnoverLakhs = Math.round((seededRand(s, 4) * 180 + 20) * 10) / 10;
  const yearsActive = Math.round(seededRand(s, 5) * 18 + 2);
  const employees = Math.round(seededRand(s, 6) * 480 + 20);

  // Generate completed projects based on completedTenders count
  const count = Math.max(v.completedTenders, 0);
  const completedProjects: CompletedProject[] = Array.from({ length: Math.min(count, 8) }, (_, i) => {
    const [name] = pick(PROJECT_TEMPLATES, s, i * 7 + 10) as [string, string];
    const dept = pick(DEPARTMENTS, s, i * 7 + 11);
    const prefix = pick(TENDER_PREFIXES, s, i * 7 + 12);
    const year = 2023 - Math.floor(seededRand(s, i * 7 + 13) * 3);
    const seq = Math.floor(seededRand(s, i * 7 + 14) * 90 + 10);
    const valueL = Math.round((seededRand(s, i * 7 + 15) * 180 + 5) * 100) * 100;
    const rating = v.pastPerformance >= 85 ? (seededRand(s, i * 7 + 16) > 0.3 ? 5 : 4)
      : v.pastPerformance >= 70 ? (seededRand(s, i * 7 + 16) > 0.5 ? 4 : 3)
      : seededRand(s, i * 7 + 16) > 0.6 ? 3 : 2;
    const remarks = rating >= 4 ? pick(REMARKS_GOOD, s, i * 7 + 17) : pick(REMARKS_AVG, s, i * 7 + 17);

    const completedDate = new Date(2024, Math.floor(seededRand(s, i * 7 + 18) * 12), Math.floor(seededRand(s, i * 7 + 19) * 28 + 1));

    return {
      id: `PROJ-${year}-${seq}`,
      name,
      tenderRef: `${prefix}/${year}-${String(year + 1).slice(2)}/${String(seq).padStart(3, "0")}`,
      department: dept,
      value: valueL,
      completedOn: completedDate.toISOString().split("T")[0],
      rating,
      remarks,
    };
  });

  let blacklistEntry: BlacklistEntry | undefined;
  if (v.blacklisted) {
    const bl = pick(BLACKLIST_REASONS, s, 20);
    const auth = pick(AUTHORITIES, s, 21);
    const yr = 2022 + Math.floor(seededRand(s, 22) * 3);
    const mo = Math.floor(seededRand(s, 23) * 12 + 1);
    const dy = Math.floor(seededRand(s, 24) * 28 + 1);
    const orderSeq = Math.floor(seededRand(s, 25) * 900 + 100);
    const isDuration = seededRand(s, 26) > 0.4;
    const durationYears = Math.floor(seededRand(s, 27) * 4 + 1);
    const endDate = new Date(yr + durationYears, mo - 1, dy);

    blacklistEntry = {
      orderNo: `DEBAR/${yr}/${orderSeq}`,
      date: `${String(dy).padStart(2, "0")}-${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][mo - 1]}-${yr}`,
      authority: auth,
      duration: isDuration ? `${durationYears} year${durationYears > 1 ? "s" : ""} (until ${endDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })})` : "Permanent",
      reason: bl.reason,
      description: bl.description,
      relatedTender: bl.relatedTender,
    };
  }

  return { address, city, state, turnoverLakhs, yearsActive, employees, completedProjects, blacklistEntry };
}

// ── Registration Documents ──────────────────────────────────────────────────

const VERIFYING_OFFICERS = [
  "Sri. K. Bhaskar Reddy, Vendor Registration Officer",
  "Smt. P. Anuradha, Helpdesk Manager",
  "Sri. M. Krishna Rao, CVO",
  "Sri. J. Hari Prasad, Audit Liaison",
  "Dr. S. Padmaja, DSC & Security Officer",
];

const GST_OFFICES = [
  "CGST & CX Commissionerate, Vijayawada",
  "GSTIN Authority, Visakhapatnam",
  "CGST Division, Guntur",
  "SGST Office, Tirupati",
];

const ROC_OFFICES = [
  "Registrar of Companies, Andhra Pradesh",
  "Ministry of Corporate Affairs, RoC Hyderabad",
  "RoC-AP, Visakhapatnam",
];

const LABOUR_OFFICES = [
  "Office of the Labour Commissioner, GoAP",
  "Assistant Labour Commissioner, Vijayawada",
  "EPF Regional Office, Hyderabad",
  "ESIC Regional Office, Guntur",
];

const CATEGORY_DOCS: Record<string, { name: string; issuedBy: string; group: string; validYears: number }[]> = {
  "Civil Works": [
    { name: "PWD Registration Certificate", issuedBy: "Chief Engineer, R&B Department, GoAP", group: "Category Licence", validYears: 3 },
    { name: "Labour Licence (Form III)", issuedBy: "Assistant Labour Commissioner, GoAP", group: "Category Licence", validYears: 1 },
    { name: "ISO 45001 — Occupational Safety Certificate", issuedBy: "Bureau of Indian Standards", group: "Quality Certificate", validYears: 3 },
  ],
  "Infrastructure": [
    { name: "PWD Registration Certificate", issuedBy: "Chief Engineer, Public Works, GoAP", group: "Category Licence", validYears: 3 },
    { name: "Labour Licence (Form III)", issuedBy: "Assistant Labour Commissioner, GoAP", group: "Category Licence", validYears: 1 },
    { name: "ISO 9001:2015 Quality Certificate", issuedBy: "TÜV India Pvt. Ltd.", group: "Quality Certificate", validYears: 3 },
  ],
  "IT & Telecom": [
    { name: "ISO 9001:2015 Quality Certificate", issuedBy: "TÜV Rheinland India", group: "Quality Certificate", validYears: 3 },
    { name: "DoT Empanelment Certificate", issuedBy: "Dept. of Telecommunications, MeitY", group: "Category Licence", validYears: 2 },
    { name: "STQC / CERT-In Empanelment Letter", issuedBy: "STQC Directorate, GoI", group: "Category Licence", validYears: 2 },
  ],
  "Healthcare": [
    { name: "Drug Licence (Form 20B & 21B)", issuedBy: "State Drugs Control Administration, GoAP", group: "Category Licence", validYears: 3 },
    { name: "WHO-GMP Certificate", issuedBy: "World Health Organization, SEARO", group: "Quality Certificate", validYears: 3 },
    { name: "CDSCO Market Authorisation", issuedBy: "Central Drugs Standard Control Organisation", group: "Category Licence", validYears: 3 },
  ],
  "Services": [
    { name: "FSSAI Food Safety Licence", issuedBy: "Food Safety and Standards Authority of India", group: "Category Licence", validYears: 1 },
    { name: "Trade Licence", issuedBy: "Municipal Corporation / ULB", group: "Category Licence", validYears: 1 },
  ],
  "Transport": [
    { name: "Motor Vehicle Authorization (Section 88)", issuedBy: "Regional Transport Office, GoAP", group: "Category Licence", validYears: 1 },
    { name: "Fleet RTO Permit Bundle", issuedBy: "State Transport Authority, GoAP", group: "Category Licence", validYears: 1 },
  ],
  "Facilities": [
    { name: "PWD Registration Certificate", issuedBy: "Chief Engineer, Public Works, GoAP", group: "Category Licence", validYears: 3 },
    { name: "BEE / Energy Audit Accreditation", issuedBy: "Bureau of Energy Efficiency, GoI", group: "Quality Certificate", validYears: 2 },
  ],
};

function fmtDocDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function getVendorDocuments(v: Vendor): VendorDocument[] {
  const s = v.id;
  const regDate = new Date(v.registeredOn);

  function uploadDate(daysAfter: number): string {
    const d = new Date(regDate);
    d.setDate(d.getDate() + daysAfter);
    return fmtDocDate(d);
  }

  function expiryDate(fromReg: number, years: number): string {
    const d = new Date(regDate);
    d.setFullYear(d.getFullYear() + fromReg + years);
    return fmtDocDate(d);
  }

  const officer = pick(VERIFYING_OFFICERS, s, 50);
  const gstOffice = pick(GST_OFFICES, s, 51);
  const rocOffice = pick(ROC_OFFICES, s, 52);
  const labourOffice = pick(LABOUR_OFFICES, s, 53);

  const gstNo = v.gst || `37AABC${s.slice(-4)}Z${Math.floor(seededRand(s, 54) * 9 + 1)}`;
  const panNo = v.pan || `AABC${s.slice(-4)}Q`;
  const epfNo = `AP/${String(Math.floor(seededRand(s, 55) * 9000 + 1000))}/${String(Math.floor(seededRand(s, 56) * 90000 + 10000))}`;
  const esiNo = `AP-${String(Math.floor(seededRand(s, 57) * 90000 + 10000))}`;
  const cinNo = `U${Math.floor(seededRand(s, 58) * 9 + 1)}0000AP${2010 + Math.floor(seededRand(s, 59) * 10)}PTC${Math.floor(seededRand(s, 60) * 900000 + 100000)}`;

  function docStatus(idx: number): "Verified" | "Pending Review" | "Rejected" {
    const r = seededRand(s, 70 + idx);
    if (v.blacklisted) return r > 0.5 ? "Verified" : r > 0.2 ? "Pending Review" : "Rejected";
    return r > 0.12 ? "Verified" : "Pending Review";
  }

  const SIZES = ["412 KB", "780 KB", "1.1 MB", "1.4 MB", "2.2 MB", "3.1 MB", "560 KB", "890 KB"];

  const baseDocs: VendorDocument[] = [
    {
      id: `${s}-D01`, name: "GST Registration Certificate", type: "PDF",
      fileRef: `${s}_GST_Reg.pdf`, uploadedOn: uploadDate(0),
      size: pick(SIZES, s, 61), status: docStatus(1),
      verifiedBy: docStatus(1) === "Verified" ? officer : undefined,
      validUntil: undefined, docNo: gstNo, issuedBy: gstOffice, group: "Tax & Compliance",
    },
    {
      id: `${s}-D02`, name: "PAN Card (Self-attested Copy)", type: "PDF",
      fileRef: `${s}_PAN.pdf`, uploadedOn: uploadDate(0),
      size: pick(SIZES, s, 62), status: docStatus(2),
      verifiedBy: docStatus(2) === "Verified" ? officer : undefined,
      validUntil: undefined, docNo: panNo, issuedBy: "Income Tax Department, GoI", group: "Tax & Compliance",
    },
    {
      id: `${s}-D03`, name: "Certificate of Incorporation / Trade Licence", type: "PDF",
      fileRef: `${s}_Incorporation.pdf`, uploadedOn: uploadDate(1),
      size: pick(SIZES, s, 63), status: docStatus(3),
      verifiedBy: docStatus(3) === "Verified" ? officer : undefined,
      validUntil: expiryDate(0, 5), docNo: cinNo, issuedBy: rocOffice, group: "Legal & Identity",
    },
    {
      id: `${s}-D04`, name: `Audited Balance Sheet — FY ${2021 + Math.floor(seededRand(s, 64) * 2)}-${22 + Math.floor(seededRand(s, 64) * 2)}`, type: "PDF",
      fileRef: `${s}_BS_Y1.pdf`, uploadedOn: uploadDate(2),
      size: pick(SIZES, s, 65), status: docStatus(4),
      verifiedBy: docStatus(4) === "Verified" ? officer : undefined,
      validUntil: undefined,
      docNo: `CA/${Math.floor(seededRand(s, 75) * 90000 + 10000)}`, issuedBy: "Chartered Accountant (ICAI Member)", group: "Financial Records",
    },
    {
      id: `${s}-D05`, name: `Audited Balance Sheet — FY ${2022 + Math.floor(seededRand(s, 66) * 1)}-${23 + Math.floor(seededRand(s, 66) * 1)}`, type: "PDF",
      fileRef: `${s}_BS_Y2.pdf`, uploadedOn: uploadDate(2),
      size: pick(SIZES, s, 66), status: docStatus(5),
      verifiedBy: docStatus(5) === "Verified" ? officer : undefined,
      validUntil: undefined,
      docNo: `CA/${Math.floor(seededRand(s, 76) * 90000 + 10000)}`, issuedBy: "Chartered Accountant (ICAI Member)", group: "Financial Records",
    },
    {
      id: `${s}-D06`, name: "Audited Balance Sheet — FY 2024-25", type: "PDF",
      fileRef: `${s}_BS_Y3.pdf`, uploadedOn: uploadDate(2),
      size: pick(SIZES, s, 67), status: docStatus(6),
      verifiedBy: docStatus(6) === "Verified" ? officer : undefined,
      validUntil: undefined,
      docNo: `CA/${Math.floor(seededRand(s, 77) * 90000 + 10000)}`, issuedBy: "Chartered Accountant (ICAI Member)", group: "Financial Records",
    },
    {
      id: `${s}-D07`, name: "EPF Registration Certificate", type: "PDF",
      fileRef: `${s}_EPF.pdf`, uploadedOn: uploadDate(3),
      size: pick(SIZES, s, 68), status: docStatus(7),
      verifiedBy: docStatus(7) === "Verified" ? officer : undefined,
      validUntil: undefined, docNo: epfNo, issuedBy: "Employees' Provident Fund Organisation, GoI", group: "Labour & Social Security",
    },
    {
      id: `${s}-D08`, name: "ESI Registration Certificate", type: "PDF",
      fileRef: `${s}_ESI.pdf`, uploadedOn: uploadDate(3),
      size: pick(SIZES, s, 69), status: docStatus(8),
      verifiedBy: docStatus(8) === "Verified" ? officer : undefined,
      validUntil: undefined, docNo: esiNo, issuedBy: labourOffice, group: "Labour & Social Security",
    },
    {
      id: `${s}-D09`, name: "Cancelled Cheque (Primary Bank Account)", type: "JPG",
      fileRef: `${s}_Cheque.jpg`, uploadedOn: uploadDate(1),
      size: pick(SIZES, s, 70), status: docStatus(9),
      verifiedBy: docStatus(9) === "Verified" ? officer : undefined,
      validUntil: undefined,
      docNo: `AC/${String(Math.floor(seededRand(s, 78) * 9000000000 + 1000000000)).slice(0, 12)}`,
      issuedBy: pick(["State Bank of India", "Andhra Bank", "Union Bank of India", "Canara Bank", "HDFC Bank"], s, 72),
      group: "Banking & Financial",
    },
    {
      id: `${s}-D10`, name: "Power of Attorney / Authorisation Letter", type: "PDF",
      fileRef: `${s}_POA.pdf`, uploadedOn: uploadDate(1),
      size: pick(SIZES, s, 71), status: docStatus(10),
      verifiedBy: docStatus(10) === "Verified" ? officer : undefined,
      validUntil: expiryDate(0, 2), docNo: `POA/${v.id}/${new Date(v.registeredOn).getFullYear()}`,
      issuedBy: "Company Secretary / Notary Public", group: "Legal & Identity",
    },
  ];

  const catTemplates = CATEGORY_DOCS[v.category] ?? CATEGORY_DOCS["Services"];
  const catDocs: VendorDocument[] = catTemplates.map((t, i) => {
    const st = docStatus(20 + i);
    const yr = new Date(v.registeredOn).getFullYear();
    const seq = Math.floor(seededRand(s, 80 + i) * 90000 + 10000);
    return {
      id: `${s}-DC${i + 1}`, name: t.name, type: "PDF",
      fileRef: `${s}_${t.group.replace(/\s/g, "")}_${i + 1}.pdf`,
      uploadedOn: uploadDate(4 + i),
      size: pick(SIZES, s, 82 + i), status: st,
      verifiedBy: st === "Verified" ? officer : undefined,
      validUntil: expiryDate(0, t.validYears),
      docNo: `${v.category.slice(0, 3).toUpperCase()}/${yr}/${seq}`,
      issuedBy: t.issuedBy, group: t.group,
    };
  });

  return [...baseDocs, ...catDocs];
}
