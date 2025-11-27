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

  // Fetch quotation
  const { data: quotation, isLoading } = useQuery({
    queryKey: ["quotation", id],
    queryFn: () => getQuotationById(id!),
  });

  // Local form state
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState<QuotationStatus>(QuotationStatus.SENT);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Mutation
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
      toast({ title: "Success", description: "Quotation updated successfully" });
      navigate("/quotations");
    },

    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update quotation",
        variant: "destructive",
      });
    },
  });

  // Populate state
  useEffect(() => {
    if (quotation) {
      setSubject(quotation.subject);
      setStatus(quotation.status);
    }
  }, [quotation]);

  if (isLoading || !quotation) return <p className="p-6">Loading...</p>;

  const isApproved = quotation.status === "APPROVED";

  // ⛔ IMPORTANT: pdfUrl is FULL R2 URL already
  const pdfViewerUrl = quotation.pdfUrl || null;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold">Edit Quotation</h1>
      <p className="text-muted-foreground mb-6">Update quotation details</p>

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <div>
          <Label>Subject *</Label>
          <Input
            disabled={isApproved}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div>
          <Label>Status *</Label>
          <Select
            disabled={isApproved}
            value={status}
            onValueChange={(v) => setStatus(v as QuotationStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">DRAFT</SelectItem>
              <SelectItem value="SENT">SENT</SelectItem>
              <SelectItem value="APPROVED">APPROVED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PDF Viewer */}
        {pdfViewerUrl && (
          <div>
            <Label>Current PDF</Label>
            <iframe
              src={pdfViewerUrl}
              className="w-full h-[550px] border rounded-lg mt-2"
            />
          </div>
        )}

        {/* Upload file if NOT approved */}
        {!isApproved && (
          <div>
            <Label>Upload New PDF (Optional)</Label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            />
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={() => navigate("/quotations")}>
            Cancel
          </Button>

          {!isApproved && (
            <Button onClick={() => mutation.mutate()}>
              {mutation.isPending ? "Updating..." : "Update Quotation"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}