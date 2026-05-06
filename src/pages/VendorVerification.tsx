import { FormEvent, useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/store/auth-store";
import { useNavigate } from "react-router-dom";
import {
  Building2, FileCheck2, FileText, CheckCircle2, Factory,
  Stamp, Landmark, UserCheck, ShieldAlert, Brain,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import type { DocType } from "@/types/documents";

// ── Small wrapper: doc upload card with label and preset type ────────────────
function DocUploadField({
  label, docType, required, vendorId, hint,
}: {
  label: string; docType: DocType; required?: boolean; vendorId?: string; hint?: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <div className="space-y-1.5 rounded-sm border border-border bg-card p-3">
      <p className="text-xs font-semibold text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
        {done && <span className="ml-2 text-[10px] font-bold text-success">✓ Uploaded & OCR queued</span>}
      </p>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      {!done ? (
        <DocumentUpload
          vendorId={vendorId}
          initialDocType={docType}
          onSuccess={() => setDone(true)}
        />
      ) : (
        <div className="flex items-center gap-2 rounded-sm bg-success/10 px-3 py-2 text-xs text-success">
          <Brain className="h-4 w-4 animate-pulse" />
          AI OCR is running in the background. Results will appear in My Documents.
        </div>
      )}
    </div>
  );
}

export default function VendorVerification() {
  const { currentUser, submitVerification } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const vendorId = currentUser?.vendorId ?? "";

  useEffect(() => {
    document.title = "Full Vendor Verification — AP e-Procurement";
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      submitVerification();
      setIsSubmitting(false);
      setIsSubmitted(true);
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
              <div className="absolute top-4 left-0 w-full h-0.5 bg-muted -z-0" />
              {[
                { icon: <CheckCircle2 className="h-4 w-4" />, label: "Quick Signup",  done: true },
                { icon: <UserCheck className="h-4 w-4" />,    label: "Govt Review",   done: true },
                { icon: <FileText className="h-4 w-4" />,     label: "Full Profile",  done: true },
                { icon: <ShieldAlert className="h-4 w-4" />,  label: "Final Audit",   done: false },
              ].map(({ icon, label, done }, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-2 shadow-sm ring-4 ring-background ${done ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground animate-pulse"}`}>
                    {icon}
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${done ? "text-success" : "text-primary"}`}>{label}</span>
                </div>
              ))}
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
        <p className="text-muted-foreground text-sm">
          Complete all sections and upload required documents. Each uploaded file goes through AI-powered OCR validation automatically.
        </p>
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
                <DocUploadField
                  label="Registration Certificate"
                  docType="COMPANY_REGISTRATION"
                  required
                  vendorId={vendorId}
                  hint="Upload PDF/JPG — AI will extract company name, CIN, date of incorporation"
                />
                <DocUploadField
                  label="PAN Card"
                  docType="PAN_CARD"
                  required
                  vendorId={vendorId}
                  hint="Upload PDF/JPG — AI will read PAN number and name"
                />
                <DocUploadField
                  label="GST Registration Certificate"
                  docType="GST_CERTIFICATE"
                  required
                  vendorId={vendorId}
                  hint="Upload PDF — AI will verify GSTIN, trade name, jurisdiction"
                />
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
                <DocUploadField
                  label="Cancelled Cheque"
                  docType="FINANCIAL_STATEMENT"
                  required
                  vendorId={vendorId}
                  hint="Upload JPG/PDF — AI will extract bank account and IFSC"
                />
                <DocUploadField
                  label="Audited Financial Statements (Last 3 Years)"
                  docType="FINANCIAL_STATEMENT"
                  required
                  vendorId={vendorId}
                  hint="Upload CA-certified balance sheet PDF — AI validates turnover figures"
                />
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
                <div className="space-y-2 md:col-span-2">
                  <Label>Previous Projects Synopsis <span className="text-destructive">*</span></Label>
                  <Textarea required placeholder="List 2-3 major completed projects" className="min-h-[100px]" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Supporting Documents */}
          <AccordionItem value="documents" className="border rounded-sm bg-card px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <FileText className="h-5 w-5" /> Supporting Documents
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <DocUploadField
                  label="MSME Certificate (if applicable)"
                  docType="OTHER"
                  vendorId={vendorId}
                  hint="Upload PDF — AI will verify MSME registration number and category"
                />
                <DocUploadField
                  label="ISO / Quality Certificates"
                  docType="OTHER"
                  vendorId={vendorId}
                  hint="Upload PDF — AI will read certifying body, scope, and validity"
                />
                <DocUploadField
                  label="Experience Certificates"
                  docType="EXPERIENCE_CERTIFICATE"
                  required
                  vendorId={vendorId}
                  hint="Upload PDF — AI extracts client name, project value, completion date"
                />
                <DocUploadField
                  label="Tax Returns (Last 3 Years)"
                  docType="FINANCIAL_STATEMENT"
                  required
                  vendorId={vendorId}
                  hint="Upload ITR PDF — AI cross-checks declared turnover"
                />
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
                <DocUploadField
                  label="Aadhaar / ID Proof"
                  docType="OTHER"
                  required
                  vendorId={vendorId}
                  hint="Upload masked Aadhaar or passport — AI verifies identity fields"
                />
                <DocUploadField
                  label="Authorization Letter"
                  docType="OTHER"
                  required
                  vendorId={vendorId}
                  hint="Letter authorizing the signatory, signed by directors/partners"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* OCR info banner */}
        <Card className="rounded-sm border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary">AI OCR is running on your uploaded documents</p>
            <p className="text-xs text-muted-foreground mt-1">
              Each uploaded file is analysed by Claude AI — it extracts key fields, cross-validates data, and generates an authenticity score. The admin review panel shows the full OCR report per document. You can track status under <strong>My Documents</strong> in your dashboard.
            </p>
          </div>
        </Card>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={() => navigate("/vendor-dashboard")}>Save Draft</Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-sm bg-accent text-accent-foreground hover:bg-accent/90 min-w-[180px]"
          >
            {isSubmitting ? "Submitting..." : "Submit Profile for Verification"}
          </Button>
        </div>
      </form>

      {/* Floating doc-check icon */}
      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <FileCheck2 className="h-3.5 w-3.5" />
        Documents uploaded above are immediately sent for AI OCR analysis. You can view results in My Documents once processing completes (10–30 seconds per file).
      </div>
    </AdminLayout>
  );
}
