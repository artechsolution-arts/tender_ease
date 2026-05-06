import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  ShieldCheck,
  Settings,
  Gavel,
  LifeBuoy,
  Landmark,
  Sparkles,
  FileCheck2,
} from "lucide-react";

const main = [
  { title: "Overview",         icon: LayoutDashboard, to: "/" },
  { title: "Live Tenders",     icon: FileText,        to: "/tenders" },
  { title: "Bidders",          icon: Users,           to: "/vendors" },
  { title: "Bid Evaluation",   icon: FileCheck2,      to: "/bid-evaluation" },
  { title: "Awards / LoA",     icon: Gavel,           to: "/awards" },
  { title: "AI Insights",      icon: Sparkles,        to: "/ai-insights" },
  { title: "MIS Reports",      icon: BarChart3,       to: "/reports" },
  { title: "Compliance / CVC", icon: ShieldCheck,     to: "/compliance" },
];

const secondary = [
  { title: "Settings", icon: Settings, to: "/help" },
  { title: "Help",     icon: LifeBuoy, to: "/help" },
];

export function DashboardSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary shadow-elegant ring-1 ring-sidebar-primary-foreground/20">
            <Landmark className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-sidebar-foreground">APe-Procurement</p>
            <p className="text-[11px] text-sidebar-foreground/60">Govt. of Andhra Pradesh</p>
          </div>
        </div>
        <div className="mt-3 h-1 w-full rounded-sm bg-gradient-tricolor" aria-hidden="true" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((item) => {
                const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <Link to={item.to}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.to} className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground">
                    <Link to={item.to}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3 rounded-md bg-sidebar-accent/40 p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-accent text-xs font-semibold text-accent-foreground">
            SR
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-medium text-sidebar-foreground">S. Reddy, IAS</p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">Tender Inviting Authority</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}