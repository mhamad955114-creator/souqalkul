import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  userId: string;
}

const ReportModal = ({ open, onOpenChange, listingId, userId }: ReportModalProps) => {
  const { t, dir } = useLanguage();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const reportReasons = [
    t.report.reasons.inappropriate,
    t.report.reasons.fraud,
    t.report.reasons.fakePrice,
    t.report.reasons.stolenImages,
    t.report.reasons.spam,
    t.report.reasons.other,
  ];

  const handleSubmit = async () => {
    if (!reason) {
      toast.error(t.report.selectReason);
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("reports").insert({
      listing_id: listingId,
      reporter_id: userId,
      reason,
      details: details.trim() || null,
    });

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast.error(t.report.alreadyReported);
      } else {
        toast.error(t.report.error);
      }
      return;
    }

    toast.success(t.report.success);
    setReason("");
    setDetails("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={dir}>
        <DialogHeader>
          <DialogTitle>{t.report.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-3">
            <Label>{t.report.reason}</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reportReasons.map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <RadioGroupItem value={r} id={r} />
                  <Label htmlFor={r} className="font-normal cursor-pointer">
                    {r}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>{t.report.details}</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t.report.details}
              maxLength={500}
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading || !reason} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            {t.report.submit}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
