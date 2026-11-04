# Firebase phone login release

- [x] Detect authentication phone country independently of the browsing market, allow manual choice, and normalize local/international numbers consistently.

- [x] Keep registration and login fields scrollable within the visible keyboard viewport; configure Android resize behavior.

- [x] Prepare the native release with versionCode 25 / versionName 1.0.25 for the next store upload.
- [x] Link the matching Firebase messaging project and verify credentials with a delivery-free validation request.
- [ ] Verify notification delivery on a physical Android device: requires installing the latest APK and granting notification permission.

- [x] Import the original uploaded Firebase configuration and align the phone token verifier.
- [x] Deploy the phone authentication function; configuration tests pass and the live endpoint rejects missing tokens.
- [ ] Verify SMS delivery and successful native login: requires a physical Android device and Firebase SMS settings.
- [ ] Produce and deliver the new AAB: local Java and Android SDK are unavailable; use the existing GitHub build workflow.
- [ ] Upload the AAB to Play Console: requires the user's authenticated Play Console access.- [ ] Apply DB trigger `gate_listing_notifications` (listing_notification_toggles) — blocked: backend database unavailable during platform incident
- [ ] Wire `admin_settings.email_preferences` (admin alert email / enabled) into email sending once the email domain is verified
