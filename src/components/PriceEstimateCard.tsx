import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, TrendingUp, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export interface PriceEstimateDraft {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  city?: string;
  country?: string;
  metadata?: Record<string, unknown> | null;
}

interface PriceEstimateResult {
  fair_min?: number;
  fair_max?: number;
  currency?: string;
  verdict?: string;
  confidence?: string;
  summary?: string;
  reasons?: string[];
  tips?: string[];
  comparables_count?: number;
}

interface Props {
  listingId?: string;
  draft?: PriceEstimateDraft;
  /** Compact variant used inside the add/edit listing forms */
  compact?: boolean;
}

const verdictStyles: Record<string, string> = {
  "منخفض": "bg-blue-500/10 text-blue-600 border-blue-500/30",
  "مناسب": "bg-green-500/10 text-green-600 border-green-500/30",
  "مرتفع": "bg-destructive/10 text-destructive border-destructive/30",
};

const formatNumber = (value?: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)
    : "—";

const PriceEstimateCard = ({ listingId, draft, compact = false }: Props) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriceEstimateResult | null>(null);

  const canEstimate = !!listingId || (!!draft?.title && !!draft?.category);

  const runEstimate = async () => {
    if (!canEstimate) {
      toast.error("أكمل عنوان الإعلان والتصنيف أولاً");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-price-estimate", {
        body: listingId ? { listingId } : { listing: draft },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setResult(data as PriceEstimateResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذّر تقييم السعر";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const body = (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold">تقييم السعر بالذكاء الاصطناعي</span>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={runEstimate} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
          <span className="ms-1">{result ? "إعادة التقييم" : "قيّم السعر"}</span>
        </Button>
      </div>

      {!result && !loading && (
        <p className="text-xs text-muted-foreground">
          نقارن هذا الإعلان بإعلانات مشابهة في نفس التصنيف والبلد لنقترح نطاق سعر عادل.
        </p>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {result.verdict && (
              <Badge
                variant="outline"
                className={verdictStyles[result.verdict] || "bg-muted text-muted-foreground"}
              >
                السعر {result.verdict}
              </Badge>
            )}
            {result.confidence && (
              <Badge variant="secondary" className="text-xs">
                دقة التقدير: {result.confidence}
              </Badge>
            )}
            {typeof result.comparables_count === "number" && (
              <Badge variant="secondary" className="text-xs">
                إعلانات مقارنة: {formatNumber(result.comparables_count)}
              </Badge>
            )}
          </div>

          <div className="rounded-lg bg-muted/50 px-3 py-2">
            <p className="text-xs text-muted-foreground mb-1">النطاق العادل المقترح</p>
            <p className="text-base font-bold" dir="ltr">
              {formatNumber(result.fair_min)} - {formatNumber(result.fair_max)} {result.currency}
            </p>
          </div>

          {result.summary && <p className="text-sm">{result.summary}</p>}

          {!!result.reasons?.length && (
            <ul className="space-y-1">
              {result.reasons.map((reason, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-primary">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          )}

          {!!result.tips?.length && (
            <div className="space-y-1">
              <p className="text-xs font-bold flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5 text-primary" />
                نصائح
              </p>
              {result.tips.map((tip, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  • {tip}
                </p>
              ))}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            هذا تقدير تقريبي بالذكاء الاصطناعي وليس سعراً رسمياً.
          </p>
        </div>
      )}
    </div>
  );

  if (compact) {
    return <div className="rounded-lg border border-border p-3">{body}</div>;
  }

  return <Card className="p-4">{body}</Card>;
};

export default PriceEstimateCard;
