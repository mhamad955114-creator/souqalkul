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

const reportReasons = [
  "محتوى مخالف أو غير لائق",
  "إعلان احتيالي أو مضلل",
  "سعر غير حقيقي",
  "صور مسروقة أو غير حقيقية",
  "إعلان مكرر أو سبام",
  "سبب آخر",
];

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  userId: string;
}

const ReportModal = ({ open, onOpenChange, listingId, userId }: ReportModalProps) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("يرجى اختيار سبب الإبلاغ");
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
        toast.error("لقد أبلغت عن هذا الإعلان مسبقاً");
      } else {
        toast.error("حدث خطأ أثناء إرسال البلاغ");
      }
      return;
    }

    toast.success("تم إرسال البلاغ بنجاح، شكراً لمساعدتنا في تحسين المنصة");
    setReason("");
    setDetails("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>الإبلاغ عن إعلان مخالف</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-3">
            <Label>سبب الإبلاغ</Label>
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
            <Label>تفاصيل إضافية (اختياري)</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="أضف أي تفاصيل تساعدنا في مراجعة البلاغ..."
              maxLength={500}
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading || !reason} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            إرسال البلاغ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
