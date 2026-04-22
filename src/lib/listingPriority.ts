const badgePriority: Record<string, number> = {
  business: 0,
  professional: 1,
  featured: 2,
};

const getListingPriority = (badgeType?: string | null, isFeatured?: boolean | null) => {
  if (badgeType && badgeType in badgePriority) {
    return badgePriority[badgeType];
  }

  if (isFeatured) {
    return badgePriority.featured;
  }

  return 3;
};

export const sortListingsByPromotionPriority = <T extends { badge_type?: string | null; is_featured?: boolean | null; created_at?: string }>(
  listings: T[]
) => {
  return [...listings].sort((a, b) => {
    const priorityDiff = getListingPriority(a.badge_type, a.is_featured) - getListingPriority(b.badge_type, b.is_featured);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;

    return bTime - aTime;
  });
};