import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, FileText, Users, Sparkles, LayoutDashboard, FileCheck2, Gavel, BarChart3, ShieldCheck, HelpCircle, LogOut, ChevronRight, Mail, Phone, MapPin, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/store/admin-store";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fmtDateTime } from "@/store/admin-store";
import { useAuth, type UserRole } from "@/store/auth-store";

const NAV = [
  { label: "Overview", icon: LayoutDashboard, to: "/", roles: ["admin"] },
  { label: "Tenders", icon: FileText, to: "/tenders", roles: ["admin"] },
  { label: "Vendors", icon: Users, to: "/vendors", roles: ["admin"] },
  { label: "Vendor Dashboard", icon: BriefcaseBusiness, to: "/vendor-dashboard", roles: ["vendor"] },
  { label: "Bid Evaluation", icon: FileCheck2, to: "/bid-evaluation", roles: ["admin"] },
  { label: "Awards / LoA", icon: Gavel, to: "/awards", roles: ["admin"] },
  { label: "AI Insights", icon: Sparkles, to: "/ai-insights", roles: ["admin"] },
  { label: "MIS Reports", icon: BarChart3, to: "/reports", roles: ["admin"] },
  { label: "Notifications", icon: Bell, to: "/notifications", roles: ["admin", "vendor"] },
  { label: "Compliance / CVC", icon: ShieldCheck, to: "/compliance", roles: ["admin"] },
  { label: "Help Desk", icon: HelpCircle, to: "/help", roles: ["admin"] },
];

interface Crumb { label: string; to?: string }

interface Props {
  children: React.ReactNode;
  title: string;
  breadcrumbs: Crumb[];
  actions?: React.ReactNode;
}

export function AdminLayout({ children, title, breadcrumbs, actions }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { notifications, markAllRead, markRead } = useAdmin();
  const { currentUser, logout } = useAuth();
  const navItems = NAV.filter((item) => item.roles.includes((currentUser?.role ?? "admin") as UserRole));
  const visibleNotifications = notifications.filter((n) => {
    if (!currentUser) return false;
    if (n.targetRole && n.targetRole !== "all" && n.targetRole !== currentUser.role) return false;
    if (currentUser.role === "vendor" && n.targetVendorIds?.length) return n.targetVendorIds.includes(currentUser.vendorId ?? "");
    return true;
  });
  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Top utility bar */}
      <div className="flex items-center justify-between gap-4 bg-[hsl(208_82%_18%)] px-4 py-1 text-[11px] text-white/85 md:px-8">
        <div className="flex items-center gap-3">
          <span>भारत सरकार | Government of India</span>
          <span className="text-white/40">|</span>
          <span className="hidden sm:inline">Government of Andhra Pradesh</span>
          <span className="hidden sm:inline text-white/40">|</span>
          <span className="hidden md:inline">Last login: 23-Apr-2026 09:42 IST</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden sm:inline hover:text-accent">Skip to main content</button>
          <span className="hidden sm:inline text-white/40">|</span>
          <button className="hover:text-accent">Sitemap</button>
          <span className="text-white/40">|</span>
          <span className="font-mono">A-&nbsp;A&nbsp;A+</span>
          <span className="text-white/40">|</span>
          <button className="hover:text-accent">हिंदी</button>
          <button className="hover:text-accent">తెలుగు</button>
          <button className="text-accent">English</button>
        </div>
      </div>

      {/* Masthead */}
      <header className="border-b-4 border-accent bg-white">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary ring-2 ring-primary/30">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_Andhra_Pradesh.svg/120px-Emblem_of_Andhra_Pradesh.svg.png"
                alt="Government of Andhra Pradesh emblem"
                className="h-12 w-12 object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">सत्यमेव जयते</p>
              <h1 className="text-lg font-bold leading-tight tracking-tight text-primary md:text-2xl">
                Government of Andhra Pradesh
              </h1>
              <p className="text-xs font-semibold text-accent md:text-sm">e-Procurement Portal · AI Tender Management</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded border border-border bg-secondary/40 px-3 py-1.5 text-right">
              <p className="text-[10px] uppercase text-muted-foreground">Logged in as</p>
              <p className="text-xs font-semibold text-primary">{currentUser?.name ?? "Guest User"}</p>
              <p className="text-[10px] text-muted-foreground">{currentUser?.organization ?? "AP e-Procurement"}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-primary hover:bg-secondary" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <button className="text-[11px] font-normal text-info hover:underline" onClick={markAllRead}>Mark all read</button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  {visibleNotifications.slice(0, 8).map((n) => (
                    <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2" onClick={() => markRead(n.id)}>
                      <div className="flex w-full items-center justify-between">
                        <span className={`text-xs ${n.read ? "font-normal text-muted-foreground" : "font-semibold text-foreground"}`}>{n.title}</span>
                        {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                      </div>
                      <span className="text-[11px] text-muted-foreground line-clamp-2">{n.body}</span>
                      <span className="text-[10px] text-muted-foreground">{fmtDateTime(n.createdAt)}</span>
                    </DropdownMenuItem>
                  ))}
                  {visibleNotifications.length === 0 && (
                    <p className="px-3 py-6 text-center text-xs text-muted-foreground">No notifications</p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/notifications" className="text-xs text-info">View all notifications →</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="text-primary hover:bg-secondary" aria-label="Logout" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Primary nav */}
      <nav className="bg-primary text-primary-foreground shadow-md">
        <ul className="flex gap-0 overflow-x-auto px-2 md:px-6">
          {navItems.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-1.5 whitespace-nowrap border-r border-primary-foreground/15 px-4 py-3 text-xs font-semibold uppercase tracking-wide transition ${
                    active ? "bg-accent text-accent-foreground" : "text-primary-foreground/90 hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Breadcrumb / page title */}
      <div className="flex flex-col gap-2 border-b border-border bg-secondary/50 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="flex items-center text-[11px] text-muted-foreground">
            {breadcrumbs.map((c, i) => (
              <span key={i} className="flex items-center">
                {i > 0 && <ChevronRight className="mx-1 h-3 w-3" />}
                {c.to ? <Link to={c.to} className="hover:text-primary">{c.label}</Link> : <span className="font-semibold text-primary">{c.label}</span>}
              </span>
            ))}
          </p>
          <h2 className="mt-0.5 text-base font-bold text-primary">{title}</h2>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <main className="flex-1 px-4 py-5 md:px-8">{children}</main>

      <footer className="mt-auto border-t-4 border-accent bg-primary text-primary-foreground">
        <div className="grid grid-cols-1 gap-6 px-4 py-6 md:grid-cols-4 md:px-8">
          <div>
            <h3 className="mb-2 text-sm font-semibold">AP e-Procurement</h3>
            <p className="text-xs leading-relaxed text-primary-foreground/75">
              Official portal for tender publishing, bid management and contract awards by the Government of Andhra Pradesh.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-1 text-xs text-primary-foreground/75">
              <li><Link to="/tenders" className="hover:text-accent">Tenders</Link></li>
              <li><Link to="/vendors" className="hover:text-accent">Vendors</Link></li>
              <li><Link to="/notifications" className="hover:text-accent">Notifications</Link></li>
              <li><a className="hover:text-accent">CVC Guidelines</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Help Desk</h3>
            <ul className="space-y-1.5 text-xs text-primary-foreground/75">
              <li className="flex items-center gap-2"><Phone className="h-3 w-3" /> 1800-3070-2232 (Toll Free)</li>
              <li className="flex items-center gap-2"><Mail className="h-3 w-3" /> helpdesk@apeprocurement.gov.in</li>
              <li className="flex items-center gap-2"><MapPin className="h-3 w-3" /> AP Secretariat, Velagapudi</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Compliance</h3>
            <ul className="space-y-1 text-xs text-primary-foreground/75">
              <li>GFR 2017 Compliant</li>
              <li>CVC Guidelines</li>
              <li>IT Act 2000</li>
              <li>RTI Act 2005</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15 bg-[hsl(208_82%_18%)] px-4 py-3 text-center text-[11px] text-primary-foreground/75 md:px-8">
          © {new Date().getFullYear()} Government of Andhra Pradesh · Tender Inviting Authority Console · Version 4.2.1
        </div>
      </footer>
    </div>
  );
}
