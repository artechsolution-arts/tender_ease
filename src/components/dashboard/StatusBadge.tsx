import { cn } from "@/lib/utils";
import type { TenderStatus } from "@/data/tenders";

const styles: Record<TenderStatus, string> = {
  Open: "bg-info/10 text-info ring-info/20",
  "Under Review": "bg-warning/15 text-warning-foreground/90 ring-warning/30",
  Awarded: "bg-success/10 text-success ring-success/20",
  Closed: "bg-muted text-muted-foreground ring-border",
  Draft: "bg-secondary text-secondary-foreground ring-border",
};

export function StatusBadge({ status }: { status: TenderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}