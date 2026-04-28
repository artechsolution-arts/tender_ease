import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDate, fmtINR, useAdmin } from "@/store/admin-store";
import { useAuth } from "@/store/auth-store";
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, Download, FileCheck2, FileText, Send, ShieldCheck, TrendingUp, Wallet, ArrowRight, UserCheck, ShieldAlert } from "lucide-react";

const bidRows = [
  { tenderId: "TND-2025-041", bidValue: 238400000, status: "Submitted", submittedOn: "2026-04-19", rank: "L2", techScore: 88 },
  { tenderId: "TND-2025-044", bidValue: 84200000, status: "Awarded", submittedOn: "2026-04-02", rank: "L1", techScore: 94 },
  { tenderId: "TND-2025-043", bidValue: 0, status: "Not Participated", submittedOn: "-", rank: "-", techScore: 0 },
];



export default function VendorDashboard() {
  const { vendors, tenders } = useAdmin();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const mockVendor = { id: currentUser?.vendorId || "VEN-MOCK", companyName: currentUser?.organization || "Mock Vendor", contactPerson: currentUser?.name || "-", category: "Services", registeredOn: "2026-04-27", pastPerformance: 100, completedTenders: 5 };
  const vendor = vendors.find((v) => v.id === currentUser?.vendorId) ?? mockVendor;

  useEffect(() => {
    document.title = "Vendor Dashboard — AP e-Procurement";
  }, []);

  const eligibleTenders = useMemo(
    () => tenders.filter((t) => t.eligibleVendorIds.includes(vendor.id)),
    [tenders, vendor.id],
  );
  const activeTenders = eligibleTenders.filter((t) => t.status === "Published" || t.status === "Draft");
  const awardedTenders = tenders.filter((t) => t.awardedVendorId === vendor.id);
  const awardedValue = awardedTenders.reduce((sum, t) => sum + t.estimatedValue, 0);

  const documents = useMemo(() => {
    const step = currentUser?.verificationStep || 5;
    
    if (step === 2) {
      return [
        { name: "PAN Card", status: "Pending Review", validTill: "—" },
        { name: "GST Registration", status: "Pending Review", validTill: "—" },
        { name: "Business License", status: "Pending Review", validTill: "—" },
        { name: "Identity Proof", status: "Verified", validTill: "Permanent" },
      ];
    }
    
    if (step === 3) {
      return [
        { name: "PAN Card", status: "Verified", validTill: "Permanent" },
        { name: "GST Registration", status: "Verified", validTill: "31-Mar-2027" },
        { name: "Financial Audits", status: "Pending Review", validTill: "—" },
        { name: "Work Certificates", status: "Pending Review", validTill: "—" },
      ];
    }
    
    return [
      { name: "PAN Card", status: "Verified", validTill: "Permanent" },
      { name: "GST Registration", status: "Verified", validTill: "31-Mar-2027" },
      { name: "Class III DSC", status: "Expiring Soon", validTill: "18-May-2026" },
      { name: "Solvency Certificate", status: "Verified", validTill: "30-Sep-2026" },
    ];
  }, [currentUser?.verificationStep]);

  return (
    <AdminLayout
      title="Vendor Dashboard"
      breadcrumbs={[{ label: "Home", to: "/" }, { label: "Vendor Console" }, { label: vendor.companyName }]}
      actions={
        currentUser?.isVerificationPending ? null : (
          <>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-sm border-primary/40 text-xs text-primary hover:bg-secondary">
              <Download className="h-3.5 w-3.5" /> Download Profile
            </Button>
            <Button size="sm" className="h-8 gap-1.5 rounded-sm bg-accent text-xs text-accent-foreground hover:bg-accent/90">
              <Send className="h-3.5 w-3.5" /> Submit Bid
            </Button>
          </>
        )
      }
    >
      <Card className="mb-6 rounded-sm border border-border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-primary">Registration Tracking</h3>
          <p className="text-sm text-muted-foreground">Monitor your onboarding progress with the AP e-Procurement portal.</p>
        </div>
        
        <div className="relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-muted -z-0"></div>
          
          <div className="relative z-10 flex justify-between">
            <div className="flex flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 shadow-sm ring-4 ring-background ${(currentUser?.verificationStep || 5) >= 1 ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-bold uppercase ${(currentUser?.verificationStep || 5) >= 1 ? 'text-success' : 'text-muted-foreground'}`}>Quick Signup</span>
            </div>

            <div className="flex flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 shadow-sm ring-4 ring-background ${(currentUser?.verificationStep || 5) >= 2 ? (currentUser?.verificationStep === 2 ? 'bg-warning text-warning-foreground animate-pulse' : 'bg-success text-success-foreground') : 'bg-muted text-muted-foreground'}`}>
                <UserCheck className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-bold uppercase ${(currentUser?.verificationStep || 5) >= 2 ? (currentUser?.verificationStep === 2 ? 'text-warning' : 'text-success') : 'text-muted-foreground'}`}>Govt Review</span>
            </div>

            <div className="flex flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 shadow-sm ring-4 ring-background ${(currentUser?.verificationStep || 5) >= 3 ? (currentUser?.verificationStep === 3 ? 'bg-warning text-warning-foreground animate-pulse' : 'bg-success text-success-foreground') : 'bg-muted text-muted-foreground'}`}>
                <FileText className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-bold uppercase ${(currentUser?.verificationStep || 5) >= 3 ? (currentUser?.verificationStep === 3 ? 'text-warning' : 'text-success') : 'text-muted-foreground'}`}>Full Profile</span>
            </div>

            <div className="flex flex-col items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 shadow-sm ring-4 ring-background ${(currentUser?.verificationStep || 5) >= 4 ? (currentUser?.verificationStep === 4 ? 'bg-warning text-warning-foreground animate-pulse' : 'bg-success text-success-foreground') : 'bg-muted text-muted-foreground'}`}>
                <ShieldAlert className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-bold uppercase ${(currentUser?.verificationStep || 5) >= 4 ? (currentUser?.verificationStep === 4 ? 'text-warning' : 'text-success') : 'text-muted-foreground'}`}>Final Audit</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 rounded-sm bg-primary/5 p-4 border border-primary/20">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
            {currentUser?.verificationStep === 5 ? <ShieldCheck className="h-6 w-6" /> : <Clock className="h-6 w-6 animate-pulse" />}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-bold text-primary">
              {currentUser?.verificationStep === 2 && "Step 2: Awaiting Government Preliminary Review"}
              {currentUser?.verificationStep === 3 && "Step 3: Action Required — Complete Full Profile"}
              {currentUser?.verificationStep === 4 && "Step 4: Final Compliance Audit in Progress"}
              {(currentUser?.verificationStep || 5) === 5 && "Account Fully Verified & Active"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentUser?.verificationStep === 2 && "A nodal officer will review your basic details. Estimated time: 24-48 hours."}
              {currentUser?.verificationStep === 3 && "Your preliminary review is successful! Please click 'Complete Profile' below to upload your certificates."}
              {currentUser?.verificationStep === 4 && "We are performing the final security checks and audit on your uploaded documents."}
              {(currentUser?.verificationStep || 5) === 5 && "Congratulations! You are now eligible to participate in all live tenders on the portal."}
            </p>
          </div>
          {currentUser?.verificationStep === 3 && (
            <Button size="sm" className="rounded-sm bg-accent text-accent-foreground hover:bg-accent/90 shrink-0" onClick={() => navigate("/vendor-verification")}>
              Complete Profile <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </Card>

      {/* Required Actions Section */}
      {currentUser?.isVerificationPending && currentUser?.verificationStep === 3 && (
        <Card className="mb-6 rounded-sm border-l-4 border-l-warning bg-warning/5 p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-warning-foreground uppercase tracking-tight">Immediate Action Required</h4>
              <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
                To move to the next stage of verification, you must provide your **Financial Audit Reports (Last 3 Years)** and **Class III Digital Signature Certificate (DSC)**. 
              </p>
              <div className="mt-4 flex gap-3">
                <Button variant="outline" size="sm" className="h-8 rounded-sm border-warning/30 text-xs text-warning-foreground hover:bg-warning/10" onClick={() => navigate("/vendor-verification")}>
                  Upload Documents
                </Button>
                <Button variant="ghost" size="sm" className="h-8 rounded-sm text-xs text-muted-foreground">
                  View Guidelines
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}


      {!currentUser?.isVerificationPending && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <Card className="rounded-sm border-border p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary text-sm font-bold text-primary-foreground">
                {vendor.companyName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-primary">{vendor.companyName}</h3>
                <p className="text-xs text-muted-foreground">{vendor.id}</p>
                <Badge className="mt-2 rounded-sm bg-success text-success-foreground">Active Vendor</Badge>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
              <p className="flex justify-between"><span className="text-muted-foreground">Contact</span><span className="font-medium">{vendor.contactPerson}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium">{vendor.category}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Registered</span><span className="font-medium">{fmtDate(vendor.registeredOn)}</span></p>
            </div>
          </Card>

          <Card className="rounded-sm border-border p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-primary">Compliance Health</h3>
            </div>
            <Progress value={vendor.pastPerformance} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">Performance score <span className="font-bold text-primary">{vendor.pastPerformance}/100</span></p>
            <div className="mt-3 rounded-sm bg-warning/10 p-2 text-xs text-warning">
              DSC renewal due within 30 days.
            </div>
          </Card>
        </aside>

        <div className="space-y-5">
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-sm border-l-4 border-l-primary p-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Eligible Tenders</p><p className="text-2xl font-bold text-primary">{eligibleTenders.length}</p><p className="text-xs text-muted-foreground">Matched to category</p></Card>
            <Card className="rounded-sm border-l-4 border-l-warning p-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Active Opportunities</p><p className="text-2xl font-bold text-warning">{activeTenders.length}</p><p className="text-xs text-muted-foreground">Open / upcoming</p></Card>
            <Card className="rounded-sm border-l-4 border-l-success p-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Awards Won</p><p className="text-2xl font-bold text-success">{awardedTenders.length}</p><p className="text-xs text-muted-foreground">Total value {fmtINR(awardedValue)}</p></Card>
            <Card className="rounded-sm border-l-4 border-l-accent p-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Completed Tenders</p><p className="text-2xl font-bold text-accent">{vendor.completedTenders}</p><p className="text-xs text-muted-foreground">Past performance record</p></Card>
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <Card className="rounded-sm border-border shadow-sm xl:col-span-2">
              <div className="border-b border-border bg-secondary/50 px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-primary"><FileText className="h-4 w-4" /> Eligible Tender Opportunities</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow className="bg-secondary/30"><TableHead>NIT</TableHead><TableHead>Department</TableHead><TableHead>Value</TableHead><TableHead>Deadline</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {eligibleTenders.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell><p className="font-mono text-xs text-primary">{t.id}</p><p className="max-w-72 truncate text-xs font-medium">{t.name}</p></TableCell>
                        <TableCell className="text-xs">{t.department}</TableCell>
                        <TableCell className="text-xs font-semibold">{fmtINR(t.estimatedValue)}</TableCell>
                        <TableCell className="text-xs"><CalendarClock className="mr-1 inline h-3 w-3 text-warning" />{fmtDate(t.endDate)}</TableCell>
                        <TableCell><Badge variant="outline" className="rounded-sm text-[11px]">{t.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <Card className="rounded-sm border-border shadow-sm">
              <div className="border-b border-border bg-secondary/50 px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-primary"><FileCheck2 className="h-4 w-4" /> Document Checklist</h3>
              </div>
              <div className="divide-y divide-border">
                {documents.map((d) => (
                  <div key={d.name} className="flex items-center justify-between gap-3 p-3 text-xs">
                    <div><p className="font-semibold text-foreground">{d.name}</p><p className="text-muted-foreground">Valid till {d.validTill}</p></div>
                    {d.status === "Verified" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-warning" />}
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <Card className="rounded-sm border-border shadow-sm">
            <div className="border-b border-border bg-secondary/50 px-4 py-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-primary"><TrendingUp className="h-4 w-4" /> Bid Activity</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-secondary/30"><TableHead>Tender ID</TableHead><TableHead>Bid Value</TableHead><TableHead>Submitted On</TableHead><TableHead>Tech Score</TableHead><TableHead>Rank</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {bidRows.map((b) => (
                    <TableRow key={b.tenderId}>
                      <TableCell className="font-mono text-xs">{b.tenderId}</TableCell>
                      <TableCell className="text-xs font-semibold"><Wallet className="mr-1 inline h-3 w-3 text-accent" />{b.bidValue ? fmtINR(b.bidValue) : "—"}</TableCell>
                      <TableCell className="text-xs">{b.submittedOn === "-" ? "—" : fmtDate(b.submittedOn)}</TableCell>
                      <TableCell className="text-xs">{b.techScore || "—"}</TableCell>
                      <TableCell className="text-xs font-bold text-primary">{b.rank}</TableCell>
                      <TableCell><Badge className={`rounded-sm text-[11px] ${b.status === "Awarded" ? "bg-success text-success-foreground" : b.status === "Submitted" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{b.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
      )}
    </AdminLayout>
  );
}