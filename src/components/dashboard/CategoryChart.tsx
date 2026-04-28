import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { categoryBreakdown } from "@/data/tenders";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--info))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
];

export function CategoryChart() {
  const total = categoryBreakdown.reduce((s, c) => s + c.value, 0);
  return (
    <Card className="border-border/60 shadow-elegant">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">By category</CardTitle>
        <p className="text-xs text-muted-foreground">Distribution of active tenders</p>
      </CardHeader>
      <CardContent>
        <div className="relative h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Pie
                data={categoryBreakdown}
                dataKey="value"
                innerRadius={56}
                outerRadius={84}
                paddingAngle={2}
                stroke="none"
              >
                {categoryBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight">{total}</span>
            <span className="text-xs text-muted-foreground">total active</span>
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          {categoryBreakdown.map((c, i) => (
            <li key={c.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-foreground/80">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
                {c.name}
              </span>
              <span className="font-medium tabular-nums text-muted-foreground">{c.value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}