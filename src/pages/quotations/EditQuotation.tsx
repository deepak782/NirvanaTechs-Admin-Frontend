import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import { getQuotationById, updateQuotation } from "@/api/quotations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { QuotationStatus } from "@/types";

export default function EditQuotation() {
  const navigate = useNavigate();
  const { id } = useParams();

  // 1️⃣ Fetch quotation
  const { data: quotation, isLoading } = useQuery({
    queryKey: ["quotation", id],
    queryFn: () => getQuotationById(id!),
  });

  // 2️⃣ Local form state
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState<QuotationStatus>(QuotationStatus.SENT);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // 3️⃣ Update mutation using FormData
  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();

      formData.append("subject", subject);
      formData.append("status", status);
      formData.append("leadId", quotation!.leadId);

      if (pdfFile) {
        formData.append("file", pdfFile);
      }

      return updateQuotation(id!, formData);
    },

    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quotation updated successfully",
      });
      navigate("/quotations");
    },

    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update quotation",
        variant: "destructive",
      });
    },
  });

  // 4️⃣ Populate local state once quotation loads
  useEffect(() => {
    if (quotation) {
      setSubject(quotation.subject);
      setStatus(quotation.status);
    }
  }, [quotation]);

  // 5️⃣ Before rendering UI
  if (isLoading || !quotation) {
    return <p className="p-6">Loading quotation...</p>;
  }

  const isApproved = quotation.status === "APPROVED";

  const pdfViewerUrl = quotation.pdfUrl
    ? `${import.meta.env.VITE_API_URL}${quotation.pdfUrl}`
    : null;

  // 6️⃣ UI
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold">Edit Quotation</h1>
      <p className="text-muted-foreground mb-6">Update quotation details</p>

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        {/* SUBJECT */}
        <div className="space-y-2">
          <Label>Subject *</Label>
          <Input
            disabled={isApproved}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* STATUS */}
        <div className="space-y-2">
          <Label>Status *</Label>
          <Select
            disabled={isApproved}
            value={status}
            onValueChange={(v) => setStatus(v as QuotationStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">DRAFT</SelectItem>
              <SelectItem value="SENT">SENT</SelectItem>
              <SelectItem value="APPROVED">APPROVED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PDF VIEWER */}
        {pdfViewerUrl && (
          <div>
            <Label>Current PDF</Label>
            <iframe
              src={pdfViewerUrl}
              className="w-full h-[550px] border rounded-lg mt-2"
            />
          </div>
        )}

        {/* PDF upload (only when NOT approved) */}
        {!isApproved && (
          <div className="space-y-2">
            <Label>Upload New PDF (Optional)</Label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            />
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={() => navigate("/quotations")}>
            Cancel
          </Button>

          <Button
            disabled={isApproved || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Updating..." : "Update Quotation"}
          </Button>
        </div>
      </div>
    </div>
  );
}