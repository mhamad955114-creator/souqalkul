# Project Architecture Rules

- Keep stored category, country, city, metadata keys, and option values language-neutral in behavior; localize only their displayed labels so existing listings and filters remain compatible.
- Admin-created packages live in `custom_plans`, map to a built-in base tier for badge and priority, and store `custom_plan_key` on listings so each package can apply its own two-color glow.
- Listing keyword search uses the normalized `listings.search_text` column maintained by a database trigger so Arabic spelling variants, descriptions, locations, categories, and metadata remain searchable efficiently.
- Listing publisher/contact, details/description, and location use one dedicated three-tab presentation module with display-only localization to avoid duplicate content and preserve stored listing data.
- Store localized home headline overrides in the existing public listing settings and share a query between the hero and admin editor, so saved changes appear without altering translation defaults or unrelated content.
- Keep the listing video upload limit in one shared constant that both the client-side validation and every localized warning/label read, so the enforced size and the advertised size can never drift apart.
- When a root crash's message shows React hooks resolving on a null or undefined instance (a stale pre-bundled React), recover automatically once per session by purging caches and reloading with a cache-busted URL; other root errors keep showing the manual retry card so genuine bugs are never hidden behind a reload loop.
