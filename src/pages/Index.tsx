import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { VolumeChart } from "@/components/dashboard/VolumeChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { TenderTable } from "@/components/dashboard/TenderTable";
import { DeadlinesPanel } from "@/components/dashboard/DeadlinesPanel";
import { Button } from "@/components/ui/button";
import { FileText, Plus, TrendingUp, Wallet, Users, Sparkles, Phone, Mail, Calendar, Download, Search } from "lucide-react";

const Index = () => {
  useEffect(() => {
    document.title = "APe-Procurement — AI Tender Management Dashboard";
    const meta = document.querySelector('meta[name="description"]') ?? document.head.appendChild(Object.assign(document.createElement("meta"), { name: "description" }));
    meta.setAttribute("content", "AI-powered tender management dashboard for Government of Andhra Pradesh e-Procurement officers — KPIs, bid analytics and live tenders.");
  }, []);

  return (
    <AdminLayout
      title="Tender Management Dashboard"
      breadcrumbs={[{ label: "Home", to: "/" }, { label: "Officer Dashboard" }, { label: "Overview" }]}
      actions={
        <>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-sm border-primary/40 text-xs text-primary hover:bg-secondary">
            <Sparkles className="h-3.5 w-3.5" /> AI Assistant
          </Button>
          <Link to="/tenders">
            <Button size="sm" className="h-8 gap-1.5 rounded-sm bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-3.5 w-3.5" /> Publish New NIT
            </Button>
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-4">
          <div className="overflow-hidden rounded-sm border border-border bg-card shadow-sm">
            <div className="bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground">Quick Search</div>
            <div className="space-y-2 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input placeholder="Tender ID / NIT No." className="h-8 w-full rounded-sm border border-input bg-background pl-7 pr-2 text-xs outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <Link to="/tenders"><Button size="sm" className="h-7 w-full rounded-sm bg-accent text-xs text-accent-foreground hover:bg-accent/90">Search</Button></Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-sm border border-border bg-card shadow-sm">
            <div className="bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground">Tender Categories</div>
            <ul className="divide-y divide-border text-xs">
              {[["Works (Civil)", 86], ["Goods / Supplies", 54], ["Services", 42], ["Consultancy", 23], ["IT / e-Gov", 18], ["Auction / Sale", 9]].map(([label, count]) => (
                <li key={label as string}>
                  <Link to="/tenders" className="flex w-full items-center justify-between px-3 py-2 text-left text-foreground/90 hover:bg-secondary hover:text-primary">
                    <span>{label}</span>
                    <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-semibold text-primary">{count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-sm border border-border bg-card shadow-sm">
            <div className="bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground">Downloads</div>
            <ul className="space-y-1 p-3 text-xs">
              {["NIT Template (Form-I)", "Bid Evaluation Sheet", "CVC Compliance Checklist", "DSC User Manual"].map((d) => (
                <li key={d}><a className="flex items-center gap-1.5 text-info hover:underline"><Download className="h-3 w-3" /> {d}</a></li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-sm border-2 border-accent/60 bg-accent/5 shadow-sm">
            <div className="bg-accent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-accent-foreground">Help Desk</div>
            <div className="space-y-1.5 p-3 text-xs">
              <p className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-accent" /> 1800-3070-2232</p>
              <p className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-accent" /> helpdesk@ap.gov.in</p>
              <p className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-accent" /> Mon-Sat · 9 AM – 6 PM</p>
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          <section aria-labelledby="kpis" className="rounded-sm border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b-2 border-accent bg-secondary/60 px-4 py-2">
              <h2 id="kpis" className="text-xs font-bold uppercase tracking-wide text-primary">Key Indicators · FY 2025-26</h2>
              <span className="text-[10px] text-muted-foreground">Updated 23-Apr-2026 09:42 IST</span>
            </div>
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Live Tenders (NIT)" value="248" delta={8} helper="vs last month" icon={FileText} tone="primary" />
              <KpiCard label="Estimated Value" value="₹ 1,247 Cr" delta={12} helper="EMD secured" icon={Wallet} tone="accent" />
              <KpiCard label="Avg. Bidders / Tender" value="9.4" delta={-3} helper="vs last quarter" icon={Users} tone="warning" />
              <KpiCard label="LoA Issuance Rate" value="73%" delta={5} helper="last 90 days" icon={TrendingUp} tone="success" />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2"><VolumeChart /></div>
            <CategoryChart />
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="xl:col-span-2"><TenderTable /></div>
            <DeadlinesPanel />
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Index;
