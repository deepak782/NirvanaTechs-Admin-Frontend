import { useState } from "react";
import { getLeadsByMobile } from "@/api/leads";
import { Lead } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (lead: Lead) => void;
}

export default function MobilePopup({ open, onClose, onSelect }: Props) {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      setError("");
      setLoading(true);

      const leads = await getLeadsByMobile(mobile);

      // ❌ No lead found → close modal + close quotation page
      if (!leads || leads.length === 0) {
        setError("No lead found with this mobile number.");

        // Close popup
        onClose();

        // Close "Create Quotation" page
        navigate("/quotations");

        return;
      }

      // ✔ Lead found → return the full object
      const lead = leads[0];
      onSelect(lead);

      // Close popup
      onClose();
    } catch (err) {
      setError("Failed to search. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Find Lead by Mobile Number</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Enter Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        <Button className="mt-4 w-full" onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}