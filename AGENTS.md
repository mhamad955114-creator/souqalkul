# Project Architecture Rules

- Keep stored category, country, city, metadata keys, and option values language-neutral in behavior; localize only their displayed labels so existing listings and filters remain compatible.
- Admin-created packages live in `custom_plans`, map to a built-in base tier for badge and priority, and store `custom_plan_key` on listings so each package can apply its own two-color glow.
- Listing keyword search uses the normalized `listings.search_text` column maintained by a database trigger so Arabic spelling variants, descriptions, locations, categories, and metadata remain searchable efficiently.
- Listing detail information, description, and location use a dedicated tabbed presentation module with display-only localization to keep stored listing data unchanged.
