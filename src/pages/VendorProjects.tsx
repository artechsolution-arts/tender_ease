import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmtDate, fmtINR } from "@/store/admin-store";
import { useAuth } from "@/store/auth-store";
import {
  CalendarClock, CheckCircle2, Download, FileText, RefreshCw,
  Send, TrendingUp, Wallet, Award, Clock, AlertTriangle,
} from "lucide-react";
import { apiClient as api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Tender {
  id: string;
  name: string;
  description?: string;
  department: string;
  category: string;
  estimatedValue: number;
  endDate: string;
  startDate: string;
  status: string;
  awardedVendorId?: string;
  eligibleVendorIds: string[];
  eligibleVendorCount?: number;
  documents?: { id: string; name: string; url?: string; size?: string }[];
}

interface Bid {
  id: string;
  tenderId: string;
  vendorId: string;
  amount: number;
  notes: string;
  status: string;
  submittedAt: string;
}

function BidStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Awarded:       "bg-success text-success-foreground",
    Submitted:     "bg-primary text-primary-foreground",
    "Under Review":"bg-info text-info-foreground",
    Rejected:      "bg-destructive text-destructive-foreground",
  };
  return (
    <Badge className={`rounded-sm text-[11px] ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </Badge>
  );
}

function TableSkeleton({ cols, rows = 4 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function VendorProjects() {
  const { currentUser } = useAuth();
  const qc = useQueryClient();
  const vendorId = currentUser?.vendorId ?? "";

  const [activeKpi, setActiveKpi] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("eligible");
  const [detailTenderId, setDetailTenderId] = useState<string | null>(null);
  const [bidOpen, setBidOpen] = useState(false);
  const [selectedTenderId, setSelectedTenderId] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [bidNotes, setBidNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const tendersRef = useRef<HTMLDivElement>(null);
  const bidsRef = useRef<HTMLDivElement>(null);
  const awardedRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = "My Projects — AP Tender"; }, []);

  // ── Data ─────────────────────────────────────────────────────────────────────
  const { data: tendersData, isLoading: tendersLoading, isFetching: tendersFetching } = useQuery<{ tenders: Tender[] }>({
    queryKey: ["vendor-tenders"],
    queryFn: async () => (await api.get("/tenders", { params: { limit: 100 } })).data,
    staleTime: 30_000,
  });

  const { data: bidsData, isLoading: bidsLoading, isFetching: bidsFetching, refetch: refetchBids } = useQuery<{ bids: Bid[] }>({
    queryKey: ["my-bids"],
    queryFn: async () => (await api.get("/bids", { params: { limit: 100 } })).data,
    staleTime: 30_000,
  });

  const { data: tenderDetail, isLoading: detailLoading } = useQuery<Tender>({
    queryKey: ["tender-detail", detailTenderId],
    queryFn: async () => (await api.get<Tender>(`/tenders/${detailTenderId}`)).data,
    enabled: Boolean(detailTenderId),
    staleTime: 60_000,
  });

  // ── Derived ──────────────────────────────────────────────────────────────────
  const allTenders: Tender[] = tendersData?.tenders ?? [];
  const myBids: Bid[] = bidsData?.bids ?? [];

  const eligibleTenders = useMemo(
    () => allTenders.filter((t) => t.eligibleVendorIds?.includes(vendorId)),
    [allTenders, vendorId],
  );
  const openTenders    = eligibleTenders.filter((t) => t.status === "Published");
  const awardedTenders = eligibleTenders.filter((t) => t.awardedVendorId === vendorId);
  const completedTenders = eligibleTenders.filter((t) => t.status === "Completed");
  const awardedValue   = awardedTenders.reduce((s, t) => s + t.estimatedValue, 0);

  const enrichedBids = useMemo(() => {
    const map = Object.fromEntries(allTenders.map((t) => [t.id, t]));
    return myBids.map((b) => ({ ...b, tenderName: map[b.tenderId]?.name ?? "—" }));
  }, [myBids, allTenders]);

  const alreadyBid = useMemo(
    () => myBids.some((b) => b.tenderId === detailTenderId),
    [myBids, detailTenderId],
  );

  const displayedEligible = useMemo(
    () => statusFilter ? eligibleTenders.filter((t) => t.status === statusFilter) : eligibleTenders,
    [eligibleTenders, statusFilter],
  );

  // ── Submit bid ───────────────────────────────────────────────────────────────
  async function handleBidSubmit() {
    if (!selectedTenderId || !bidAmount) return;
    setSubmitting(true);
    try {
      await api.post("/bids", { tenderId: selectedTenderId, amount: Number(bidAmount), notes: bidNotes });
      toast({ title: "Bid submitted successfully", description: `Your bid on ${selectedTenderId} has been recorded.` });
      setBidOpen(false);
      setSelectedTenderId(""); setBidAmount(""); setBidNotes("");
      refetchBids();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to submit bid.";
      toast({ title: "Submission Failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  function applyFromDetail() {
    if (!tenderDetail) return;
    setDetailTenderId(null);
    setSelectedTenderId(tenderDetail.id);
    setBidOpen(true);
  }

  // ── KPI config ───────────────────────────────────────────────────────────────
  const kpis = [
    { key: "eligible", label: "Eligible Tenders", value: tendersLoading ? "—" : eligibleTenders.length,   sub: "Matched to category",    color: "border-l-primary", text: "text-primary",  filter: null,        ref: tendersRef, tab: "eligible" },
    { key: "open",     label: "Open to Bid",       value: tendersLoading ? "—" : openTenders.length,       sub: "Published tenders",      color: "border-l-warning", text: "text-warning",  filter: "Published", ref: tendersRef, tab: "eligible" },
    { key: "bids",     label: "Bids Submitted",    value: bidsLoading    ? "—" : enrichedBids.length,      sub: "Total across tenders",   color: "border-l-info",    text: "text-info",     filter: null,        ref: bidsRef,    tab: "bids"     },
    { key: "awarded",  label: "Awarded",            value: tendersLoading ? "—" : awardedTenders.length,   sub: `${fmtINR(awardedValue)}`, color: "border-l-success", text: "text-success",  filter: "Awarded",   ref: awardedRef, tab: "awarded"  },
    { key: "completed",label: "Completed",          value: tendersLoading ? "—" : completedTenders.length, sub: "Delivered projects",     color: "border-l-accent",  text: "text-accent",   filter: "Completed", ref: awardedRef, tab: "awarded"  },
  ];

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <AdminLayout
      title="My Projects"
      breadcrumbs={[
        { label: "Home", to: "/vendor-dashboard" },
        { label: "My Projects" },
      ]}
      actions={
        <Button
          size="sm"
          className="h-8 gap-1.5 rounded-sm bg-accent text-xs text-accent-foreground hover:bg-accent/90"
          onClick={() => setBidOpen(true)}
          disabled={openTenders.length === 0}
        >
          <Send className="h-3.5 w-3.5" /> Submit Bid
        </Button>
      }
    >
      {/* ── Bid submission dialog ── */}
      <Dialog open={bidOpen} onOpenChange={setBidOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-4 w-4" /> Submit a Bid
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Select Tender</label>
              <select
                className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
                value={selectedTenderId}
                onChange={(e) => setSelectedTenderId(e.target.value)}
              >
                <option value="">— Choose a tender —</option>
                {openTenders.map((t) => (
                  <option key={t.id} value={t.id}>{t.id} · {t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Bid Amount (₹)</label>
              <input
                type="number" min={0}
                className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g. 24500000"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <textarea
                className="h-20 w-full resize-none rounded-sm border border-input bg-background px-3 py-2 text-sm"
                placeholder="Optional remarks…"
                value={bidNotes}
                onChange={(e) => setBidNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBidOpen(false)}>Cancel</Button>
            <Button
              onClick={handleBidSubmit}
              disabled={!selectedTenderId || !bidAmount || submitting}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {submitting ? <><RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />Submitting…</> : "Submit Bid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Tender detail dialog ── */}
      <Dialog open={Boolean(detailTenderId)} onOpenChange={(o) => { if (!o) setDetailTenderId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <FileText className="h-4 w-4" />
              {detailLoading ? "Loading…" : tenderDetail?.id}
            </DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-3 py-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-5 w-full" />)}</div>
          ) : tenderDetail ? (
            <div className="space-y-5 py-2">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-bold leading-snug">{tenderDetail.name}</h2>
                <Badge variant="outline" className="shrink-0 rounded-sm text-xs">{tenderDetail.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-sm border border-border bg-secondary/30 p-4 text-sm">
                {[
                  ["Department",       tenderDetail.department],
                  ["Category",         tenderDetail.category],
                  ["Estimated Value",  fmtINR(tenderDetail.estimatedValue)],
                  ["Eligible Vendors", String(tenderDetail.eligibleVendorCount ?? tenderDetail.eligibleVendorIds?.length ?? "—")],
                  ["Start Date",       fmtDate(tenderDetail.startDate)],
                  ["Bid Deadline",     fmtDate(tenderDetail.endDate)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-muted-foreground">{label}</p>
                    <p className="font-semibold text-foreground mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              {tenderDetail.description && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground/90 leading-relaxed">{tenderDetail.description}</p>
                </div>
              )}
              {tenderDetail.documents && tenderDetail.documents.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Attached Documents</p>
                  <ul className="divide-y divide-border rounded-sm border border-border">
                    {tenderDetail.documents.map((doc) => (
                      <li key={doc.id} className="flex items-center justify-between gap-2 px-3 py-2 text-xs hover:bg-secondary/30">
                        <span className="flex items-center gap-2 font-medium min-w-0">
                          <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="truncate">{doc.name}</span>
                          {doc.size && <span className="text-muted-foreground shrink-0">· {doc.size}</span>}
                        </span>
                        <Button
                          size="sm" variant="outline"
                          className="h-6 shrink-0 gap-1 rounded-sm px-2 text-[10px]"
                          onClick={() => {
                            if (doc.url) {
                              window.open(doc.url, "_blank", "noopener,noreferrer");
                            } else {
                              const content = `Tender Document: ${doc.name}\nTender: ${tenderDetail.name} (${tenderDetail.id})\nDepartment: ${tenderDetail.department}`;
                              const blob = new Blob([content], { type: "text/plain" });
                              const blobUrl = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = blobUrl;
                              a.download = doc.name;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                            }
                          }}
                        >
                          <Download className="h-3 w-3" /> Download
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {alreadyBid && (
                <div className="flex items-center gap-2 rounded-sm bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  You have already submitted a bid for this tender.
                </div>
              )}
            </div>
          ) : null}
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setDetailTenderId(null)}>Close</Button>
            {tenderDetail?.status === "Published" && !alreadyBid && (
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={applyFromDetail}>
                <Send className="mr-1.5 h-3.5 w-3.5" /> Apply for this Tender
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── KPI cards ── */}
      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {kpis.map(({ key, label, value, sub, color, text, filter, ref, tab }) => {
          const isActive = activeKpi === key;
          return (
            <Card
              key={key}
              onClick={() => {
                const next = isActive ? null : key;
                setActiveKpi(next);
                setStatusFilter(next ? filter : null);
                if (next) {
                  setActiveTab(tab);
                  setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                }
              }}
              className={`rounded-sm border-l-4 ${color} p-4 cursor-pointer transition-all hover:shadow-md ${isActive ? "ring-2 ring-primary/40 bg-primary/5" : ""}`}
            >
              <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
              <p className={`text-2xl font-bold ${text}`}>{value}</p>
              <p className="text-sm text-muted-foreground">{isActive ? "Click to clear" : sub}</p>
            </Card>
          );
        })}
      </section>

      {/* ── Tabs: Eligible / Bid History / Awarded & Completed ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="rounded-sm">
          <TabsTrigger value="eligible" className="rounded-sm text-xs">Eligible Tenders</TabsTrigger>
          <TabsTrigger value="bids" className="rounded-sm text-xs">Bid History</TabsTrigger>
          <TabsTrigger value="awarded" className="rounded-sm text-xs">Awarded & Completed</TabsTrigger>
        </TabsList>

        {/* ── Eligible Tenders tab ── */}
        <TabsContent value="eligible">
          <Card ref={tendersRef} className="rounded-sm border-border shadow-sm">
            <div className="border-b border-border bg-secondary/50 px-4 py-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-primary">
                <FileText className="h-4 w-4" /> Eligible Tenders
                {!tendersLoading && (
                  <span className="text-xs font-normal text-muted-foreground">
                    ({displayedEligible.length}{statusFilter ? ` · ${statusFilter}` : ""})
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {statusFilter && (
                  <Button variant="ghost" size="sm" className="h-7 rounded-sm text-xs" onClick={() => { setStatusFilter(null); setActiveKpi(null); }}>
                    ✕ Clear filter
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={tendersFetching} onClick={() => qc.invalidateQueries({ queryKey: ["vendor-tenders"] })}>
                  <RefreshCw className={`h-3.5 w-3.5 ${tendersFetching ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30">
                    <TableHead className="pl-4">Tender ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tendersLoading ? (
                    <TableSkeleton cols={6} />
                  ) : displayedEligible.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        {statusFilter ? `No ${statusFilter.toLowerCase()} tenders found.` : "No eligible tenders found for your vendor category."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedEligible.map((t) => (
                      <TableRow
                        key={t.id}
                        className="border-border/60 cursor-pointer hover:bg-secondary/40 transition-colors"
                        onClick={() => setDetailTenderId(t.id)}
                      >
                        <TableCell className="pl-4 text-sm text-primary">{t.id}</TableCell>
                        <TableCell>
                          <p className="max-w-[240px] truncate text-sm font-medium">{t.name}</p>
                        </TableCell>
                        <TableCell className="text-sm">{t.department}</TableCell>
                        <TableCell className="text-sm font-semibold tabular-nums">{fmtINR(t.estimatedValue)}</TableCell>
                        <TableCell className="text-sm">
                          <CalendarClock className="mr-1 inline h-3 w-3 text-warning" />
                          {fmtDate(t.endDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-sm text-[11px]">{t.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ── Bid History tab ── */}
        <TabsContent value="bids">
          <Card ref={bidsRef} className="rounded-sm border-border shadow-sm">
            <div className="border-b border-border bg-secondary/50 px-4 py-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-primary">
                <TrendingUp className="h-4 w-4" /> Bid History
                {!bidsLoading && <span className="text-xs font-normal text-muted-foreground">({enrichedBids.length} bids)</span>}
              </h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={bidsFetching} onClick={() => refetchBids()}>
                <RefreshCw className={`h-3.5 w-3.5 ${bidsFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30">
                    <TableHead className="pl-4">Tender ID</TableHead>
                    <TableHead>Tender Name</TableHead>
                    <TableHead>Bid Value</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bidsLoading ? (
                    <TableSkeleton cols={5} />
                  ) : enrichedBids.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        No bids submitted yet. Use <strong>Submit Bid</strong> to participate in open tenders.
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrichedBids.map((b) => (
                      <TableRow
                        key={b.id}
                        className="border-border/60 cursor-pointer hover:bg-secondary/40 transition-colors"
                        onClick={() => setDetailTenderId(b.tenderId)}
                      >
                        <TableCell className="pl-4 text-sm">{b.tenderId}</TableCell>
                        <TableCell className="max-w-[220px] truncate text-sm">{b.tenderName}</TableCell>
                        <TableCell className="text-sm font-semibold tabular-nums">
                          <Wallet className="mr-1 inline h-3 w-3 text-accent" />
                          {fmtINR(b.amount)}
                        </TableCell>
                        <TableCell className="text-sm">{fmtDate(b.submittedAt)}</TableCell>
                        <TableCell><BidStatusBadge status={b.status} /></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ── Awarded & Completed tab ── */}
        <TabsContent value="awarded">
          <div ref={awardedRef} className="space-y-4">
            {/* Awarded */}
            <Card className="rounded-sm border-border shadow-sm">
              <div className="border-b border-border bg-secondary/50 px-4 py-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Award className="h-4 w-4 text-success" /> Awarded Tenders
                  {!tendersLoading && <span className="text-xs font-normal text-muted-foreground">({awardedTenders.length})</span>}
                </h3>
                {awardedTenders.length > 0 && (
                  <span className="text-xs font-semibold text-success">
                    Total: {fmtINR(awardedValue)}
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30">
                      <TableHead className="pl-4">Tender ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Awarded Value</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tendersLoading ? (
                      <TableSkeleton cols={6} rows={2} />
                    ) : awardedTenders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                          No tenders awarded to you yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      awardedTenders.map((t) => (
                        <TableRow
                          key={t.id}
                          className="border-border/60 cursor-pointer hover:bg-secondary/40 transition-colors"
                          onClick={() => setDetailTenderId(t.id)}
                        >
                          <TableCell className="pl-4 text-sm text-primary">{t.id}</TableCell>
                          <TableCell>
                            <p className="max-w-[240px] truncate text-sm font-medium">{t.name}</p>
                          </TableCell>
                          <TableCell className="text-sm">{t.department}</TableCell>
                          <TableCell className="text-sm font-semibold tabular-nums text-success">{fmtINR(t.estimatedValue)}</TableCell>
                          <TableCell className="text-sm">{fmtDate(t.endDate)}</TableCell>
                          <TableCell>
                            <Badge className="rounded-sm bg-success text-success-foreground text-[11px]">Awarded</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Completed */}
            <Card className="rounded-sm border-border shadow-sm">
              <div className="border-b border-border bg-secondary/50 px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-primary">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> Completed Tenders
                  {!tendersLoading && <span className="text-xs font-normal text-muted-foreground">({completedTenders.length})</span>}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30">
                      <TableHead className="pl-4">Tender ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Closed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tendersLoading ? (
                      <TableSkeleton cols={5} rows={2} />
                    ) : completedTenders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                          No completed tenders yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      completedTenders.map((t) => (
                        <TableRow
                          key={t.id}
                          className="border-border/60 cursor-pointer hover:bg-secondary/40 transition-colors"
                          onClick={() => setDetailTenderId(t.id)}
                        >
                          <TableCell className="pl-4 text-sm text-primary">{t.id}</TableCell>
                          <TableCell>
                            <p className="max-w-[240px] truncate text-sm font-medium">{t.name}</p>
                          </TableCell>
                          <TableCell className="text-sm">{t.department}</TableCell>
                          <TableCell className="text-sm font-semibold tabular-nums">{fmtINR(t.estimatedValue)}</TableCell>
                          <TableCell className="text-sm">
                            <Clock className="mr-1 inline h-3 w-3 text-muted-foreground" />
                            {fmtDate(t.endDate)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
