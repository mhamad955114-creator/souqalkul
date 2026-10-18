# Firebase phone login release

- [x] Import the original uploaded Firebase configuration and align the phone token verifier.
- [x] Deploy the phone authentication function; configuration tests pass and the live endpoint rejects missing tokens.
- [ ] Verify SMS delivery and successful native login: requires a physical Android device and Firebase SMS settings.
- [ ] Produce and deliver the new AAB: local Java and Android SDK are unavailable; use the existing GitHub build workflow.
- [ ] Upload the AAB to Play Console: requires the user's authenticated Play Console access.