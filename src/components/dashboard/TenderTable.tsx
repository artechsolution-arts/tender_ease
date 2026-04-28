import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tenders, type TenderStatus } from "@/data/tenders";
import { StatusBadge } from "./StatusBadge";
import { Search, ArrowUpDown, MoreHorizontal } from "lucide-react";

const statuses: (TenderStatus | "All")[] = ["All", "Open", "Under Review", "Awarded", "Draft", "Closed"];

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function TenderTable() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(TenderStatus | "All")>("All");
  const [sortDesc, setSortDesc] = useState(true);

  const rows = useMemo(() => {
    let r = tenders.filter((t) => {
      const q = query.toLowerCase();
      const matchQ =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.officer.toLowerCase().includes(q);
      const matchS = status === "All" || t.status === status;
      return matchQ && matchS;
    });
    r = [...r].sort((a, b) => (sortDesc ? b.value - a.value : a.value - b.value));
    return r;
  }, [query, status, sortDesc]);

  return (
    <Card className="border-border/60 shadow-elegant">
      <CardHeader className="flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-base font-semibold">Active tenders</CardTitle>
          <p className="text-xs text-muted-foreground">{rows.length} of {tenders.length} shown</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tenders, officer…"
              className="pl-9 sm:w-72"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as TenderStatus | "All")}>
            <SelectTrigger className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Reference</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => setSortDesc((s) => !s)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Value <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-center">Bids</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Officer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id} className="border-border/50">
                  <TableCell className="pl-6 font-mono text-xs text-muted-foreground">{t.id}</TableCell>
                  <TableCell className="max-w-[280px]">
                    <div className="font-medium text-foreground">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.category}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.department}</TableCell>
                  <TableCell className="font-medium tabular-nums">{fmtCurrency(t.value)}</TableCell>
                  <TableCell className="text-center tabular-nums">{t.bids}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(t.deadline)}</TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-foreground/80">{t.officer}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    No tenders match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}