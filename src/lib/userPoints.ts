/**
 * نظام النقاط: يُحسب تلقائياً من باقة المستخدم + عدد إعلاناته النشطة.
 * لا يوجد جدول خاص — القيم مشتقّة، لذلك تبقى دائماً متوافقة مع الواقع.
 */

export const PLAN_POINTS: Record<string, number> = {
  free: 0,
  featured: 20,
  professional: 50,
  business: 100,
};

/** نقاط لكل إعلان نشط */
export const POINTS_PER_ACTIVE_LISTING = 5;

export interface PointsInput {
  planType?: string | null;
  activeListings?: number | null;
  isVerified?: boolean | null;
}

/** نقاط إضافية للحساب الموثّق */
export const VERIFIED_BONUS_POINTS = 10;

export const calculateUserPoints = ({
  planType,
  activeListings,
  isVerified,
}: PointsInput): number => {
  const planPoints = PLAN_POINTS[planType || "free"] ?? 0;
  const listingPoints = Math.max(0, activeListings || 0) * POINTS_PER_ACTIVE_LISTING;
  const verifiedPoints = isVerified ? VERIFIED_BONUS_POINTS : 0;
  return planPoints + listingPoints + verifiedPoints;
};

export type PointsTier = {
  key: "bronze" | "silver" | "gold" | "platinum";
  label: string;
  minPoints: number;
};

export const POINTS_TIERS: PointsTier[] = [
  { key: "platinum", label: "بلاتيني", minPoints: 150 },
  { key: "gold", label: "ذهبي", minPoints: 80 },
  { key: "silver", label: "فضي", minPoints: 30 },
  { key: "bronze", label: "برونزي", minPoints: 0 },
];

export const getPointsTier = (points: number): PointsTier =>
  POINTS_TIERS.find((tier) => points >= tier.minPoints) ?? POINTS_TIERS[POINTS_TIERS.length - 1];

export const formatPoints = (points: number) => new Intl.NumberFormat("en-US").format(points);
