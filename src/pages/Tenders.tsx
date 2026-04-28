import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { TenderStatusBadge } from "@/components/admin/TenderStatusBadge";
import { TenderFormDialog } from "@/components/admin/TenderFormDialog";
import { useAdmin, fmtINR, fmtDate, fmtDateTime, nextStatuses, TENDER_STATUSES, type Tender, type TenderStatus } from "@/store/admin-store";
import { Plus, Search, Pencil, Eye, History, ArrowRight, Trash2, FileText, ShieldCheck, Award } from "lucide-react";
import { toast } from "sonner";

export default function Tenders() {
  const { tenders, vendors, changeStatus, deleteTender } = useAdmin();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenderStatus | "All">("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Tender | undefined>();
  const [viewing, setViewing] = useState<Tender | undefined>();
  const [historyFor, setHistoryFor] = useState<Tender | undefined>();
  const [awardFor, setAwardFor] = useState<Tender | undefined>();
  const [awardVendor, setAwardVendor] = useState<string>("");

  const rows = useMemo(() => {
    return tenders.filter((t) => {
      const q = query.toLowerCase();
      const matchQ = !q || t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.department.toLowerCase().includes(q);
      const matchS = statusFilter === "All" || t.status === statusFilter;
      return matchQ && matchS;
    });
  }, [tenders, query, statusFilter]);

  const handleAdvance = (t: Tender) => {
    const nxt = nextStatuses(t.status);
    if (nxt.length === 0) return;
    if (nxt[0] === "Awarded") { setAwardFor(t); setAwardVendor(t.eligibleVendorIds[0] ?? ""); return; }
    changeStatus(t.id, nxt[0]);
    toast.success(`Status updated → ${nxt[0]}`);
  };

  const confirmAward = () => {
    if (!awardFor || !awardVendor) return;
    changeStatus(awardFor.id, "Awarded", awardVendor);
    toast.success("Letter of Award issued");
    setAwardFor(undefined);
  };

  const vendorName = (id?: string) => vendors.find((v) => v.id === id)?.companyName ?? "—";

  return (
    <AdminLayout
      title="Tender Management"
      breadcrumbs={[{ label: "Home", to: "/" }, { label: "Officer Console", to: "/" }, { label: "Tenders" }]}
      actions={
        <Button size="sm" className="h-8 gap-1.5 rounded-sm bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Create Tender
        </Button>
      }
    >
      <Card className="rounded-sm border-border">
        <div className="flex flex-col gap-3 border-b border-border bg-secondary/40 p-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-primary">All Tenders</h3>
            <span className="text-xs text-muted-foreground">({rows.length} of {tenders.length})</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by ID, name, dept…" className="h-8 pl-8 sm:w-64" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TenderStatus | "All")}>
              <SelectTrigger className="h-8 sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                {TENDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="pl-4">Tender ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Dept.</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Eligible</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id} className="border-border/60">
                  <TableCell className="pl-4 font-mono text-xs">{t.id}</TableCell>
                  <TableCell className="max-w-[260px]">
                    <p className="font-medium text-foreground line-clamp-1">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.category} · v{t.history.length + 1}</p>
                  </TableCell>
                  <TableCell className="text-xs">{t.department}</TableCell>
                  <TableCell className="text-xs tabular-nums">{fmtINR(t.estimatedValue)}</TableCell>
                  <TableCell className="text-xs">{fmtDate(t.endDate)}</TableCell>
                  <TableCell className="text-xs text-center">{t.eligibleVendorIds.length}</TableCell>
                  <TableCell><TenderStatusBadge status={t.status} /></TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="View" onClick={() => setViewing(t)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => setEditing(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Version History" onClick={() => setHistoryFor(t)}><History className="h-3.5 w-3.5" /></Button>
                      {nextStatuses(t.status).length > 0 && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-info" title={`→ ${nextStatuses(t.status)[0]}`} onClick={() => handleAdvance(t)}><ArrowRight className="h-3.5 w-3.5" /></Button>
                      )}
                      {t.status === "Draft" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Delete" onClick={() => { deleteTender(t.id); toast.success("Tender deleted"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">No tenders match your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <TenderFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <TenderFormDialog open={!!editing} onOpenChange={(v) => !v && setEditing(undefined)} tender={editing} />

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(undefined)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><span className="font-mono text-sm text-muted-foreground">{viewing.id}</span> · {viewing.name}</DialogTitle>
                <DialogDescription>
                  <TenderStatusBadge status={viewing.status} /> <span className="ml-2 text-xs">{viewing.department} · {viewing.category}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">{viewing.description}</p>
                <div className="grid grid-cols-2 gap-3 rounded-sm bg-secondary/40 p-3 text-xs">
                  <div><p className="text-muted-foreground">Estimated Value</p><p className="font-bold text-primary">{fmtINR(viewing.estimatedValue)}</p></div>
                  <div><p className="text-muted-foreground">Created</p><p>{fmtDate(viewing.createdAt)}</p></div>
                  <div><p className="text-muted-foreground">Start</p><p>{fmtDate(viewing.startDate)}</p></div>
                  <div><p className="text-muted-foreground">Deadline</p><p>{fmtDate(viewing.endDate)}</p></div>
                  {viewing.awardedVendorId && (
                    <div className="col-span-2 flex items-center gap-2 rounded-sm bg-success/10 p-2"><Award className="h-4 w-4 text-success" /><span className="font-semibold text-success">Awarded to {vendorName(viewing.awardedVendorId)}</span></div>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-primary">Documents</p>
                  <ul className="space-y-1 text-xs">{viewing.documents.map((d) => <li key={d.id} className="rounded-sm bg-secondary/40 px-2 py-1">📎 {d.name} <span className="text-muted-foreground">· {d.size}</span></li>)}</ul>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-primary">Eligible Vendors ({viewing.eligibleVendorIds.length})</p>
                  <ul className="space-y-1 text-xs">{viewing.eligibleVendorIds.map((id) => <li key={id} className="rounded-sm bg-secondary/40 px-2 py-1">🏢 {vendorName(id)} <span className="text-muted-foreground">({id})</span></li>)}</ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* History dialog */}
      <Dialog open={!!historyFor} onOpenChange={(v) => !v && setHistoryFor(undefined)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          {historyFor && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><History className="h-4 w-4" /> Version History · {historyFor.id}</DialogTitle>
                <DialogDescription>{historyFor.history.length} previous version(s) on record. Current is v{historyFor.history.length + 1}.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <div className="rounded-sm border-l-4 border-accent bg-accent/5 p-3">
                  <p className="text-xs font-bold text-accent">CURRENT · v{historyFor.history.length + 1}</p>
                  <p className="text-sm font-medium">{historyFor.name}</p>
                  <p className="text-xs text-muted-foreground">Deadline: {fmtDate(historyFor.endDate)} · Eligible: {historyFor.eligibleVendorIds.length} vendors · Value: {fmtINR(historyFor.estimatedValue)}</p>
                </div>
                {historyFor.history.length === 0 && (
                  <p className="rounded-sm border border-dashed border-border p-6 text-center text-xs text-muted-foreground">No previous versions yet.</p>
                )}
                {historyFor.history.map((v) => (
                  <div key={v.version} className="rounded-sm border border-border bg-card p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-primary">v{v.version}</p>
                      <p className="text-[11px] text-muted-foreground">{fmtDateTime(v.editedAt)} · {v.editedBy}</p>
                    </div>
                    <p className="mt-1 text-xs italic text-muted-foreground">"{v.changes}"</p>
                    <p className="mt-1 text-xs">Snapshot deadline: <span className="font-mono">{fmtDate(v.snapshot.endDate)}</span> · Eligible: {v.snapshot.eligibleVendorIds.length} vendors · Value: {fmtINR(v.snapshot.estimatedValue)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Award dialog */}
      <Dialog open={!!awardFor} onOpenChange={(v) => !v && setAwardFor(undefined)}>
        <DialogContent>
          {awardFor && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Award className="h-4 w-4" /> Award Tender · {awardFor.id}</DialogTitle>
                <DialogDescription>Select the winning vendor. LoA notification will be sent to the winner and acknowledgment to all other eligible bidders.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Winning Vendor</label>
                <Select value={awardVendor} onValueChange={setAwardVendor}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {awardFor.eligibleVendorIds.map((id) => {
                      const v = vendors.find((x) => x.id === id);
                      return <SelectItem key={id} value={id}>{v?.companyName} (Score {v?.pastPerformance})</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
                <div className="rounded-sm border border-info/30 bg-info/5 p-2 text-xs text-info">
                  <ShieldCheck className="mb-0.5 inline h-3 w-3" /> Audit log entry & version snapshot will be recorded.
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAwardFor(undefined)}>Cancel</Button>
                <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={confirmAward}>Issue Letter of Award</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
