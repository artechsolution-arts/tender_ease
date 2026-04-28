import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Mail, CheckCheck, FileText, Award, Edit3, Inbox } from "lucide-react";
import { useAdmin, fmtDateTime, type AppNotification } from "@/store/admin-store";
import { useAuth } from "@/store/auth-store";

const ICON: Record<AppNotification["type"], typeof Bell> = {
  tender_created: FileText,
  tender_updated: Edit3,
  tender_awarded: Award,
  bid_submitted: Inbox,
  info: Bell,
};

const TONE: Record<AppNotification["type"], string> = {
  tender_created: "border-l-info text-info",
  tender_updated: "border-l-warning text-[hsl(38_95%_30%)]",
  tender_awarded: "border-l-success text-success",
  bid_submitted: "border-l-accent text-accent",
  info: "border-l-primary text-primary",
};

export default function Notifications() {
  const { notifications, emails, markAllRead, markRead } = useAdmin();
  const { currentUser } = useAuth();
  const [tab, setTab] = useState<"in_app" | "email">("in_app");
  const visibleNotifications = notifications.filter((n) => {
    if (!currentUser) return false;
    if (n.targetRole && n.targetRole !== "all" && n.targetRole !== currentUser.role) return false;
    if (currentUser.role === "vendor" && n.targetVendorIds?.length) return n.targetVendorIds.includes(currentUser.vendorId ?? "");
    return true;
  });
  const visibleEmails = currentUser?.role === "vendor"
    ? emails.filter((e) => e.to.toLowerCase() === currentUser.email.toLowerCase())
    : emails;
  const isVendor = currentUser?.role === "vendor";

  return (
    <AdminLayout
      title="Notification Center"
      breadcrumbs={[{ label: "Home", to: isVendor ? "/vendor-dashboard" : "/" }, { label: isVendor ? "Vendor Console" : "Officer Console", to: isVendor ? "/vendor-dashboard" : "/" }, { label: "Notifications" }]}
      actions={
        <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-sm" onClick={markAllRead}>
          <CheckCheck className="h-3.5 w-3.5" /> Mark all read
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="rounded-sm border-l-4 border-l-primary p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">In-app Notifications</p>
          <p className="text-2xl font-bold text-primary">{visibleNotifications.length}</p>
          <p className="text-[10px] text-muted-foreground">{visibleNotifications.filter((n) => !n.read).length} unread</p>
        </Card>
        <Card className="rounded-sm border-l-4 border-l-accent p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Emails Dispatched</p>
          <p className="text-2xl font-bold text-accent">{visibleEmails.length}</p>
          <p className="text-[10px] text-muted-foreground">via SMTP simulation</p>
        </Card>
        <Card className="rounded-sm border-l-4 border-l-success p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Triggers Active</p>
          <p className="text-2xl font-bold text-success">4</p>
          <p className="text-[10px] text-muted-foreground">Created · Updated · Bid · Awarded</p>
        </Card>
      </div>

      <Card className="mt-4 rounded-sm border-border">
        <div className="border-b border-border bg-secondary/40 px-3 pt-2">
          <div className="flex gap-0">
            {[
              { key: "in_app", label: "In-App", icon: Bell, count: visibleNotifications.length },
              { key: "email", label: "Email Log", icon: Mail, count: visibleEmails.length },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as "in_app" | "email")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                  tab === t.key ? "border-accent text-primary" : "border-transparent text-muted-foreground hover:text-primary"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" /> {t.label}
                <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] text-primary">{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {tab === "in_app" && (
          <div className="divide-y divide-border">
            {visibleNotifications.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No notifications yet.</p>}
            {visibleNotifications.map((n) => {
              const Icon = ICON[n.type];
              return (
                <div
                  key={n.id}
                  className={`flex cursor-pointer items-start gap-3 border-l-4 px-4 py-3 hover:bg-secondary/30 ${TONE[n.type]} ${n.read ? "opacity-70" : ""}`}
                  onClick={() => markRead(n.id)}
                >
                  <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${n.read ? "font-normal" : "font-bold"} text-foreground`}>{n.title}</p>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-accent" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{fmtDateTime(n.createdAt)}</span>
                      <span>·</span>
                      <span className="rounded-sm bg-secondary px-1.5 py-0.5">Audience: {n.audience}</span>
                      {n.channels.map((c) => (
                        <span key={c} className="rounded-sm bg-secondary px-1.5 py-0.5">{c === "in_app" ? "In-app" : "Email"}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "email" && (
          <div className="divide-y divide-border">
            {visibleEmails.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Mail className="mx-auto mb-2 h-6 w-6 opacity-50" />
                No emails sent yet. Trigger an event (publish a tender, edit one, or award one) to see entries here.
              </div>
            )}
            {visibleEmails.map((e) => (
              <div key={e.id} className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/20">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-info" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{e.subject}</p>
                    <span className="rounded-sm bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase text-success ring-1 ring-success/30">{e.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">To: <span className="font-mono">{e.to}</span></p>
                  <p className="mt-1 text-xs text-foreground/80 line-clamp-2">{e.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{fmtDateTime(e.sentAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-4 rounded-sm border-border">
        <div className="border-b border-border bg-secondary/40 p-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-primary">Trigger Matrix</h3>
        </div>
        <div className="overflow-x-auto p-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2">Event</th>
                <th>Action</th>
                <th>Channels</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td className="py-2 font-semibold">Tender Created / Published</td><td>Notify all eligible vendors</td><td>In-app + Email</td></tr>
              <tr><td className="py-2 font-semibold">Tender Updated</td><td>Notify selected (eligible) vendors</td><td>In-app + Email</td></tr>
              <tr><td className="py-2 font-semibold">Bid Submitted</td><td>Notify admin (TIA)</td><td>In-app</td></tr>
              <tr><td className="py-2 font-semibold">Tender Awarded</td><td>Notify winner (LoA) + losers (acknowledgment)</td><td>In-app + Email</td></tr>
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
