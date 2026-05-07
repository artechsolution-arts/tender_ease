# AP e-Procurement Portal

**Transparent. Paperless. Intelligent.**

A full-stack digital procurement platform built for the Government of Andhra Pradesh. Replaces paper-based tender cycles with a secure, auditable, AI-assisted web portal accessible to government officers, vendors, and auditors.

---

## User Roles

| Role | What They Do |
|---|---|
| **Admin / Officer** | Publish tenders, evaluate bids, manage vendors, generate reports |
| **Vendor / Contractor** | Register, upload documents, submit bids, track status |
| **Auditor / Public** | View published tenders and outcomes |

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Routing | React Router v6 |
| Charts | Recharts |
| Date picker | react-day-picker v8 (via shadcn Calendar) |
| HTTP | Axios |

### Backend
| Layer | Technology |
|---|---|
| API server | FastAPI (Python 3.13) |
| ORM | SQLAlchemy 2.x + Alembic |
| Database | PostgreSQL 17 |
| Auth | JWT (python-jose) + bcrypt |
| File storage | SeaweedFS (S3-compatible object store) |
| AI | Anthropic Claude API (document analysis, insights) |
| Email | SMTP via Python `smtplib` |

### Infrastructure
| Component | Technology |
|---|---|
| Containerisation | Docker + Docker Compose |
| Reverse proxy | nginx |
| Process | Uvicorn (ASGI) |

---

## Project Structure

```
tender_ease/
├── src/                          # React frontend
│   ├── components/
│   │   ├── admin/                # TenderFormDialog, BidEvaluationSheet, etc.
│   │   ├── ui/                   # shadcn/ui primitives
│   │   └── layout/               # Sidebar, Header, AppLayout
│   ├── pages/
│   │   ├── Login.tsx             # Splash-screen login with bank selector
│   │   ├── Dashboard.tsx         # Admin KPI dashboard with live charts
│   │   ├── Tenders.tsx           # Tender list, detail drawer, bid evaluation
│   │   ├── Vendors.tsx           # Vendor directory, blacklist, document review
│   │   ├── VendorDashboard.tsx   # Vendor-side home with KPI cards
│   │   ├── VendorProjects.tsx    # Eligible tenders, bids, awarded contracts
│   │   ├── Awards.tsx            # Contract award registry
│   │   ├── Reports.tsx           # Financial, audit, and performance reports
│   │   └── Compliance.tsx        # GFR/CVC audit log, blacklist registry
│   ├── lib/
│   │   └── api.ts                # Axios instance + typed API helpers
│   └── main.tsx
│
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app, CORS, router registration
│   │   ├── models.py             # SQLAlchemy ORM models (14 tables)
│   │   ├── core/
│   │   │   └── config.py         # Pydantic settings (env vars)
│   │   ├── routers/
│   │   │   ├── auth.py           # /auth/login, /auth/me
│   │   │   ├── tenders.py        # CRUD + bid submission + evaluation
│   │   │   ├── vendors.py        # Registration, document upload, blacklist
│   │   │   └── documents.py      # SeaweedFS upload/download/delete
│   │   └── services/
│   │       ├── email_service.py  # SMTP notifications
│   │       └── seaweedfs_service.py  # Object storage wrapper
│   ├── seed.py                   # Seeds 60+ tenders, 30 vendors, bids, users
│   └── requirements.txt
│
├── docs/
│   └── pitch-deck.md             # Government presentation deck (8 slides + 10 Q&As)
│
├── public/                       # Bank logos for login page
├── docker-compose.yml
├── nginx.conf
└── Makefile
```

---

## Database Schema

14 tables managed by SQLAlchemy + Alembic migrations:

| Table | Purpose |
|---|---|
| `users` | Admin and vendor accounts with role, department |
| `vendors` | Company registration, GST, PAN, performance score |
| `vendor_documents` | Documents uploaded per vendor with AI verification status |
| `tenders` | NIT details, eligibility, budget, status, timeline |
| `tender_documents` | Attachments linked to tenders (stored in SeaweedFS) |
| `bids` | Vendor bid submissions (sealed until deadline) |
| `bid_items` | Line-item breakdown per bid |
| `awards` | Contract award records with LoA details |
| `payments` | Payment milestones against awarded contracts |
| `audit_logs` | Immutable log of every user action with IP + timestamp |
| `blacklists` | Debarred vendors with reason, order number, dates |
| `notifications` | Email notification queue and delivery status |
| `compliance_findings` | CVC/GFR deviation flags |
| `departments` | Government department registry |

---

## Getting Started

### Option A — Docker (recommended)

```bash
# Clone the repo
git clone <repo-url>
cd tender_ease

# Copy and configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your DB credentials and API keys

# Start all services
make up
# or: docker compose up --build -d

# Seed the database
docker compose exec backend python seed.py

# Frontend:  http://localhost:5173
# API docs:  http://localhost:8000/docs
```

### Option B — Local Development

**Prerequisites:** Node 20+, Python 3.13+, PostgreSQL 17, SeaweedFS (optional)

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # configure DATABASE_URL etc.
alembic upgrade head
python seed.py
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd ..
npm install
npm run dev
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL 17 connection string | `postgresql://user:pass@localhost/tender_db` |
| `SECRET_KEY` | JWT signing secret (keep this private) | `your-secret-key-here` |
| `ANTHROPIC_API_KEY` | Claude API key for document AI | `sk-ant-...` |
| `SEAWEEDFS_MASTER_URL` | SeaweedFS master node | `http://localhost:9333` |
| `SMTP_HOST` | Mail server host | `smtp.gmail.com` |
| `SMTP_PORT` | Mail server port | `587` |
| `SMTP_USER` | Sender email address | `noreply@ap.gov.in` |
| `SMTP_PASSWORD` | Mail server password | |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |

---

## API Reference

Base URL: `http://localhost:8000/api`

Interactive docs at `/docs` (Swagger UI) and `/redoc`.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Username + password → JWT token |
| `GET` | `/auth/me` | Current user profile |

### Tenders
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tenders` | List all tenders (with filters) |
| `POST` | `/tenders` | Create new NIT (admin) |
| `GET` | `/tenders/{id}` | Tender detail with documents and bids |
| `PATCH` | `/tenders/{id}` | Update tender (admin) |
| `POST` | `/tenders/{id}/bids` | Submit a bid (vendor) |
| `POST` | `/tenders/{id}/evaluate` | Record evaluation result (admin) |
| `POST` | `/tenders/{id}/award` | Issue Letter of Award (admin) |

### Vendors
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/vendors` | Vendor directory with search and filters |
| `POST` | `/vendors` | Register new vendor |
| `GET` | `/vendors/{id}` | Vendor profile with documents and history |
| `POST` | `/vendors/{id}/documents` | Upload vendor document |
| `DELETE` | `/vendors/{id}/documents/{doc_id}` | Delete vendor document |
| `POST` | `/vendors/{id}/blacklist` | Add to blacklist (admin) |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/documents/upload` | Upload file to SeaweedFS |
| `GET` | `/documents/{id}/download` | Download file |
| `DELETE` | `/documents/{id}` | Delete file |

---

## AI Features

### Document Verification
Claude AI analyses uploaded vendor documents and returns structured results:

```
Vendor uploads → FastAPI receives file → Claude reads content →
Returns: { status: VERIFIED | FLAGGED | REJECTED, issues: [...], confidence: 0.0–1.0 }
```

What the AI checks per document type:

| Document | Checks |
|---|---|
| PAN Card | Name matches vendor registration, format valid |
| GST Certificate | Active status, GSTIN format, business name |
| Financial Statements | Revenue figures present, CA signature visible |
| Bank Solvency | Bank name, amount, date, authorised signatory |
| ISO Certificates | Validity date not expired |

Officers review only `FLAGGED` documents — AI handles the rest. Human override is always available.

### Dashboard Insights
The admin dashboard uses Claude to generate natural-language summaries of procurement trends, vendor performance patterns, and compliance deviations from live database data.

---

## Compliance

| Standard | Implementation |
|---|---|
| **GFR 2017** | NIT format (Form-I), two-cover bid system, evaluation and award formats |
| **CVC Guidelines** | All procurement steps logged; CVC compliance dashboard flags deviations |
| **IT Act 2000** | Digital records with timestamps are admissible as legal evidence |
| **RTI Act 2005** | All published tender data queryable by public |

---

## Security

- **Passwords** — bcrypt-hashed; plaintext never stored
- **JWT tokens** — short-lived, signed with `SECRET_KEY`
- **Bids sealed at deadline** — database-level lock; no modifications after closing time
- **Audit log** — immutable append-only table; every action records user, timestamp, IP
- **Role-based access** — vendors cannot read other vendors' bid amounts
- **Blacklist enforcement** — automatic block at bid submission; cannot be overridden by officers

---

## Seed Data

Running `seed.py` populates:

| Entity | Count |
|---|---|
| Admin users | 5 (across departments) |
| Vendor accounts | 30 (various categories and states) |
| Tenders | 60+ (across Open, Evaluation, Awarded, Closed statuses) |
| Bids | 150+ |
| Awarded contracts | 20 |
| Blacklisted vendors | 5 |
| Audit log entries | 500+ |

**Default admin credentials:**
```
Username: admin
Password: admin123
```

---

## Deployment

Production deployment targets AP State Data Centre (or NIC):

1. Set all environment variables in production `.env`
2. Build frontend: `npm run build` — output goes to `dist/`
3. nginx serves `dist/` as static files and proxies `/api` to Uvicorn
4. Run database migrations: `alembic upgrade head`
5. Start with Docker Compose or systemd service

```bash
# Production build
npm run build
docker compose -f docker-compose.prod.yml up -d
```

---

## Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make changes and run the type-checker: `npm run type-check`
3. Test locally against a seeded database
4. Open a pull request — include what changed and why

---

*Built for the Government of Andhra Pradesh · Department of e-Governance & IT*
