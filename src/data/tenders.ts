export type TenderStatus = "Open" | "Under Review" | "Awarded" | "Closed" | "Draft";

export interface Tender {
  id: string;
  title: string;
  category: string;
  department: string;
  value: number;
  bids: number;
  deadline: string;
  status: TenderStatus;
  officer: string;
}

export const tenders: Tender[] = [
  { id: "TND-2041", title: "Highway 7 Resurfacing — Phase II", category: "Infrastructure", department: "Public Works", value: 2_450_000, bids: 12, deadline: "2026-05-12", status: "Open", officer: "A. Rahman" },
  { id: "TND-2042", title: "Municipal Fiber Network Expansion", category: "IT & Telecom", department: "Digital Services", value: 1_180_000, bids: 8, deadline: "2026-05-04", status: "Under Review", officer: "L. Chen" },
  { id: "TND-2043", title: "School Cafeteria Catering Contract", category: "Services", department: "Education", value: 320_000, bids: 17, deadline: "2026-04-29", status: "Open", officer: "M. Okafor" },
  { id: "TND-2044", title: "Fleet Electric Vehicles Procurement", category: "Transport", department: "Fleet Mgmt", value: 3_900_000, bids: 6, deadline: "2026-06-01", status: "Draft", officer: "S. Patel" },
  { id: "TND-2045", title: "City Hall HVAC Modernization", category: "Facilities", department: "Public Works", value: 870_000, bids: 9, deadline: "2026-04-22", status: "Awarded", officer: "A. Rahman" },
  { id: "TND-2046", title: "Parks & Recreation Equipment", category: "Services", department: "Parks", value: 145_000, bids: 14, deadline: "2026-05-18", status: "Open", officer: "J. Müller" },
  { id: "TND-2047", title: "Cybersecurity Audit Services", category: "IT & Telecom", department: "Digital Services", value: 240_000, bids: 11, deadline: "2026-04-30", status: "Under Review", officer: "L. Chen" },
  { id: "TND-2048", title: "Waste Collection Routes — North", category: "Services", department: "Sanitation", value: 1_650_000, bids: 5, deadline: "2026-03-30", status: "Closed", officer: "M. Okafor" },
  { id: "TND-2049", title: "Public Library Renovation", category: "Infrastructure", department: "Culture", value: 540_000, bids: 7, deadline: "2026-05-25", status: "Open", officer: "S. Patel" },
  { id: "TND-2050", title: "Emergency Medical Supplies Q3", category: "Healthcare", department: "Health", value: 410_000, bids: 13, deadline: "2026-04-26", status: "Open", officer: "J. Müller" },
];

export const monthlyVolume = [
  { month: "Nov", published: 18, awarded: 11 },
  { month: "Dec", published: 22, awarded: 14 },
  { month: "Jan", published: 27, awarded: 19 },
  { month: "Feb", published: 24, awarded: 17 },
  { month: "Mar", published: 31, awarded: 22 },
  { month: "Apr", published: 29, awarded: 18 },
];

export const categoryBreakdown = [
  { name: "Infrastructure", value: 38 },
  { name: "IT & Telecom", value: 22 },
  { name: "Services", value: 18 },
  { name: "Transport", value: 12 },
  { name: "Healthcare", value: 10 },
];