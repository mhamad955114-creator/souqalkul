/**
 * Detects the "stale bundle" class of root crashes: the browser keeps an old
 * pre-bundled React while the app code is refreshed, so hook calls land on a
 * null React instance and the whole screen blanks. These need a cache-busted
 * reload rather than a plain retry, so the signature lives in one place.
 */
const STALE_BUNDLE_PATTERNS = [
  /cannot read properties of (?:null|undefined) \(reading ['"]use[a-z]/i,
  /invalid hook call/i,
  /hooks can only be called inside the body of a function component/i,
  /chunkloaderror|loading chunk|failed to fetch dynamically imported module|importing a module script failed/i,
];

export const isStaleBundleError = (error: unknown): boolean => {
  const message =
    error instanceof Error ? `${error.message} ${error.stack ?? ""}` : String(error ?? "");
  return STALE_BUNDLE_PATTERNS.some((pattern) => pattern.test(message));
};
