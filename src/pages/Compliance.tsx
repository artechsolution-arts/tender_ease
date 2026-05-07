import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin, fmtDate } from "@/store/admin-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, AlertTriangle, CheckCircle2, FileText, Search, Download, Eye, Scale, Lock, BookOpen, AlertOctagon, Building2 } from "lucide-react";
import { useT } from "@/lib/useT";
import { printAsPdf } from "@/lib/printPdf";
import { toast } from "sonner";

type Severity = "low" | "medium" | "high";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  ip: string;
  outcome: "success" | "flagged";
}

interface Finding {
  id: string;
  tenderId: string;
  category: "Conflict of Interest" | "Single Bidder" | "Document Mismatch" | "Cartel Risk" | "Delayed Award";
  severity: Severity;
  raisedOn: string;
  status: "Open" | "Under Review" | "Resolved";
  observation: string;
  action: string;
}

const SEV_TONE: Record<Severity, string> = {
  low: "bg-info/10 text-info border-info/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  high: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function Compliance() {
  const { tenders, vendors } = useAdmin();
  const T = useT();
  const [activeTab, setActiveTab] = useState("findings");
  const [selected, setSelected] = useState<Finding | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<AuditEntry | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Finding["status"]>>({});

  useEffect(() => {
    document.title = "Compliance & CVC — AP e-Procurement";
  }, []);

  const findings = useMemo<Finding[]>(() => [
    { id: "CVC-2026-011", tenderId: tenders[0]?.id ?? "TND-2025-041", category: "Single Bidder", severity: "high", raisedOn: "2026-04-18", status: "Open", observation: "Only 1 valid technical bid received against estimated 4 bidders. EMD pattern suggests possible cartel formation.", action: "Recommend re-tender with widened publicity and pre-bid conference." },
    { id: "CVC-2026-010", tenderId: tenders[1]?.id ?? "TND-2025-042", category: "Document Mismatch", severity: "medium", raisedOn: "2026-04-15", status: "Under Review", observation: "GST registration date in vendor declaration does not match GSTIN portal records.", action: "Issue clarification notice u/s 4.2 of CVC Manual." },
    { id: "CVC-2026-009", tenderId: tenders[3]?.id ?? "TND-2025-044", category: "Delayed Award", severity: "medium", raisedOn: "2026-04-10", status: "Resolved", observation: "LoA issued 47 days post-evaluation, exceeds 30-day CVC norm.", action: "Justification recorded; expedite future awards via DSC workflow." },
    { id: "CVC-2026-008", tenderId: tenders[2]?.id ?? "TND-2025-043", category: "Conflict of Interest", severity: "low", raisedOn: "2026-04-05", status: "Resolved", observation: "Evaluating officer previously employed with bidder (>5 years prior). Disclosed proactively.", action: "Recusal recorded; no further action required." },
    { id: "CVC-2026-007", tenderId: tenders[0]?.id ?? "TND-2025-041", category: "Cartel Risk", severity: "high", raisedOn: "2026-03-28", status: "Under Review", observation: "Three bidders submitted bids within ±0.4% of each other, all from same district.", action: "Refer to Competition Commission of India (CCI) for examination." },
  ], [tenders]);

  const displayFindings = findings.map(f => statusOverrides[f.id] ? { ...f, status: statusOverrides[f.id] } : f);

  const filtered = displayFindings.filter((f) =>
    !search || f.id.toLowerCase().includes(search.toLowerCase()) || f.tenderId.toLowerCase().includes(search.toLowerCase()) || f.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileATR = (f: Finding) => {
    setStatusOverrides(prev => ({ ...prev, [f.id]: "Resolved" }));
    setSelected(null);
    toast.success(`ATR filed for ${f.id}`, { description: `Finding marked as Resolved. Record retained in audit trail.` });
  };

  const handleComplianceReport = () => {
    const checkRows = checklist.map(c =>
      `<tr><td>${c.ref}</td><td>${c.item}</td><td style="color:${c.status==="ok"?"#27ae60":"#e67e22"}">${c.status==="ok"?"Compliant":"Needs Attention"}</td></tr>`
    ).join("");
    const findingRows = displayFindings.map(f =>
      `<tr><td style="font-family:monospace;font-size:9pt">${f.id}</td><td style="font-family:monospace;font-size:9pt">${f.tenderId}</td><td>${f.category}</td><td style="color:${f.severity==="high"?"#c0392b":f.severity==="medium"?"#e67e22":"#2980b9"}">${f.severity}</td><td>${f.status}</td><td style="font-size:9pt">${f.observation}</td></tr>`
    ).join("");
    const blackRows = vendors.filter(v=>v.blacklisted).map(v=>
      `<tr><td style="font-family:monospace;font-size:9pt">${v.id}</td><td>${v.companyName}</td><td style="font-family:monospace;font-size:9pt">${v.pan}</td><td>${v.category}</td><td style="color:#c0392b">Debarred</td></tr>`
    ).join("") || `<tr><td colspan="5" style="text-align:center;color:#888">No active blacklisting on record.</td></tr>`;

    const bodyHtml = `
      <div class="doc-title">Compliance & Vigilance Report</div>
      <div class="kv"><span class="k">Overall Compliance Score:</span>${compliancePct}%</div>
      <div class="kv"><span class="k">Checkpoints Passed:</span>${okCount} of ${checklist.length}</div>
      <div class="kv"><span class="k">Open Findings:</span>${displayFindings.filter(f=>f.status!=="Resolved").length}</div>
      <div class="kv"><span class="k">High Severity:</span>${displayFindings.filter(f=>f.severity==="high").length}</div>
      <div class="kv"><span class="k">Audit Events (24h):</span>${auditLog.length}</div>
      <div class="section-head">Pre-Award Compliance Checklist (CVC + GFR)</div>
      <table><thead><tr><th>Ref.</th><th>Checkpoint</th><th>Status</th></tr></thead><tbody>${checkRows}</tbody></table>
      <div class="section-head">Vigilance Findings & Risk Register</div>
      <table><thead><tr><th>Ref ID</th><th>Tender</th><th>Category</th><th>Severity</th><th>Status</th><th>Observation</th></tr></thead><tbody>${findingRows}</tbody></table>
      <div class="section-head">Vendor Blacklist Register</div>
      <table><thead><tr><th>Vendor ID</th><th>Company</th><th>PAN</th><th>Category</th><th>Status</th></tr></thead><tbody>${blackRows}</tbody></table>
      <div class="stamp"><p>Compliance & CVC Cell — AP e-Procurement Portal v4.2.1</p><p style="margin-top:40px;border-top:1px solid #bbb;padding-top:8px">Chief Vigilance Officer / Authorised Signatory</p><p>Date: _______________________</p></div>
    `;
    printAsPdf("Compliance & Vigilance Report", bodyHtml);
    toast.success("Print dialog opened — choose 'Save as PDF'");
  };

  const handlePolicyDownload = (p: typeof policies[number]) => {
    const bodyHtml = `
      <div class="doc-title">${p.title}</div>
      <div class="kv"><span class="k">Document Size:</span>${p.size}</div>
      <div class="kv"><span class="k">Description:</span>${p.desc}</div>
      <div class="section-head">About This Document</div>
      <p style="font-size:10pt;margin:6px 0">This document is part of the AP e-Procurement Policy Library. Officers are required to familiarise themselves with the provisions of this document relevant to their procurement role.</p>
      <p style="font-size:10pt;margin:6px 0">Access the full document via the official Government of India / Government of Andhra Pradesh publication portal. A copy is maintained in the Policy Library of the AP e-Procurement Portal for reference.</p>
      <div class="section-head">Key Reference Points</div>
      <div class="kv"><span class="k">Applicability:</span>All Government of Andhra Pradesh procuring entities</div>
      <div class="kv"><span class="k">Compliance:</span>Mandatory for tenders processed on the AP e-Procurement Portal</div>
      <div class="kv"><span class="k">Nodal Authority:</span>Finance Department, Government of Andhra Pradesh</div>
      <div class="kv"><span class="k">Helpdesk:</span>helpdesk@apeprocurement.gov.in · 1800-3070-2232</div>
      <div class="stamp"><p>AP e-Procurement Policy Library · Compliance & CVC Cell</p></div>
    `;
    printAsPdf(p.title, bodyHtml);
    toast.success("Print dialog opened — choose 'Save as PDF'");
  };

  const auditLog: AuditEntry[] = useMemo(() => [
    { id: "AUD-9821", timestamp: "2026-04-23 09:42:11", actor: "Sri. R. Venkatesh, IAS", action: "VIEWED_TENDER", entity: tenders[0]?.id ?? "TND-2025-041", ip: "10.42.18.221", outcome: "success" },
    { id: "AUD-9820", timestamp: "2026-04-23 09:38:04", actor: "Sri. R. Venkatesh, IAS", action: "STATUS_CHANGE", entity: tenders[1]?.id ?? "TND-2025-042", ip: "10.42.18.221", outcome: "success" },
    { id: "AUD-9819", timestamp: "2026-04-23 09:21:55", actor: "K. Suresh, JE", action: "DOCUMENT_DOWNLOAD", entity: tenders[2]?.id ?? "TND-2025-043", ip: "10.42.18.245", outcome: "success" },
    { id: "AUD-9818", timestamp: "2026-04-23 08:47:33", actor: "system", action: "AI_RISK_FLAG", entity: tenders[0]?.id ?? "TND-2025-041", ip: "127.0.0.1", outcome: "flagged" },
    { id: "AUD-9817", timestamp: "2026-04-22 18:11:09", actor: "P. Lakshmi", action: "BID_SUBMIT", entity: tenders[0]?.id ?? "TND-2025-041", ip: "203.110.84.12", outcome: "success" },
    { id: "AUD-9816", timestamp: "2026-04-22 16:02:48", actor: "Sri. R. Venkatesh, IAS", action: "LOA_ISSUED", entity: tenders[3]?.id ?? "TND-2025-044", ip: "10.42.18.221", outcome: "success" },
    { id: "AUD-9815", timestamp: "2026-04-22 14:55:21", actor: "system", action: "DSC_VERIFY", entity: tenders[3]?.id ?? "TND-2025-044", ip: "127.0.0.1", outcome: "success" },
    { id: "AUD-9814", timestamp: "2026-04-22 11:30:02", actor: "auditor.cvc", action: "EXPORT_REPORT", entity: "MIS-2026-Q1", ip: "10.55.91.18", outcome: "success" },
  ], [tenders]);

  const checklist = [
    { ref: "GFR Rule 144", item: "Tender published on CPP Portal & departmental website", status: "ok" },
    { ref: "GFR Rule 161", item: "Minimum 21 days notice for bid submission", status: "ok" },
    { ref: "CVC OM 12-02-1", item: "Pre-bid conference recorded & minutes circulated", status: "ok" },
    { ref: "CVC OM 8(1)(d)", item: "Two-cover system: Technical + Financial separated", status: "ok" },
    { ref: "GFR Rule 173", item: "EMD/Bid Security exemption justified for MSEs", status: "ok" },
    { ref: "CVC OM 98/ORD/1", item: "Integrity Pact signed by all bidders", status: "warn" },
    { ref: "IT Act 2000", item: "Class-3 Digital Signature Certificate validated", status: "ok" },
    { ref: "RTI Act 2005", item: "Tender award details published within 7 days", status: "ok" },
    { ref: "CVC OM 6/3/05", item: "Independent External Monitor (IEM) review for >₹50 Cr", status: "warn" },
    { ref: "AP Trans. Act 2013", item: "Reasons for L1 rejection (if any) documented", status: "ok" },
  ];

  const okCount = checklist.filter((c) => c.status === "ok").length;
  const compliancePct = Math.round((okCount / checklist.length) * 100);

  const policies = [
    { title: "General Financial Rules (GFR) 2017", desc: "Comprehensive framework for procurement of goods, works and services.", size: "2.4 MB" },
    { title: "CVC Manual on Procurement 2017", desc: "Vigilance guidelines for transparent public procurement.", size: "3.1 MB" },
    { title: "Manual for Procurement of Works 2022", desc: "Department of Expenditure, Government of India.", size: "5.8 MB" },
    { title: "AP Financial Code Vol. I & II", desc: "State-specific financial regulations and accounting procedures.", size: "12 MB" },
    { title: "IT Act 2000 — DSC Compliance", desc: "Legal framework for digital signatures in e-Procurement.", size: "1.2 MB" },
    { title: "Integrity Pact Programme", desc: "Transparency International India model template.", size: "640 KB" },
  ];

  return (
    <AdminLayout
      title={T("compliance_title")}
      breadcrumbs={[{ label: T("common_home"), to: "/" }, { label: T("nav_compliance") }]}
      actions={
        <Button size="sm" className="h-8 gap-1.5 rounded-sm bg-accent text-xs text-accent-foreground hover:bg-accent/90" onClick={handleComplianceReport}>
          <Download className="h-3.5 w-3.5" /> Compliance Report
        </Button>
      }
    >
      {/* Compliance score banner */}
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        {/* Compliance Score → Checklist tab */}
        <button
          type="button"
          className={`rounded-sm border-2 p-4 shadow-sm text-left transition-all hover:shadow-md group ${activeTab === "checklist" ? "border-success bg-success/10" : "border-success/40 bg-success/5 hover:bg-success/10"}`}
          onClick={() => setActiveTab("checklist")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 shrink-0">
              <ShieldCheck className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall Compliance Score</p>
              <p className="text-2xl font-bold text-success">{compliancePct}%</p>
              <p className="text-xs text-muted-foreground">{okCount} of {checklist.length} CVC checkpoints passed</p>
            </div>
          </div>
          <p className={`mt-2 text-xs font-semibold uppercase tracking-wide ${activeTab === "checklist" ? "text-success" : "text-muted-foreground group-hover:text-success"}`}>
            {activeTab === "checklist" ? "▶ Viewing Checklist" : "→ View Checklist"}
          </p>
        </button>

        {/* Open Findings → Findings tab */}
        <button
          type="button"
          className={`rounded-sm border p-3 shadow-sm text-left transition-all hover:shadow-md group ${activeTab === "findings" ? "border-warning bg-warning/10" : "border-border bg-card hover:bg-warning/5"}`}
          onClick={() => setActiveTab("findings")}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Open Findings</p>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-1 text-2xl font-bold text-warning">{findings.filter((f) => f.status !== "Resolved").length}</p>
          <p className="text-xs text-muted-foreground">{findings.filter((f) => f.severity === "high").length} high severity</p>
          <p className={`mt-1 text-xs font-semibold uppercase tracking-wide ${activeTab === "findings" ? "text-warning" : "text-muted-foreground group-hover:text-warning"}`}>
            {activeTab === "findings" ? "▶ Viewing Findings" : "→ View Findings"}
          </p>
        </button>

        {/* Audit Events → Audit tab */}
        <button
          type="button"
          className={`rounded-sm border p-3 shadow-sm text-left transition-all hover:shadow-md group ${activeTab === "audit" ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-primary/5"}`}
          onClick={() => setActiveTab("audit")}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Audit Events (24h)</p>
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 text-2xl font-bold text-primary">{auditLog.length}</p>
          <p className="text-xs text-muted-foreground">{auditLog.filter((a) => a.outcome === "flagged").length} flagged for review</p>
          <p className={`mt-1 text-xs font-semibold uppercase tracking-wide ${activeTab === "audit" ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>
            {activeTab === "audit" ? "▶ Viewing Audit Trail" : "→ View Audit Trail"}
          </p>
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="rounded-sm bg-secondary">
          <TabsTrigger value="findings" className="rounded-sm text-xs">CVC Findings</TabsTrigger>
          <TabsTrigger value="checklist" className="rounded-sm text-xs">Compliance Checklist</TabsTrigger>
          <TabsTrigger value="audit" className="rounded-sm text-xs">Audit Trail</TabsTrigger>
          <TabsTrigger value="policies" className="rounded-sm text-xs">Policy Library</TabsTrigger>
          <TabsTrigger value="vendors" className="rounded-sm text-xs">Blacklist Register</TabsTrigger>
        </TabsList>

        {/* Findings */}
        <TabsContent value="findings">
          <div className="rounded-sm border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b-2 border-accent bg-secondary/60 px-3 py-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-primary">Vigilance Findings & Risk Register</h3>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search findings…" className="h-7 w-56 rounded-sm border border-input bg-background pl-7 pr-2 text-xs outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Ref. ID</th>
                    <th className="px-3 py-2 text-left">Tender</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Severity</th>
                    <th className="px-3 py-2 text-left">Raised</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((f) => (
                    <tr key={f.id} className="cursor-pointer hover:bg-secondary/60 transition-colors" onClick={() => setSelected(f)}>
                      <td className="px-3 py-2 text-xs text-info">{f.id}</td>
                      <td className="px-3 py-2 text-xs">{f.tenderId}</td>
                      <td className="px-3 py-2 font-medium">{f.category}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEV_TONE[f.severity]}`}>
                          {f.severity}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{fmtDate(f.raisedOn)}</td>
                      <td className="px-3 py-2">
                        <Badge variant={f.status === "Resolved" ? "secondary" : "outline"} className={`rounded-sm text-[10px] ${f.status === "Open" ? "border-destructive/40 text-destructive" : ""}`}>
                          {f.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-[11px] text-info hover:bg-secondary" onClick={() => setSelected(f)}>
                          <Eye className="h-3 w-3" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Checklist */}
        <TabsContent value="checklist">
          <div className="rounded-sm border border-border bg-card shadow-sm">
            <div className="border-b-2 border-accent bg-secondary/60 px-3 py-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-primary">Pre-Award Compliance Checklist (CVC + GFR)</h3>
            </div>
            <ul className="divide-y divide-border">
              {checklist.map((c, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                  {c.status === "ok"
                    ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />
                    : <AlertTriangle className="h-4 w-4 flex-shrink-0 text-warning" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{c.item}</p>
                    <p className="text-xs text-muted-foreground">Ref: {c.ref}</p>
                  </div>
                  <Badge variant={c.status === "ok" ? "secondary" : "outline"} className={`rounded-sm text-[10px] ${c.status === "warn" ? "border-warning/40 text-warning" : ""}`}>
                    {c.status === "ok" ? "Compliant" : "Needs Attention"}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        {/* Audit Trail */}
        <TabsContent value="audit">
          <div className="rounded-sm border border-border bg-card shadow-sm">
            <div className="border-b-2 border-accent bg-secondary/60 px-3 py-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-primary">Immutable Audit Trail (DSC-Signed)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Event ID</th>
                    <th className="px-3 py-2 text-left">Timestamp (IST)</th>
                    <th className="px-3 py-2 text-left">Actor</th>
                    <th className="px-3 py-2 text-left">Action</th>
                    <th className="px-3 py-2 text-left">Entity</th>
                    <th className="px-3 py-2 text-left">IP</th>
                    <th className="px-3 py-2 text-left">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {auditLog.map((a) => (
                    <tr key={a.id} className="cursor-pointer hover:bg-secondary/60 transition-colors" onClick={() => setSelectedAudit(a)}>
                      <td className="px-3 py-2 text-info">{a.id}</td>
                      <td className="px-3 py-2">{a.timestamp}</td>
                      <td className="px-3 py-2">{a.actor}</td>
                      <td className="px-3 py-2 font-semibold">{a.action}</td>
                      <td className="px-3 py-2">{a.entity}</td>
                      <td className="px-3 py-2 text-muted-foreground">{a.ip}</td>
                      <td className="px-3 py-2">
                        {a.outcome === "flagged"
                          ? <span className="inline-flex items-center gap-1 text-destructive"><AlertOctagon className="h-3 w-3" /> Flagged</span>
                          : <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> OK</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {policies.map((p) => (
              <div key={p.title} className="rounded-sm border border-border bg-card p-4 shadow-sm transition hover:border-accent">
                <BookOpen className="mb-2 h-5 w-5 text-accent" />
                <h4 className="text-sm font-semibold leading-snug text-foreground">{p.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">PDF · {p.size}</span>
                  <Button size="sm" variant="outline" className="h-7 gap-1 rounded-sm text-[11px]" onClick={() => handlePolicyDownload(p)}>
                    <Download className="h-3 w-3" /> Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Blacklist */}
        <TabsContent value="vendors">
          <div className="rounded-sm border border-border bg-card shadow-sm">
            <div className="border-b-2 border-accent bg-secondary/60 px-3 py-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-primary">Vendor Blacklist & Debarment Register</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Vendor ID</th>
                    <th className="px-3 py-2 text-left">Company</th>
                    <th className="px-3 py-2 text-left">PAN</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vendors.filter((v) => v.blacklisted).map((v) => (
                    <tr key={v.id} className="cursor-pointer hover:bg-secondary/60 transition-colors" onClick={() => setSelectedVendorId(v.id)}>
                      <td className="px-3 py-2 text-xs text-info">{v.id}</td>
                      <td className="px-3 py-2 font-medium">{v.companyName}</td>
                      <td className="px-3 py-2 text-xs">{v.pan}</td>
                      <td className="px-3 py-2 text-muted-foreground">{v.category}</td>
                      <td className="px-3 py-2"><Badge variant="destructive" className="rounded-sm text-[10px]">Debarred · 3 yrs</Badge></td>
                      <td className="px-3 py-2 text-muted-foreground">Substandard supply, EMD forfeiture upheld by RB Dept.</td>
                    </tr>
                  ))}
                  {vendors.filter((v) => v.blacklisted).length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-sm text-muted-foreground">No active blacklisting on record.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Audit entry detail */}
      <Dialog open={!!selectedAudit} onOpenChange={(o) => !o && setSelectedAudit(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Lock className="h-4 w-4" /> Audit Event · {selectedAudit?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedAudit && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Event ID", selectedAudit.id],
                  ["Timestamp (IST)", selectedAudit.timestamp],
                  ["Actor", selectedAudit.actor],
                  ["Action", selectedAudit.action],
                  ["Entity", selectedAudit.entity],
                  ["IP Address", selectedAudit.ip],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-sm border border-border bg-card p-2.5">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="mt-0.5 font-semibold text-foreground">{val}</p>
                  </div>
                ))}
              </div>
              <div className={`flex items-center gap-2 rounded-sm border p-3 text-sm font-semibold ${selectedAudit.outcome === "flagged" ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-success/30 bg-success/5 text-success"}`}>
                {selectedAudit.outcome === "flagged"
                  ? <><AlertOctagon className="h-4 w-4" /> Outcome: Flagged for review</>
                  : <><CheckCircle2 className="h-4 w-4" /> Outcome: Successful</>}
              </div>
              <p className="text-xs text-muted-foreground italic">This record is part of the immutable DSC-signed audit trail. It cannot be edited or deleted.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Blacklisted vendor detail */}
      <Dialog open={!!selectedVendorId} onOpenChange={(o) => !o && setSelectedVendorId(null)}>
        <DialogContent className="max-w-lg">
          {selectedVendorId && (() => {
            const v = vendors.find((x) => x.id === selectedVendorId);
            if (!v) return null;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertOctagon className="h-4 w-4" /> Debarred Vendor · {v.id}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="text-sm font-bold text-foreground">{v.companyName}</p>
                        <p className="text-muted-foreground">{v.contactPerson} · {v.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["Vendor ID", v.id],
                      ["Category", v.category],
                      ["GST No.", v.gst || "—"],
                      ["PAN No.", v.pan || "—"],
                      ["Past Performance", `${v.pastPerformance}/100`],
                      ["Tenders Completed", String(v.completedTenders)],
                    ].map(([label, val]) => (
                      <div key={label} className="rounded-sm border border-border bg-card p-2.5">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                        <p className="mt-0.5 font-semibold text-foreground">{val}</p>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="rounded-sm border border-destructive/20 bg-secondary/40 p-3">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-destructive">Debarment Record</p>
                    <p className="text-sm"><span className="font-semibold">Status:</span> Debarred · 3 years</p>
                    <p className="mt-1 text-sm text-muted-foreground">Reason: Substandard supply, EMD forfeiture upheld by RB Department.</p>
                    <p className="mt-1 text-sm text-muted-foreground">This vendor is barred from participation in any AP Government procurement. All bids from this entity must be summarily rejected.</p>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Finding detail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Scale className="h-4 w-4" /> {selected?.id} · {selected?.category}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Tender</p><p className="font-semibold">{selected.tenderId}</p></div>
                <div><p className="text-muted-foreground">Raised on</p><p className="font-semibold">{fmtDate(selected.raisedOn)}</p></div>
                <div><p className="text-muted-foreground">Severity</p>
                  <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs font-semibold uppercase ${SEV_TONE[selected.severity]}`}>{selected.severity}</span>
                </div>
                <div><p className="text-muted-foreground">Status</p><p className="font-semibold">{selected.status}</p></div>
              </div>
              <div className="rounded-sm border border-border bg-secondary/40 p-3">
                <p className="mb-1 text-xs font-bold uppercase text-primary">Observation</p>
                <p className="text-sm leading-relaxed">{selected.observation}</p>
              </div>
              <div className="rounded-sm border border-accent/40 bg-accent/5 p-3">
                <p className="mb-1 text-xs font-bold uppercase text-accent">Recommended Action</p>
                <p className="text-sm leading-relaxed">{selected.action}</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" className="h-8 rounded-sm text-xs" onClick={() => setSelected(null)}>Close</Button>
                <Button size="sm" className="h-8 gap-1 rounded-sm bg-accent text-xs text-accent-foreground hover:bg-accent/90" onClick={() => handleFileATR(selected)}>
                  <FileText className="h-3 w-3" /> File ATR
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}