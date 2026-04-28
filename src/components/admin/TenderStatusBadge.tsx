import { cn } from "@/lib/utils";
import type { TenderStatus } from "@/store/admin-store";

const styles: Record<TenderStatus, string> = {
  Draft: "bg-muted text-muted-foreground ring-border",
  Published: "bg-info/10 text-info ring-info/30",
  Closed: "bg-warning/15 text-[hsl(38_95%_30%)] ring-warning/40",
  Evaluated: "bg-secondary text-primary ring-primary/30",
  Awarded: "bg-success/10 text-success ring-success/30",
};

export function TenderStatusBadge({ status }: { status: TenderStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
      styles[status],
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}
