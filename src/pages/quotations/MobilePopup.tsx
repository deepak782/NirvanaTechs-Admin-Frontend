import { useState } from "react";
import { getLeadsByMobile } from "@/api/leads";
import { Lead } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (lead: Lead) => void;   // 🔥 return full lead object
}

export default function MobilePopup({ open, onClose, onSelect }: Props) {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    try {
      setError("");
      setLoading(true);

      const leads = await getLeadsByMobile(mobile);

      if (leads.length === 0) {
        setError("No client found with this mobile number.");
        return;
      }

      const lead = leads[0]; // pick first matched lead

      // 🔥 Return the full lead including id, name, mobile
      onSelect(lead);

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
          <DialogTitle>Find Client by Mobile Number</DialogTitle>
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