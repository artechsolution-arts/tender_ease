import { useState } from "react";
import { FileText, Upload, Search, Filter, RefreshCw, ShieldAlert, Clock, CheckCircle2, XCircle, Building2, Brain } from "lucide-react";
import { useT } from "@/lib/useT";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import { ValidationResult } from "@/components/documents/ValidationResult";
import { OfficerReviewPanel } from "@/components/documents/OfficerReviewPanel";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/store/auth-store";
import { DOC_TYPE_LABELS, RATING_CONFIG, STATUS_CONFIG, type ValidationStatus, type VendorDocument } from "@/types/documents";

function ocrBadge(status: string) {
  if (status === "COMPLETED") return null;
  if (status === "PROCESSING") return (
    <span className="flex items-center gap-1 text-xs text-info bg-info/10 px-2 py-0.5 rounded-sm">
      <Brain className="h-3 w-3 animate-pulse" /> OCR running
    </span>
  );
  if (status === "FAILED") return (
    <span className="text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-sm">OCR failed</span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm">
      <Clock className="h-3 w-3" /> Queued
    </span>
  );
}

function ScorePill({ score, rating }: { score: number; rating: string }) {
  const cfg = RATING_CONFIG[rating as keyof typeof RATING_CONFIG];
  if (!cfg) return null;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-sm border ${cfg.bg} ${cfg.color}`}>
      {score} · {cfg.label}
    </span>
  );
}

function StatusIcon({ status }: { status: ValidationStatus }) {
  if (status === "OFFICER_APPROVED") return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (status === "OFFICER_REJECTED") return <XCircle className="h-4 w-4 text-destructive" />;
  return null;
}

export default function Documents() {
  const { currentUser } = useAuth();
  const T = useT();
  const isAdmin = currentUser?.role === "admin";

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<VendorDocument | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Always fetch all docs — filter client-side so stat counts stay accurate
  const { data, isLoading, isFetching, refetch } = useDocuments({});
  const allDocs: VendorDocument[] = data?.docs ?? [];

  // Stats always from full dataset
  const stats = {
    total:      allDocs.length,
    aiReviewed: allDocs.filter((d) => d.validation?.status === "AI_REVIEWED").length,
    approved:   allDocs.filter((d) => d.validation?.status === "OFFICER_APPROVED").length,
    flagged:    allDocs.filter((d) => d.validation?.aiFlagged).length,
  };

  // Client-side filtering
  const docs = allDocs.filter((d) => {
    if (statusFilter !== "ALL" && d.validation?.status !== statusFilter) return false;
    if (flaggedOnly && !d.validation?.aiFlagged) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!d.originalName.toLowerCase().includes(q) && !d.docType.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  function handleCardClick(label: string) {
    if (activeCard === label) {
      setStatusFilter("ALL");
      setFlaggedOnly(false);
      setActiveCard(null);
      return;
    }
    setActiveCard(label);
    if (label === "Total")       { setStatusFilter("ALL");              setFlaggedOnly(false); }
    if (label === "AI Reviewed") { setStatusFilter("AI_REVIEWED");      setFlaggedOnly(false); }
    if (label === "Approved")    { setStatusFilter("OFFICER_APPROVED"); setFlaggedOnly(false); }
    if (label === "Flagged")     { setStatusFilter("ALL");              setFlaggedOnly(true);  }
  }

  function handleDropdownChange(val: string) {
    setStatusFilter(val);
    setFlaggedOnly(false);
    // Sync active card highlight to match dropdown
    if (val === "ALL")              setActiveCard(null);
    else if (val === "AI_REVIEWED") setActiveCard("AI Reviewed");
    else if (val === "OFFICER_APPROVED") setActiveCard("Approved");
    else setActiveCard(null);
  }

  const kpiCards = [
    { label: "Total",       value: stats.total,      border: "border-l-primary",     text: "text-primary",     bg: "bg-primary/5",     ring: "border-primary"     },
    { label: "AI Reviewed", value: stats.aiReviewed, border: "border-l-info",        text: "text-info",        bg: "bg-info/5",        ring: "border-info"        },
    { label: "Approved",    value: stats.approved,   border: "border-l-success",     text: "text-success",     bg: "bg-success/5",     ring: "border-success"     },
    { label: "Flagged",     value: stats.flagged,    border: "border-l-destructive", text: "text-destructive", bg: "bg-destructive/5", ring: "border-destructive" },
  ];

  const actions = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-sm text-xs" disabled={isFetching} onClick={() => refetch()}>
        <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
      </Button>
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 gap-1.5 rounded-sm bg-accent text-xs text-accent-foreground hover:bg-accent/90">
            <Upload className="h-3.5 w-3.5" /> Upload Document
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document for AI Validation</DialogTitle>
          </DialogHeader>
          <DocumentUpload onSuccess={() => { setUploadOpen(false); refetch(); }} />
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <AdminLayout
      title={T("docs_title")}
      breadcrumbs={[{ label: T("common_home"), to: isAdmin ? "/" : "/vendor-dashboard" }, { label: T("docs_title") }]}
      actions={actions}
    >
      <div className="space-y-5">

        {/* KPI cards — admin only */}
        {isAdmin && data && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {kpiCards.map((k) => {
              const isActive = activeCard === k.label;
              return (
                <Card
                  key={k.label}
                  onClick={() => handleCardClick(k.label)}
                  className={`border-l-4 ${k.border} cursor-pointer transition-all hover:shadow-md p-4 ${isActive ? `${k.bg} border ${k.ring}` : ""}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</p>
                  <p className={`mt-1 text-2xl font-bold ${k.text}`}>{k.value}</p>
                  <p className={`mt-1 text-xs font-semibold uppercase tracking-wide ${isActive ? k.text : "text-muted-foreground"}`}>
                    {isActive ? "▶ Filtering" : "→ Filter"}
                  </p>
                </Card>
              );
            })}
          </div>
        )}

        {/* Search + status filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by file name or type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-sm text-xs"
            />
          </div>
          {isAdmin && (
            <Select value={statusFilter} onValueChange={handleDropdownChange}>
              <SelectTrigger className="w-52 h-9 rounded-sm text-xs">
                <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {(Object.entries(STATUS_CONFIG) as [ValidationStatus, { label: string; color: string }][]).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Active filter indicator */}
        {(activeCard && activeCard !== "Total") || flaggedOnly ? (
          <div className="flex items-center gap-2 rounded-sm border border-dashed border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Showing: <strong className="text-foreground">{flaggedOnly ? "Flagged" : activeCard}</strong> documents
            <span className="text-muted-foreground">({docs.length} result{docs.length !== 1 ? "s" : ""})</span>
            <button onClick={() => { setStatusFilter("ALL"); setFlaggedOnly(false); setActiveCard(null); }} className="ml-auto text-muted-foreground hover:text-destructive">
              <XCircle className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        {/* Document list */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading documents…
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No documents found.</p>
            {activeCard || flaggedOnly ? (
              <Button variant="outline" size="sm" className="rounded-sm text-xs" onClick={() => { setStatusFilter("ALL"); setFlaggedOnly(false); setActiveCard(null); }}>
                Clear filter
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="rounded-sm text-xs" onClick={() => setUploadOpen(true)}>
                <Upload className="h-3.5 w-3.5 mr-1" /> Upload your first document
              </Button>
            )}
          </div>
        ) : (
          <Card className="rounded-sm border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/30 border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="text-left px-4 py-2.5">File</th>
                  {isAdmin && <th className="text-left px-4 py-2.5">Vendor / Uploader</th>}
                  <th className="text-left px-4 py-2.5">Type</th>
                  <th className="text-left px-4 py-2.5">AI Score</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="text-left px-4 py-2.5">Uploaded</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-secondary/40 transition-colors cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {doc.validation?.aiFlagged && <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />}
                        <div>
                          <p className="font-medium text-foreground max-w-[200px] truncate">{doc.originalName}</p>
                          <p className="text-xs text-muted-foreground">{(doc.fileSize / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        {doc.uploader ? (
                          <div className="flex items-start gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-primary/60 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{doc.uploader.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.uploader.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-muted-foreground">{DOC_TYPE_LABELS[doc.docType] || doc.docType}</td>
                    <td className="px-4 py-3">
                      {doc.validation ? (
                        <ScorePill score={doc.validation.aiScore} rating={doc.validation.aiRating} />
                      ) : (
                        ocrBadge(doc.ocrStatus)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {doc.validation && <StatusIcon status={doc.validation.status} />}
                        <span className={`font-medium ${doc.validation ? STATUS_CONFIG[doc.validation.status]?.color : "text-muted-foreground"}`}>
                          {doc.validation ? STATUS_CONFIG[doc.validation.status]?.label : "Processing"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-sm px-3 text-[11px]"
                        onClick={() => setSelectedDoc(doc)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Detail sheet */}
        <Sheet open={!!selectedDoc} onOpenChange={(o) => !o && setSelectedDoc(null)}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            {selectedDoc && (
              <>
                <SheetHeader className="mb-4">
                  <SheetTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-5 w-5 text-primary" />
                    {selectedDoc.originalName}
                  </SheetTitle>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{DOC_TYPE_LABELS[selectedDoc.docType]}</span>
                    <span>·</span>
                    <span>{(selectedDoc.fileSize / 1024).toFixed(0)} KB</span>
                    {selectedDoc.uploader && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {selectedDoc.uploader.name}
                        </span>
                      </>
                    )}
                  </div>
                </SheetHeader>

                <DocumentPreview doc={selectedDoc} />
                <Separator className="my-4" />
                <ValidationResult doc={selectedDoc} showRetry={isAdmin} />

                {isAdmin && selectedDoc.validation && (
                  <>
                    <Separator className="my-4" />
                    <OfficerReviewPanel doc={selectedDoc} onDone={() => setSelectedDoc(null)} />
                  </>
                )}

                {selectedDoc.ocrText && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">OCR Extracted Text</p>
                      <pre className="text-xs text-muted-foreground bg-secondary/40 rounded-sm p-3 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
                        {selectedDoc.ocrText}
                      </pre>
                    </div>
                  </>
                )}
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AdminLayout>
  );
}
