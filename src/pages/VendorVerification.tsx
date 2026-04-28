import { FormEvent, useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/store/auth-store";
import { useNavigate } from "react-router-dom";
import { Building2, FileCheck2, FileText, CheckCircle2, Factory, Stamp, Landmark, Plus, Trash2, UserCheck, ShieldAlert } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function VendorVerification() {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Full Vendor Verification — AP e-Procurement";
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mocking an async submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // We would ideally update the user's status in the store to "verified" here
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <AdminLayout title="Vendor Profile Verification" breadcrumbs={[{ label: "Vendor Verification" }]}>
        <Card className="flex flex-col items-center justify-center p-12 text-center rounded-sm border-border shadow-sm">
          <CheckCircle2 className="h-16 w-16 text-success mb-4" />
          <h2 className="text-2xl font-bold text-primary">Verification Profile Submitted</h2>
          <p className="mt-2 text-muted-foreground max-w-lg">
            Your full vendor profile has been submitted successfully. The approving authority will review your documents and verify your credentials.
          </p>
          
          <div className="mt-8 w-full max-w-xl border-t border-border pt-8 mb-4">
            <h4 className="text-xs font-bold text-primary mb-6 uppercase tracking-wider">Verification Progress</h4>
            <div className="relative flex justify-between">
              <div className="absolute top-4 left-0 w-full h-0.5 bg-muted -z-0"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-success text-success-foreground flex items-center justify-center mb-2 shadow-sm ring-4 ring-background">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase text-success">Quick Signup</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-success text-success-foreground flex items-center justify-center mb-2 shadow-sm ring-4 ring-background">
                  <UserCheck className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase text-success">Govt Review</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-success text-success-foreground flex items-center justify-center mb-2 shadow-sm ring-4 ring-background">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase text-success">Full Profile</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-2 shadow-sm ring-4 ring-background animate-pulse">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase text-primary">Final Audit</span>
              </div>
            </div>
          </div>

          <Button onClick={() => navigate("/vendor-dashboard")} className="mt-6 rounded-sm bg-accent text-accent-foreground hover:bg-accent/90 px-8">
            Go to Vendor Dashboard
          </Button>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Complete Your Profile"
      breadcrumbs={[{ label: "Vendor Verification" }]}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">Full Vendor Verification</h2>
        <p className="text-muted-foreground text-sm">Please complete all required sections to activate your bidding capabilities.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <Accordion type="single" collapsible defaultValue="company" className="w-full space-y-4">
          
          {/* Company Details */}
          <AccordionItem value="company" className="border rounded-sm bg-card px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Building2 className="h-5 w-5" /> Company Details
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Registration Certificate <span className="text-destructive">*</span></Label>
                  <Input type="file" required />
                </div>
                <div className="space-y-2">
                  <Label>PAN Document <span className="text-destructive">*</span></Label>
                  <Input type="file" required />
                </div>
                <div className="space-y-2">
                  <Label>GST Registration <span className="text-destructive">*</span></Label>
                  <Input type="file" required />
                </div>
                <div className="space-y-2">
                  <Label>CIN / LLPIN (if applicable)</Label>
                  <Input placeholder="Enter CIN or LLPIN" />
                </div>
                <div className="space-y-2">
                  <Label>Year Established <span className="text-destructive">*</span></Label>
                  <Input type="number" required placeholder="YYYY" min="1900" max="2026" />
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="font-semibold text-sm">Address Details</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Registered Office Address <span className="text-destructive">*</span></Label>
                    <Textarea required placeholder="Full registered address" className="min-h-[80px]" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Branch Office Address</Label>
                    <Textarea placeholder="Full branch address (if any)" className="min-h-[80px]" />
                  </div>
                  <div className="space-y-2">
                    <Label>District / State <span className="text-destructive">*</span></Label>
                    <Input required placeholder="District, State" />
                  </div>
                  <div className="space-y-2">
                    <Label>PIN Code <span className="text-destructive">*</span></Label>
                    <Input required placeholder="6-digit PIN" />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Financials */}
          <AccordionItem value="financial" className="border rounded-sm bg-card px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Landmark className="h-5 w-5" /> Financial Details
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Annual Turnover (Last 3 Years avg in INR) <span className="text-destructive">*</span></Label>
                  <Input type="number" required placeholder="e.g. 5000000" />
                </div>
                <div className="space-y-2">
                  <Label>Cancelled Cheque <span className="text-destructive">*</span></Label>
                  <Input type="file" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <h4 className="font-semibold text-sm mb-2 mt-2">Bank Details</h4>
                </div>
                <div className="space-y-2">
                  <Label>Bank Name <span className="text-destructive">*</span></Label>
                  <Input required placeholder="Enter bank name" />
                </div>
                <div className="space-y-2">
                  <Label>Account Number <span className="text-destructive">*</span></Label>
                  <Input required placeholder="Enter account number" />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code <span className="text-destructive">*</span></Label>
                  <Input required placeholder="Enter IFSC code" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Capability */}
          <AccordionItem value="capability" className="border rounded-sm bg-card px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Factory className="h-5 w-5" /> Capability & Experience
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Work Categories <span className="text-destructive">*</span></Label>
                  <Input required placeholder="e.g. Civil Construction, IT Services" />
                </div>
                <div className="space-y-2">
                  <Label>Experience Years <span className="text-destructive">*</span></Label>
                  <Input type="number" required placeholder="Years of experience" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Machinery / Manpower Details</Label>
                  <Textarea placeholder="Briefly describe your equipment and manpower strength" className="min-h-[80px]" />
                </div>
                <div className=" अंतरिक्ष-y-2 md:col-span-2">
                  <Label>Previous Projects Synopsis <span className="text-destructive">*</span></Label>
                  <Textarea required placeholder="List 2-3 major completed projects" className="min-h-[100px]" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Documents */}
          <AccordionItem value="documents" className="border rounded-sm bg-card px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <FileText className="h-5 w-5" /> Supporting Documents
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>MSME Certificate (if applicable)</Label>
                  <Input type="file" />
                </div>
                <div className="space-y-2">
                  <Label>ISO Certificates (if applicable)</Label>
                  <Input type="file" />
                </div>
                <div className="space-y-2">
                  <Label>Experience Certificates <span className="text-destructive">*</span></Label>
                  <Input type="file" required />
                </div>
                <div className="space-y-2">
                  <Label>Tax Returns (Last 3 Years) <span className="text-destructive">*</span></Label>
                  <Input type="file" required />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Authorized Signatory */}
          <AccordionItem value="signatory" className="border rounded-sm bg-card px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Stamp className="h-5 w-5" /> Authorized Signatory
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Aadhaar / ID Proof <span className="text-destructive">*</span></Label>
                  <Input type="file" required />
                </div>
                <div className="space-y-2">
                  <Label>Authorization Letter <span className="text-destructive">*</span></Label>
                  <Input type="file" required />
                  <p className="text-[10px] text-muted-foreground mt-1">Letter authorizing the signatory, signed by directors/partners.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
        </Accordion>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={() => navigate("/vendor-dashboard")}>Save Draft</Button>
          <Button type="submit" disabled={isSubmitting} className="rounded-sm bg-accent text-accent-foreground hover:bg-accent/90 min-w-[150px]">
            {isSubmitting ? "Submitting..." : "Submit Profile for Verification"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
