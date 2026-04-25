// Detects when a new version of the app has been deployed by polling
// index.html and comparing the main script asset hash against the one
// loaded on initial page load. When a change is detected, dispatches the
// `sw-update-ready` window event so UpdateNotification can prompt the user.

const CHECK_INTERVAL_MS = 2 * 60 * 1000; // every 2 minutes
const SCRIPT_REGEX = /<script[^>]+src=["']([^"']+\.js)["']/gi;
const LINK_REGEX = /<link[^>]+href=["']([^"']+\.css)["']/gi;

let initialFingerprint: string | null = null;
let timer: number | null = null;
let started = false;

const collectFingerprint = (html: string): string => {
  const assets: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = SCRIPT_REGEX.exec(html)) !== null) {
    assets.push(match[1]);
  }
  while ((match = LINK_REGEX.exec(html)) !== null) {
    assets.push(match[1]);
  }
  return assets.sort().join("|");
};

const fetchIndexHtml = async (): Promise<string | null> => {
  try {
    const res = await fetch(`/?_v=${Date.now()}`, {
      cache: "no-store",
      credentials: "same-origin",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
};

const checkForUpdate = async () => {
  if (document.hidden) return;
  const html = await fetchIndexHtml();
  if (!html) return;
  const fingerprint = collectFingerprint(html);
  if (!fingerprint) return;

  if (!initialFingerprint) {
    initialFingerprint = fingerprint;
    return;
  }

  if (fingerprint !== initialFingerprint) {
    window.dispatchEvent(new Event("sw-update-ready"));
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }
};

export const startVersionCheck = () => {
  if (started) return;
  started = true;

  // Capture initial fingerprint shortly after load
  void checkForUpdate();

  timer = window.setInterval(() => {
    void checkForUpdate();
  }, CHECK_INTERVAL_MS);

  // Also re-check whenever the user returns to the tab
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) void checkForUpdate();
  });

  window.addEventListener("focus", () => {
    void checkForUpdate();
  });
};
