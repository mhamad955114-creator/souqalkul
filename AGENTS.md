# Project Architecture Rules

- Keep stored category, country, city, metadata keys, and option values language-neutral in behavior; localize only their displayed labels so existing listings and filters remain compatible.
- Admin-created packages live in `custom_plans` and map to a built-in base tier (featured/professional/business) for badge, glow and priority; listings store only the base tier so existing badge UI keeps working.
