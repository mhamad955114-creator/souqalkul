export type SubscriptionPlan = "free" | "featured" | "professional" | "business";

type SubscriptionLike = {
  created_at?: string;
  expires_at?: string | null;
  plan_type?: string | null;
  status?: string | null;
};

const subscriptionPriority: Record<SubscriptionPlan, number> = {
  free: 0,
  featured: 1,
  professional: 2,
  business: 3,
};

export const getSubscriptionPriority = (planType?: string | null) => {
  if (!planType) return subscriptionPriority.free;
  return subscriptionPriority[planType as SubscriptionPlan] ?? subscriptionPriority.free;
};

export const isSubscriptionActive = (subscription: SubscriptionLike) => {
  if (subscription.status !== "active") return false;
  if (!subscription.expires_at) return false;
  return new Date(subscription.expires_at) > new Date();
};

export const sortSubscriptionsByPriority = <T extends SubscriptionLike>(subscriptions: T[]) => {
  return [...subscriptions].sort((a, b) => {
    const priorityDiff = getSubscriptionPriority(b.plan_type) - getSubscriptionPriority(a.plan_type);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const aCreatedAt = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bCreatedAt = b.created_at ? new Date(b.created_at).getTime() : 0;

    return bCreatedAt - aCreatedAt;
  });
};

export const getEffectiveActiveSubscription = <T extends SubscriptionLike>(subscriptions: T[]) => {
  const activeSubscriptions = subscriptions.filter(isSubscriptionActive);
  return sortSubscriptionsByPriority(activeSubscriptions)[0] ?? null;
};

export const getEffectivePlanType = <T extends SubscriptionLike>(subscriptions: T[]) => {
  return getEffectiveActiveSubscription(subscriptions)?.plan_type ?? "free";
};