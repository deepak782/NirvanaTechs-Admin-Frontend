import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import html2pdf from "html2pdf.js";
import { useToast } from "@/components/ui/use-toast";
import Select from "react-select";
import  MobilePopup  from "./MobilePopup";
import { Lead } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Printer, Edit2, Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { uploadQuotationPdf } from "@/api/quotations";
import api from "@/api/axiosConfig";


const getToday = () => {
  const d = new Date();
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

//
// Editable text components
//
interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  inline?: boolean;
}

function EditableText({
  value,
  onChange,
  className = "",
  multiline = false,
  placeholder,
  inline = false,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div
        className={`${
          inline ? "inline-flex" : "flex"
        } items-center gap-2 print:hidden pdf-hidden`}
      >
        {multiline ? (
          <Textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[80px]"
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <Input
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={inline ? "inline-block" : ""}
            placeholder={placeholder}
            autoFocus
          />
        )}
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <span
      className={`${className} cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded print:hover:bg-transparent print:cursor-default inline-flex items-center gap-1 group`}
      onClick={() => setIsEditing(true)}
    >
      {value || placeholder}
      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-50 print:hidden pdf-hidden" />
    </span>
  );
}

interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
}

function EditableList({ items, onChange }: EditableListProps) {
  const addItem = () => {
    onChange([...items, "New item"]);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <div className="space-y-1 list-avoid-break">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 ml-4 group">
          <span>•</span>
          <EditableText
            value={item}
            onChange={(value) => updateItem(index, value)}
            className="flex-1"
            placeholder="Enter list item"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => removeItem(index)}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 print:hidden pdf-hidden"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        variant="ghost"
        onClick={addItem}
        className="ml-4 print:hidden pdf-hidden"
      >
        <Plus className="h-3 w-3 mr-1" />
        Add Item
      </Button>
    </div>
  );
}

//
// Dynamic Scope Sections (Section 2)
//
type SectionType = "text" | "list";

interface ExtraSection {
  id: string;
  title: string;
  type: SectionType;
  text: string;
  items: string[];
}

interface ScopeSection {
  id: string;
  title: string;
  technology: string;
  features: string[];
}

const SCOPE_BORDER_CLASSES = [
  "border-blue-500",
  "border-green-500",
  "border-orange-500",
  "border-purple-500",
  "border-red-500",
];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const getLetter = (index: number) =>
  LETTERS[index] || String.fromCharCode(65 + index);

// Default scope sections (A, B, C, D, E)
const defaultScopeSections: ScopeSection[] = [
  {
    id: "user-app",
    title: "User App (Cross-Platform: iOS & Android)",
    technology: "Flutter",
    features: [
      "User Onboarding (Sign-up/Login with Social/Email)",
      "Service & Vendor Discovery (Browse categories, search, view vendor profiles)",
      "Real-time Ordering & Cart Management",
      "Secure In-App Payments (Integration with Razorpay/Stripe)",
      "Live Order Tracking with Map View",
      "Push Notifications for Order Status",
      "Ratings, Reviews, and Order History",
      "User Profile Management",
    ],
  },
  {
    id: "vendor-panel",
    title: "Vendor Panel (Web-Based)",
    technology: "React.js",
    features: [
      "Vendor Registration & Profile Management",
      "Product/Service Catalogue Management (Add, edit, update availability)",
      "Order Management Dashboard (Accept/reject new orders, track active orders)",
      "Earnings & Payout Reports",
      "Customer Communication Tools",
    ],
  },
  {
    id: "delivery-app",
    title: "Delivery Captain App (Android)",
    technology: "Native Android",
    features: [
      "Captain Onboarding & Verification",
      "Real-time Order Notifications",
      "In-App Navigation for Pickup & Delivery",
      "Order Status Updates (e.g., Picked Up, On The Way, Delivered)",
      "Earnings Dashboard & Trip History",
    ],
  },
  {
    id: "admin-panel",
    title: "Admin Panel (Web-Based)",
    technology: "React.js",
    features: [
      "Master Dashboard with Key Analytics",
      "Management of Users, Vendors, and Delivery Captains",
      "Service Category & Commission Management",
      "Dispute Resolution and Support Ticket System",
      "Reporting & Data Analytics",
    ],
  },
  {
    id: "backend-uiux",
    title: "Backend API & UI/UX Design",
    technology: "Node.js, MongoDB, Figma",
    features: [
      "Secure, scalable, and robust APIs to power all applications.",
      "Backend Technology Stack: Node.js, Express.js, MongoDB.",
      "Intuitive and modern user interface designs for all applications.",
      "Design Tool: Figma (wireframes, prototypes, and design system).",
    ],
  },
];

// Helper to summarize timeline duration
function summarizeDuration(
  rows: { duration: string }[]
): { min: number; max: number } {
  let min = 0;
  let max = 0;

  rows.forEach((row) => {
    const nums = row.duration.match(/\d+/g);
    if (!nums || nums.length === 0) return;

    if (nums.length === 1) {
      const n = Number(nums[0]);
      if (!isNaN(n)) {
        min += n;
        max += n;
      }
    } else {
      const n1 = Number(nums[0]);
      const n2 = Number(nums[1]);
      if (!isNaN(n1)) min += n1;
      if (!isNaN(n2)) max += n2;
    }
  });

  return { min, max };
}

const QuotationCreate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leadIdFromUrl = searchParams.get('leadId');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string>(leadIdFromUrl || "");
  const [showMobilePopup, setShowMobilePopup] = useState(!leadIdFromUrl);
  const printRef = useRef<HTMLDivElement | null>(null);
  const [requirements, setRequirements] = useState<Lead[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<string>(leadIdFromUrl || "");
  

   const updateField = (field: keyof typeof editableFields, value: string) => {
    setEditableFields((prev) => ({ ...prev, [field]: value }));
    };

  useEffect(() => {
  if (!leadIdFromUrl) return;

  const fetchLeadFromViewPage = async () => {
    try {
      const res = await api.get(`/leads/${leadIdFromUrl}`);
      const lead = res.data.lead;

      updateField("clientCompanyName", lead.name || "");
      updateField("clientSignatoryName", lead.name || "");
      updateField("clientContactDetails", lead.mobile || "");

      setLeadId(lead.id);
      setSelectedClientId(lead.id);
      setShowMobilePopup(false);
    } catch (err) {
      console.error("Error loading lead from ViewLead:", err);
    }
  };

  fetchLeadFromViewPage();
}, [leadIdFromUrl]);
  

  const clientNameFromQuery =
    searchParams.get("clientName") || "[Client Company Name]";

  // Main editable fields
  const [editableFields, setEditableFields] = useState({
    companyName: "Nirvana Techs",
    companyAddress: "Hyderabad, Telangana, India",
    clientCompanyName: clientNameFromQuery,
   // clientAddress: "[Company Name]",
    date: getToday(),
    refNo: "NT/QUO/2025/08-001",
    subject:
      "Proposal for the Development of a Multi-Service Delivery Ecosystem (MVP)",

    section1Title: "Introduction & Project Goal",
    section2Title: "Scope of Work & Key Features",
    section3Title: "Technology Stack",
    section4Title: "Commercials: Investment & Cost Breakdown",
    section5Title: "Project Timeline",
    section6Title: "Payment Milestones",
    section7Title: "Client Responsibilities",
    section8Title: "Post-Delivery Support",
    section9Title: "Quotation Validity",

    introContent:
      "Nirvana Techs is pleased to present this proposal for the design, development, and deployment of a comprehensive Multi-Service Delivery Ecosystem tailored for beachgoers...",
    scopeIntro:
      "We will deliver a complete end-to-end solution consisting of multiple applications and a robust backend system.",

    costDescription:
      "We propose a fixed-cost model for this project. All costs are in Indian Rupees (INR).",
    costNote:
      "Note: The total cost is exclusive of GST (18%) and any third-party service costs (e.g., server hosting, domain, paid APIs).",

    timelineDescription:
      "We estimate a total project duration, structured into the following phases:",

    paymentDescription:
      "We propose a milestone-based payment plan to ensure mutual progress and commitment.",

    clientRespDescription:
      "To ensure a smooth project flow, the client will be responsible for providing the following:",

    supportFree:
      "We provide 1 month of free technical support post-deployment to address any bugs or critical issues.",
    supportAMC:
      "An optional AMC is available at 15% of the total project cost per year for ongoing maintenance, server management, and updates.",

    validityText:
      "This quotation is valid for a period of 30 days from the date of issue.",

    closingText:
      "We are confident that we can deliver a high-quality digital ecosystem that meets your business objectives. We look forward to the opportunity to partner with you on this exciting project.",

    authorizedSignatory: "Authorized Signatory",
    signatoryName: "Mr.Asif Ali",
    designation: "Managing Director",
    contactDetails: "9581302398",

    // client signatory fields (right side)
    clientSignatoryTitle: "Client Authorized Signatory",
    clientSignatoryName: "[Client Name]",
    // clientDesignation: "[Client Designation]",
    clientContactDetails: "[Client Contact Details]",
  });
      
  // Dynamic Scope Sections (Section 2)
  const [scopeSections, setScopeSections] =
    useState<ScopeSection[]>(defaultScopeSections);

  const [clientResponsibilities, setClientResponsibilities] = useState<
    string[]
  >([
    "Credentials and documentation for Payment Gateway integration (e.g., Razorpay, Stripe).",
    "Credentials and documentation for SMS/OTP services (e.g., Twilio, MSG91).",
    "Developer accounts for Google Play Store and Apple App Store.",
    "All branding materials, including logo, color schemes, fonts, and content.",
  ]);

  const [techStackTable, setTechStackTable] = useState(
    [
      { component: "User App (iOS/Android)", technology: "Flutter" },
      { component: "Admin & Vendor Panels", technology: "React.js" },
      {
        component: "Delivery Captain App",
        technology: "Native Android (Java/Kotlin)",
      },
      { component: "Backend API", technology: "Node.js, Express.js" },
      { component: "Database", technology: "MongoDB" },
      { component: "UI/UX Design", technology: "Figma" },
    ]
  );

  const [costTable, setCostTable] = useState(
    [
      { module: "UI/UX Design", technology: "Figma", cost: "₹60,000" },
      {
        module: "User App (iOS + Android)",
        technology: "Flutter",
        cost: "₹1,80,000",
      },
      { module: "Vendor Web Panel", technology: "React.js", cost: "₹90,000" },
      { module: "Admin Web Panel", technology: "React.js", cost: "₹90,000" },
      {
        module: "Delivery Captain App",
        technology: "Native Android",
        cost: "₹80,000",
      },
      {
        module: "Backend Development (APIs)",
        technology: "Node.js + MongoDB",
        cost: "₹1,00,000",
      },
    ]
  );

  const [timelineTable, setTimelineTable] = useState(
    [
      {
        phase: "Phase 1: UI/UX Design & Prototyping",
        duration: "3 – 4 Weeks",
      },
      {
        phase: "Phase 2: Development (All Modules)",
        duration: "12 – 14 Weeks",
      },
      { phase: "Phase 3: Testing, QA & Bug Fixing", duration: "3 Weeks" },
      { phase: "Phase 4: Deployment & Handover", duration: "2 Weeks" },
    ]
  );

  const [paymentTable, setPaymentTable] = useState(
    [
      {
        milestone: "Advance Payment (Project Kick-off)",
        percentage: "30%",
        amount: "₹1,80,000",
      },
      {
        milestone: "Development Milestone (UAT Release)",
        percentage: "40%",
        amount: "₹2,40,000",
      },
      {
        milestone: "Final Delivery & App Deployment",
        percentage: "20%",
        amount: "₹1,20,000",
      },
      {
        milestone: "Post Go-Live (After 1 Month Support)",
        percentage: "10%",
        amount: "₹60,000",
      },
    ]
  );

  // Extra dynamic sections (Option C: text | list)
  const [extraSections, setExtraSections] = useState<ExtraSection[]>([]);

  // Ability to "remove" built-in sections (hide them for this quotation)
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);

  // ---- Derived Values ----
  const totalInvestment = costTable.reduce((sum, row) => {
    if (!row.cost) return sum;
    const numeric = row.cost.toString().replace(/[^\d]/g, "");
    const num = numeric ? Number(numeric) : 0;
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const { min: totalMinWeeks, max: totalMaxWeeks } =
    summarizeDuration(timelineTable);

  const getAmountFromPercentage = (percentage: string): string => {
    const numeric = percentage.toString().replace(/[^\d.]/g, "");
    const perc = numeric ? Number(numeric) : 0;
    if (!totalInvestment || isNaN(perc) || perc <= 0) {
      return "₹0";
    }
    const amount = Math.round((perc / 100) * totalInvestment);
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // ---- Handlers ----
  const addExtraSection = () => {
    const newSection: ExtraSection = {
      id: Date.now().toString(),
      title: "New Section",
      type: "text",
      text: "Enter your section content here...",
      items: ["New item"],
    };
    setExtraSections((prev) => [...prev, newSection]);
  };

  const updateExtraSection = (
    id: string,
    patch: Partial<Omit<ExtraSection, "id">>
  ) => {
    setExtraSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, ...patch } : sec))
    );
  };

  const removeExtraSection = (id: string) => {
    setExtraSections((prev) => prev.filter((sec) => sec.id !== id));
  };

  const hideSection = (key: string) => {
    setHiddenSections((prev) =>
      prev.includes(key) ? prev : [...prev, key]
    );
  };


  const updateTableRow = (
    table: any[],
    setTable: (rows: any[]) => void,
    rowIndex: number,
    field: string,
    value: string
  ) => {
    const newTable = [...table];
    newTable[rowIndex] = { ...newTable[rowIndex], [field]: value };
    setTable(newTable);
  };

  const addTableRow = (
    table: any[],
    setTable: (rows: any[]) => void,
    template: any
  ) => {
    setTable([...table, template]);
  };

  const removeTableRow = (
    table: any[],
    setTable: (rows: any[]) => void,
    rowIndex: number
  ) => {
    setTable(table.filter((_, index) => index !== rowIndex));
  };

  // Scope section handlers
  const addScopeSection = () => {
    const newSection: ScopeSection = {
      id: Date.now().toString(),
      title: "New Module",
      technology: "Technology",
      features: ["Key feature 1", "Key feature 2"],
    };
    setScopeSections((prev) => [...prev, newSection]);
  };

  const updateScopeSectionField = (
    id: string,
    field: keyof ScopeSection,
    value: string | string[]
  ) => {
    setScopeSections((prev) =>
      prev.map((sec) =>
        sec.id === id ? { ...sec, [field]: value as any } : sec
      )
    );
  };

  const removeScopeSection = (id: string) => {
    setScopeSections((prev) => prev.filter((sec) => sec.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePdfBlob = async () => {
    const element = printRef.current;
    if (!element) {
      throw new Error("Template not ready");
    }

    // Add a class to body so we can hide controls only during export
    document.body.classList.add("pdf-export");

    // Optional: ensure a nice fixed width for consistent layout
    const originalWidth = element.style.width;
    element.style.width = "auto";
    element.style.maxWidth = "100%";

    const safeRefNo = editableFields.refNo.replace(/[\/\\]/g, "-");

    const options = {
      margin: [10, 10, 10, 10], // top, left, bottom, right (mm)    
      filename: `${safeRefNo}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
      },
    };

    // @ts-ignore
    const worker = (html2pdf as any)().set(options).from(element);

    const blob = (await worker.outputPdf("blob")) as Blob;

    // restore
    element.style.width = originalWidth;
    document.body.classList.remove("pdf-export");

    return { blob };
  };

  const mutation = useMutation({
    mutationFn: async () => {

      if (!leadId && !selectedClientId) {
        throw new Error("Please select a client before saving the quotation.");
      }

      const { blob } = await generatePdfBlob();

      const fileName =
        (editableFields.refNo || "quotation").replace(/[/\\ ]/g, "_") +
        ".pdf";

      const totalCost = totalInvestment;
      

      return uploadQuotationPdf({
       leadId: leadId ? leadId : undefined, 
        refNo: editableFields.refNo,
        subject: editableFields.subject,
        totalProjectInvestment: totalCost || undefined,
        pdf: blob,
        fileName,
      });
    },
    onSuccess: () => {
      toast({
        title: "Quotation saved",
        description: "PDF uploaded and quotation created.",
      });
      if (leadId) {
          navigate(
            `/quotations?leadId=${encodeURIComponent(
              leadId
            )}&clientName=${encodeURIComponent(editableFields.clientCompanyName)}`
          );
        } else {
          navigate(`/quotations`);
        }
    },
    onError: (err: any) => {
      toast({
        title: "Error saving quotation",
        description: err?.message || "Something went wrong",
      });
    },
  });

  const handleLeadSelect = (lead: Lead) => {
    setLeadId(lead.id);
    setSelectedClientId(lead.id);
    updateField("clientCompanyName", lead.name);
   // updateField("clientAddress", lead.email || "");
    updateField("clientSignatoryName", lead.name);
    updateField("clientContactDetails", lead.mobile || "");
    setShowMobilePopup(false);
  };

  return (
    <>
      <MobilePopup
        open={showMobilePopup}
        onClose={() => setShowMobilePopup(false)}
        onSelect={(lead) => {
          // Set main IDs
          setLeadId(lead.id);
          setSelectedClientId(lead.id);

          // Autofill To: section
          updateField("clientCompanyName", lead.name);

          // Autofill Client Signatory block
          updateField("clientSignatoryName", lead.name);
          updateField("clientContactDetails", lead.mobile);

          // Store requirements (if needed for your UI)
          setRequirements([lead]);

          setShowMobilePopup(false);
        }}
      />
      <div className="min-h-screen bg-gray-50 py-8">
      {/* Top bar */}
      <div className="max-w-6xl mx-auto px-6 mb-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/quotations')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quotations
          </Button>
          <div className="text-sm text-muted-foreground">
            Lead:{" "}
            <span className="font-semibold">
              {editableFields.clientCompanyName}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {/* <Button variant="outline" onClick={handlePrint} size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print as PDF
          </Button> */}
          <Button
            onClick={() => mutation.mutate()}
            size="sm"
            disabled={mutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {mutation.isPending ? "Saving..." : "Save & Upload"}
          </Button>
        </div>
      </div>

      <div ref={printRef} className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-6 print:shadow-none print:border-0 print:rounded-none">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Project Quotation Proposal
            </h1>
            <div className="text-xl font-semibold text-blue-600 mb-4">
              <EditableText
                value={editableFields.companyName}
                onChange={(value) => updateField("companyName", value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="text-gray-600">
              <EditableText
                value={editableFields.companyAddress}
                onChange={(value) => updateField("companyAddress", value)}
                placeholder="Enter company address"
                multiline={true}
              />
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid md:grid-cols-2 gap-6 mb-6">

            {/* LEFT SIDE — TO SECTION */}
            <div>
              <h3 className="font-semibold mb-2">To:</h3>

              {/* React-Select for choosing client (hidden in print/PDF) */}
              {/* <div className="print:hidden pdf-hidden mb-3">
                <Select
                  options={clientsData.map((c: any) => ({
                    value: c.id,
                    label: c.name,
                    full: c,
                  }))}
                  placeholder="Select client..."
                  value={
                    clientsData
                      .map((c: any) => ({
                        value: c.id,
                        label: c.name,
                        full: c,
                      }))
                      .find((opt) => opt.label === editableFields.clientCompanyName) || null
                  }
                  onChange={(selected: any) => {
                    const c = selected.full;
                    
                    setSelectedClientId(c.id); 
                    updateField("clientCompanyName", c.name);
                    updateField("clientAddress", c.company || "");
                    updateField("clientSignatoryName", c.name);
                    updateField("clientContactDetails", c.phone || "");
                  }}
                  styles={{
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div> */}

              {/* Visible on screen + PDF */}
              <div className="text-gray-700 leading-tight space-y-1">
                {/* Client name */}
                <p>
                  <EditableText
                    value={editableFields.clientCompanyName}
                    onChange={(value) => updateField("clientCompanyName", value)}
                    placeholder="Client Name"
                  />
                </p>

                {/* Company Name */}
               {/*  <p>
                  <EditableText
                    value={editableFields.clientAddress}
                    onChange={(value) => updateField("clientAddress", value)}
                    placeholder="Company Name"
                  />
                </p> */}
              </div>
            </div>
            {/* RIGHT SIDE — DATE / REF / SUBJECT */}
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Date:</span>{" "}
                <EditableText
                  value={editableFields.date}
                  onChange={(value) => updateField("date", value)}
                  inline={true}
                />
              </div>

              <div>
                <span className="font-semibold">Ref No:</span>{" "}
                <EditableText
                  value={editableFields.refNo}
                  onChange={(value) => updateField("refNo", value)}
                  inline={true}
                />
              </div>

              <div>
                <span className="font-semibold">Subject:</span>{" "}
                <EditableText
                  value={editableFields.subject}
                  onChange={(value) => updateField("subject", value)}
                  multiline={true}
                />
              </div>
            </div>
          </div>
        </div>

        

        {/* 1. Introduction */}
        {!hiddenSections.includes("section1") && (
          <Card className="mb-6 print:shadow-none print:border print:border-gray-300 print:rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-blue-600">
                1.{" "}
                <EditableText
                  value={editableFields.section1Title}
                  onChange={(value) => updateField("section1Title", value)}
                  className="text-xl text-blue-600"
                  placeholder="Enter section title"
                  inline={true}
                />
              </CardTitle>
              <Button
                size="icon"
                variant="ghost"
                className="print:hidden pdf-hidden"
                onClick={() => hideSection("section1")}
                title="Remove section"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </CardHeader>
            <CardContent>
              <EditableText
                value={editableFields.introContent}
                onChange={(value) => updateField("introContent", value)}
                className="text-gray-700 leading-relaxed block"
                multiline={true}
                placeholder="Enter introduction content"
              />
            </CardContent>
          </Card>
        )}

        

        {/* 2. Scope of Work & Key Features */}

        {!hiddenSections.includes("section2") && (

          <Card className="mb-6 print:shadow-none print:border print:border-gray-300 print:rounded-none">

            <div className="section2-header-group">

              <CardHeader className="flex flex-row items-center justify-between">

                <CardTitle className="text-xl text-blue-600">

                  2.{" "}

                  <EditableText

                    value={editableFields.section2Title}

                    onChange={(value) => updateField("section2Title", value)}

                    className="text-xl text-blue-600"

                    placeholder="Enter section title"

                    inline={true}

                  />

                </CardTitle>

                <Button

                  size="icon"

                  variant="ghost"

                  className="print:hidden pdf-hidden"

                  onClick={() => hideSection("section2")}

                  title="Remove section"

                >

                  <Trash2 className="h-4 w-4 text-red-500" />

                </Button>

              </CardHeader>

              <div className="scope-intro px-6 mb-6">

                <EditableText

                  value={editableFields.scopeIntro}

                  onChange={(value) => updateField("scopeIntro", value)}

                  className="text-gray-700 block"

                  placeholder="Enter scope introduction"

                />

              </div>

            </div>

            <CardContent className="space-y-6">



              {scopeSections.map((section, index) => {

                const letter = getLetter(index);

                const borderClass =

                  SCOPE_BORDER_CLASSES[index % SCOPE_BORDER_CLASSES.length];



                return (

                  <div

                    key={section.id}

                    className={`border-l-4 ${borderClass} pl-4 scope-subsection`}

                  >

                    <div className="flex items-center gap-2 mb-2">

                      <h4 className="font-semibold">

                        {letter}.{" "}

                        <EditableText

                          value={section.title}

                          onChange={(value) =>

                            updateScopeSectionField(

                              section.id,

                              "title",

                              value

                            )

                          }

                          placeholder="Enter module title"

                          inline={true}

                        />

                      </h4>

                      <Badge variant="secondary">

                        <EditableText

                          value={section.technology}

                          onChange={(value) =>

                            updateScopeSectionField(

                              section.id,

                              "technology",

                              value

                            )

                          }

                          placeholder="Technology"

                          inline={true}

                        />

                      </Badge>

                      <Button

                        size="icon"

                        variant="ghost"

                        onClick={() => removeScopeSection(section.id)}

                        className="print:hidden pdf-hidden"

                        title="Delete this module"

                      >

                        <Trash2 className="h-4 w-4 text-red-500" />

                      </Button>

                    </div>



                    <EditableList

                      items={section.features}

                      onChange={(items) =>

                        updateScopeSectionField(

                          section.id,

                          "features",

                          items

                        )

                      }

                    />

                  </div>

                );

              })}



              <div className="flex justify-end print:hidden pdf-hidden">

                <Button size="sm" variant="outline" onClick={addScopeSection}>

                  <Plus className="h-4 w-4 mr-2" />

                  Add Scope Section

                </Button>

              </div>

            </CardContent>

          </Card>

        )}

        {/* 3. Technology Stack */}
        {!hiddenSections.includes("section3") && (
          <Card className="mb-6 print:shadow-none print:border print:border-gray-300 print:rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-blue-600">
                3.{" "}
                <EditableText
                  value={editableFields.section3Title}
                  onChange={(value) => updateField("section3Title", value)}
                  className="text-xl text-blue-600"
                  placeholder="Enter section title"
                  inline={true}
                />
              </CardTitle>
              <Button
                size="icon"
                variant="ghost"
                className="print:hidden pdf-hidden"
                onClick={() => hideSection("section3")}
                title="Remove section"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 table-avoid-break">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Component
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Technology Stack
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center font-semibold print:hidden pdf-hidden">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {techStackTable.map((row, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 1 ? "bg-gray-50" : ""}
                      >
                        <td className="border border-gray-300 px-4 py-2">
                          <EditableText
                            value={row.component}
                            onChange={(value) =>
                              updateTableRow(
                                techStackTable,
                                setTechStackTable,
                                index,
                                "component",
                                value
                              )
                            }
                            placeholder="Component name"
                            inline={true}
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <EditableText
                            value={row.technology}
                            onChange={(value) =>
                              updateTableRow(
                                techStackTable,
                                setTechStackTable,
                                index,
                                "technology",
                                value
                              )
                            }
                            placeholder="Technology"
                            inline={true}
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center print:hidden pdf-hidden">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              removeTableRow(
                                techStackTable,
                                setTechStackTable,
                                index
                              )
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    addTableRow(techStackTable, setTechStackTable, {
                      component: "New Component",
                      technology: "New Technology",
                    })
                  }
                  className="mt-2 print:hidden pdf-hidden"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Row
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        

        {/* 4. Commercials */}
        {!hiddenSections.includes("section4") && (
          <Card className="mb-6 print:shadow-none print:border print:border-gray-300 print:rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-blue-600">
                4.{" "}
                <EditableText
                  value={editableFields.section4Title}
                  onChange={(value) => updateField("section4Title", value)}
                  className="text-xl text-blue-600"
                  placeholder="Enter section title"
                  inline={true}
                />
              </CardTitle>
              <Button
                size="icon"
                variant="ghost"
                className="print:hidden pdf-hidden"
                onClick={() => hideSection("section4")}
                title="Remove section"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                <EditableText
                  value={editableFields.costDescription}
                  onChange={(value) => updateField("costDescription", value)}
                  placeholder="Enter cost description"
                />
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 table-avoid-break">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Module / Service
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Technology
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Cost (INR)
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center font-semibold print:hidden pdf-hidden">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {costTable.map((row, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 1 ? "bg-gray-50" : ""}
                      >
                        <td className="border border-gray-300 px-4 py-2">
                          <EditableText
                            value={row.module}
                            onChange={(value) =>
                              updateTableRow(
                                costTable,
                                setCostTable,
                                index,
                                "module",
                                value
                              )
                            }
                            placeholder="Module name"
                            inline={true}
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <EditableText
                            value={row.technology}
                            onChange={(value) =>
                              updateTableRow(
                                costTable,
                                setCostTable,
                                index,
                                "technology",
                                value
                              )
                            }
                            placeholder="Technology"
                            inline={true}
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          <EditableText
                            value={row.cost}
                            onChange={(value) =>
                              updateTableRow(
                                costTable,
                                setCostTable,
                                index,
                                "cost",
                                value
                              )
                            }
                            placeholder="Cost"
                            inline={true}
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center print:hidden pdf-hidden">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              removeTableRow(costTable, setCostTable, index)
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-blue-100 font-semibold">
                      <td
                        className="border border-gray-300 px-4 py-2"
                        colSpan={2}
                      >
                        <strong>Total Project Investment</strong>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        <strong>
                          ₹{totalInvestment.toLocaleString("en-IN")}
                        </strong>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 print:hidden pdf-hidden"></td>
                    </tr>
                  </tbody>
                </table>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    addTableRow(costTable, setCostTable, {
                      module: "New Module",
                      technology: "New Technology",
                      cost: "₹0",
                    })
                  }
                  className="mt-2 print:hidden pdf-hidden"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Row
                </Button>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                <em>
                  <EditableText
                    value={editableFields.costNote}
                    onChange={(value) => updateField("costNote", value)}
                    placeholder="Enter cost note"
                  />
                </em>
              </p>
            </CardContent>
          </Card>
        )}

        

        {/* 5. Timeline */}
        {!hiddenSections.includes("section5") && (
          <Card className="mb-6 print:shadow-none print:border print:border-gray-300 print:rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-blue-600">
                5.{" "}
                <EditableText
                  value={editableFields.section5Title}
                  onChange={(value) => updateField("section5Title", value)}
                  className="text-xl text-blue-600"
                  placeholder="Enter section title"
                  inline={true}
                />
              </CardTitle>
              <Button
                size="icon"
                variant="ghost"
                className="print:hidden pdf-hidden"
                onClick={() => hideSection("section5")}
                title="Remove section"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                <EditableText
                  value={editableFields.timelineDescription}
                  onChange={(value) =>
                    updateField("timelineDescription", value)
                  }
                  placeholder="Enter timeline description"
                />
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 table-avoid-break">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Phase
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Duration
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center font-semibold print:hidden pdf-hidden">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {timelineTable.map((row, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 1 ? "bg-gray-50" : ""}
                      >
                        <td className="border border-gray-300 px-4 py-2">
                          <EditableText
                            value={row.phase}
                            onChange={(value) =>
                              updateTableRow(
                                timelineTable,
                                setTimelineTable,
                                index,
                                "phase",
                                value
                              )
                            }
                            placeholder="Phase description"
                            inline={true}
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <EditableText
                            value={row.duration}
                            onChange={(value) =>
                              updateTableRow(
                                timelineTable,
                                setTimelineTable,
                                index,
                                "duration",
                                value
                              )
                            }
                            placeholder="Duration"
                            inline={true}
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center print:hidden pdf-hidden">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              removeTableRow(
                                timelineTable,
                                setTimelineTable,
                                index
                              )
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-green-100 font-semibold">
                      <td className="border border-gray-300 px-4 py-2">
                        <strong>Total Estimated Duration</strong>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <strong>
                          {totalMinWeeks === 0 && totalMaxWeeks === 0
                            ? "–"
                            : `${totalMinWeeks} – ${totalMaxWeeks} Weeks`}
                        </strong>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 print:hidden pdf-hidden"></td>
                    </tr>
                  </tbody>
                </table>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    addTableRow(timelineTable, setTimelineTable, {
                      phase: "New Phase",
                      duration: "Duration",
                    })
                  }
                  className="mt-2 print:hidden pdf-hidden"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Phase
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        

        {/* 6. Payment Milestones */}
        {!hiddenSections.includes("section6") && (
          <Card className="mb-6 print:shadow-none print:border print:border-gray-300 print:rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-blue-600">
                6.{" "}
                <EditableText
                  value={editableFields.section6Title}
                  onChange={(value) => updateField("section6Title", value)}
                  className="text-xl text-blue-600"
                  placeholder="Enter section title"
                  inline={true}
                />
              </CardTitle>
              <Button
                size="icon"
                variant="ghost"
                className="print:hidden pdf-hidden"
                onClick={() => hideSection("section6")}
                title="Remove section"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                <EditableText
                  value={editableFields.paymentDescription}
                  onChange={(value) =>
                    updateField("paymentDescription", value)
                  }
                  placeholder="Enter payment description"
                />
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 table-avoid-break">
                  <thead>
                    <tr className="bg-purple-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                        Milestone
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                        Percentage
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        Amount (INR)
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center font-semibold print:hidden pdf-hidden">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentTable.map((row, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 1 ? "bg-gray-50" : ""}
                      >
                        <td className="border border-gray-300 px-4 py-2">
                          <EditableText
                            value={row.milestone}
                            onChange={(value) =>
                              updateTableRow(
                                paymentTable,
                                setPaymentTable,
                                index,
                                "milestone",
                                value
                              )
                            }
                            placeholder="Milestone description"
                            inline={true}
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <EditableText
                            value={row.percentage}
                            onChange={(value) =>
                              updateTableRow(
                                paymentTable,
                                setPaymentTable,
                                index,
                                "percentage",
                                value
                              )
                            }
                            placeholder="Percentage"
                            inline={true}
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {getAmountFromPercentage(row.percentage)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center print:hidden pdf-hidden">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              removeTableRow(
                                paymentTable,
                                setPaymentTable,
                                index
                              )
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    addTableRow(paymentTable, setPaymentTable, {
                      milestone: "New Milestone",
                      percentage: "0%",
                      amount: "₹0",
                    })
                  }
                  className="mt-2 print:hidden pdf-hidden"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Milestone
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        

        {/* 7. Client Responsibilities */}
        {!hiddenSections.includes("section7") && (
          <Card className="mb-6 print:shadow-none print:border print:border-gray-300 print:rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-blue-600">
                7.{" "}
                <EditableText
                  value={editableFields.section7Title}
                  onChange={(value) => updateField("section7Title", value)}
                  className="text-xl text-blue-600"
                  placeholder="Enter section title"
                  inline={true}
                />
              </CardTitle>
              <Button
                size="icon"
                variant="ghost"
                className="print:hidden pdf-hidden"
                onClick={() => hideSection("section7")}
                title="Remove section"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                <EditableText
                  value={editableFields.clientRespDescription}
                  onChange={(value) =>
                    updateField("clientRespDescription", value)
                  }
                  placeholder="Enter description"
                />
              </p>
              <EditableList
                items={clientResponsibilities}
                onChange={setClientResponsibilities}
              />
            </CardContent>
          </Card>
        )}

        

        {/* 8. Post-Delivery Support */}
        {!hiddenSections.includes("section8") && (
          <Card className="mb-6 print:shadow-none print:border print:border-gray-300 print:rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-blue-600">
                8.{" "}
                <EditableText
                  value={editableFields.section8Title}
                  onChange={(value) => updateField("section8Title", value)}
                  className="text-xl text-blue-600"
                  placeholder="Enter section title"
                  inline={true}
                />
              </CardTitle>
              <Button
                size="icon"
                variant="ghost"
                className="print:hidden pdf-hidden"
                onClick={() => hideSection("section8")}
                title="Remove section"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <strong>Free Support:</strong>{" "}
                  <EditableText
                    value={editableFields.supportFree}
                    onChange={(value) => updateField("supportFree", value)}
                    placeholder="Enter free support details"
                    inline={true}
                  />
                </div>
                <div>
                  <strong>Annual Maintenance Contract (AMC):</strong>{" "}
                  <EditableText
                    value={editableFields.supportAMC}
                    onChange={(value) => updateField("supportAMC", value)}
                    placeholder="Enter AMC details"
                    inline={true}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        

        {/* 9. Quotation Validity */}
        {!hiddenSections.includes("section9") && (
          <Card className="mb-6 print:shadow-none print:border print:border-gray-300 print:rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-blue-600">
                9.{" "}
                <EditableText
                  value={editableFields.section9Title}
                  onChange={(value) => updateField("section9Title", value)}
                  className="text-xl text-blue-600"
                  placeholder="Enter section title"
                  inline={true}
                />
              </CardTitle>
              <Button
                size="icon"
                variant="ghost"
                className="print:hidden pdf-hidden"
                onClick={() => hideSection("section9")}
                title="Remove section"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </CardHeader>
            <CardContent>
              <EditableText
                value={editableFields.validityText}
                onChange={(value) => updateField("validityText", value)}
                className="text-gray-700"
                placeholder="Enter validity text"
              />
            </CardContent>
          </Card>
        )}

        

        {/* Additional Sections (dynamic) */}
        {extraSections.length > 0 && (
          <Card className="mb-6 print:shadow-none print:border print:border-gray-300 print:rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-blue-600">
                Additional Sections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {extraSections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {idx + 10}.{" "}
                        <EditableText
                          value={sec.title}
                          onChange={(value) =>
                            updateExtraSection(sec.id, { title: value })
                          }
                          inline={true}
                          placeholder="Section title"
                        />
                      </span>
                    </div>
                    <div className="flex items-center gap-3 print:hidden pdf-hidden">
                      <label className="text-xs text-muted-foreground">
                        Type:{" "}
                        <select
                          value={sec.type}
                          onChange={(e) =>
                            updateExtraSection(sec.id, {
                              type: e.target.value as SectionType,
                            })
                          }
                          className="border border-gray-300 rounded px-1 py-0.5 text-xs"
                        >
                          <option value="text">Text</option>
                          <option value="list">List</option>
                        </select>
                      </label>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeExtraSection(sec.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {sec.type === "text" && (
                    <EditableText
                      value={sec.text}
                      onChange={(value) =>
                        updateExtraSection(sec.id, { text: value })
                      }
                      multiline={true}
                      className="text-gray-700"
                      placeholder="Enter section content"
                    />
                  )}

                  {sec.type === "list" && (
                    <EditableList
                      items={sec.items}
                      onChange={(items) =>
                        updateExtraSection(sec.id, { items })
                      }
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Button to add new extra section */}
        <div className="mb-6 print:hidden pdf-hidden flex justify-end">
          <Button variant="outline" size="sm" onClick={addExtraSection}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Section
          </Button>
        </div>

        {/* Closing & Signatories */}
        <div className="bg-white rounded-lg shadow-sm border p-8 print:shadow-none print:border-0 print:rounded-none signature-block">
          <p className="text-gray-700 mb-6 leading-relaxed">
            <EditableText
              value={editableFields.closingText}
              onChange={(value) => updateField("closingText", value)}
              multiline={true}
              placeholder="Enter closing message"
            />
          </p>

          <div className="mt-10 flex flex-col md:flex-row justify-between gap-12">
            {/* Left: Authorized signatory (you) */}
            <div className="w-full md:w-1/2">
              <p className="font-semibold mb-4">
                <EditableText
                  value={editableFields.authorizedSignatory}
                  onChange={(value) =>
                    updateField("authorizedSignatory", value)
                  }
                  placeholder="Enter signatory title"
                  inline={true}
                />
              </p>
              <p className="mb-6">
                For <strong>Nirvana Techs</strong>
              </p>
              <div className="border-b border-gray-400 w-64 mb-2"></div>
              <div className="text-gray-600 space-y-1">
                <p>
                  <EditableText
                    value={editableFields.signatoryName}
                    onChange={(value) =>
                      updateField("signatoryName", value)
                    }
                    placeholder="Enter name"
                    inline={true}
                  />
                </p>
                <p>
                  <EditableText
                    value={editableFields.designation}
                    onChange={(value) =>
                      updateField("designation", value)
                    }
                    placeholder="Enter designation"
                    inline={true}
                  />
                </p>
                <p>
                  <EditableText
                    value={editableFields.contactDetails}
                    onChange={(value) =>
                      updateField("contactDetails", value)
                    }
                    placeholder="Enter contact details"
                    inline={true}
                  />
                </p>
              </div>
            </div>

            {/* Right: Client signatory */}
            <div className="w-full md:w-1/2 md:text-right">
              <p className="font-semibold mb-4">
                <EditableText
                  value={editableFields.clientSignatoryTitle}
                  onChange={(value) =>
                    updateField("clientSignatoryTitle", value)
                  }
                  placeholder="Client signatory title"
                  inline={true}
                />
              </p>
              <p className="mb-6">
                For <strong>{editableFields.clientCompanyName}</strong>
              </p>
              <div className="border-b border-gray-400 md:ml-auto w-64 mb-2"></div>
              <div className="text-gray-600 space-y-1">
                <p>
                  <EditableText
                    value={editableFields.clientSignatoryName}
                    onChange={(value) =>
                      updateField("clientSignatoryName", value)
                    }
                    placeholder="Client name"
                    inline={true}
                  />
                </p>
                <p>
                  {/* <EditableText
                    value={editableFields.clientDesignation}
                    onChange={(value) =>
                      updateField("clientDesignation", value)
                    }
                    placeholder="Client designation"
                    inline={true}
                  /> */}
                </p>
                <p>
                  <EditableText
                    value={editableFields.clientContactDetails}
                    onChange={(value) =>
                      updateField("clientContactDetails", value)
                    }
                    placeholder="Client contact details"
                    inline={true}
                  />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
{`
  /* ===========================
     GLOBAL NON-PRINT RULES
     =========================== */

  /* Hide edit/delete controls during PDF export */
  .pdf-export .pdf-hidden {
    display: none !important;
  }

  /* Allow full layout width for html2pdf (prevents clipping) */
  html, body {
    width: 100% !important;
    overflow-x: visible !important;
  }

  /* Disable any manual page-break elements */
  .page-break {
    display: none !important;
    page-break-before: auto !important;
    break-before: auto !important;
  }

  /* ===========================
     PDF SPACING OPTIMIZATION
     =========================== */

  /* Reduce spacing between cards in PDF */
  .pdf-export .mb-6 {
    margin-bottom: 1rem !important;
  }

  /* Reduce card padding in PDF */
  .pdf-export .card {
    padding: 0.5rem !important;
  }

  /* ===========================
     PREVENT AWKWARD SPLITTING
     =========================== */

  /* Prevent section headers from being orphaned at page bottom */
  h1, h2, h3, h4 {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  /* Allow large cards to break naturally */
  .card {
    page-break-inside: auto !important;
    break-inside: auto !important;
  }

    /* Keep Section 2 header and intro together */

  .section2-header-group {

    page-break-inside: avoid !important;

    break-inside: avoid !important;

    page-break-after: auto !important;

  }

  /* Keep individual scope subsections together (A, B, C, D, E) */
  .scope-subsection {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin-bottom: 1rem !important;
  }

  /* ===========================
     PREVENT ROW SPLITTING
     =========================== */

  /* ONLY prevent splitting of table rows (keep rows whole, not whole table) */
  .table-avoid-break tr,
  .table-avoid-break td,
  .table-avoid-break th {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* Tables themselves can break between rows */
  .table-avoid-break {
    page-break-inside: auto !important;
    break-inside: auto !important;
  }

  /* ONLY protect each bullet row (not the entire list) */
  .list-avoid-break > div {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* Lists can break between items */
  .list-avoid-break {
    page-break-inside: auto !important;
    break-inside: auto !important;
  }

  /* Signatures must stay on same page */
  .signature-block,
  .signature-block * {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* Better orphan/widow control */
  p, li {
    orphans: 2;
    widows: 2;
  }

  /* ===========================
     PRINT RULES
     =========================== */
  @media print {
    body {
      background: white !important;
    }

    .print\\:hidden {
      display: none !important;
    }

    .print\\:shadow-none {
      box-shadow: none !important;
    }

    .print\\:border {
      border: 1px solid #d1d5db !important;
    }

    .print\\:border-0 {
      border: none !important;
    }

    .print\\:border-gray-300 {
      border-color: #d1d5db !important;
    }

    .print\\:rounded-none {
      border-radius: 0 !important;
    }

    .print\\:hover\\:bg-transparent:hover {
      background-color: transparent !important;
    }

    .print\\:cursor-default {
      cursor: default !important;
    }

    @page {
      margin: 0.5in;
    }

    /* Reduce spacing in print */
    .mb-6 {
      margin-bottom: 1rem !important;
    }

    /* Prevent headers from being orphaned */
    h1, h2, h3, h4 {
      page-break-after: avoid !important;
    }

    /* Allow cards to break naturally */
    .card {
      page-break-inside: auto !important;
    }

    /* Keep Section 2 header and intro together */

    .section2-header-group {

      page-break-inside: avoid !important;

      break-inside: avoid !important;

    }

    /* Keep scope subsections together */
    .scope-subsection {
      page-break-inside: avoid !important;
      margin-bottom: 1rem !important;
    }

    /* Keep table rows intact */
    .table-avoid-break tr,
    .table-avoid-break td,
    .table-avoid-break th {
      page-break-inside: avoid !important;
    }

    /* Tables can break between rows */
    .table-avoid-break {
      page-break-inside: auto !important;
    }

    /* Keep bullet items intact */
    .list-avoid-break > div {
      page-break-inside: avoid !important;
    }

    /* Lists can break between items */
    .list-avoid-break {
      page-break-inside: auto !important;
    }

    /* Signature always together */
    .signature-block,
    .signature-block * {
      page-break-inside: avoid !important;
    }

    /* Better orphan/widow control */
    p, li {
      orphans: 2;
      widows: 2;
    }

    /* Disable hard breaks */
    .page-break {
      display: none !important;
      page-break-before: auto !important;
    }
  }
`}
</style>
    </div>
    </>
  );
};

export default QuotationCreate;