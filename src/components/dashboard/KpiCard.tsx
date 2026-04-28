import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  delta: number;
  helper?: string;
  icon: LucideIcon;
  tone?: "primary" | "accent" | "success" | "warning";
}

const toneMap = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
} as const;

const stripeMap = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
} as const;

export function KpiCard({ label, value, delta, helper, icon: Icon, tone = "primary" }: KpiCardProps) {
  const positive = delta >= 0;
  return (
    <Card className="relative overflow-hidden rounded-sm border border-border bg-card p-0 shadow-sm transition hover:shadow-md">
      <div className={cn("absolute left-0 top-0 h-full w-1", stripeMap[tone])} aria-hidden="true" />
      <div className="flex items-start justify-between p-4 pl-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-primary">{value}</p>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-sm px-1.5 py-0.5 font-semibold",
                positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
              )}
            >
              {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {positive ? "+" : ""}
              {delta}%
            </span>
            {helper && <span className="text-muted-foreground">{helper}</span>}
          </div>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-sm", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}