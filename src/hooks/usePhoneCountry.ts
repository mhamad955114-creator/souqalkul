import { useEffect, useState } from "react";
import { countries } from "@/lib/constants";
import { phoneCountryByCode, timezonePhoneCountry } from "@/lib/authPhone";

let detection: Promise<string | undefined> | undefined;
function detectPhoneCountry() {
  if (!detection) {
    detection = fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(2500) })
      .then(async (response) => response.ok ? (await response.json()).country_code as string : undefined)
      .catch(() => undefined);
  }
  return detection;
}

export function usePhoneCountry() {
  const [manualCode, setManualCode] = useState<string | undefined>();
  const [detectedCode, setDetectedCode] = useState(() =>
    timezonePhoneCountry(Intl.DateTimeFormat().resolvedOptions().timeZone)?.code ??
    phoneCountryByCode(localStorage.getItem("detectedPhoneCountry"))?.code ?? countries[0].code
  );
  useEffect(() => {
    let cancelled = false;
    detectPhoneCountry().then((code) => {
      const detected = phoneCountryByCode(code);
      if (!cancelled && detected) {
        setDetectedCode(detected.code);
        localStorage.setItem("detectedPhoneCountry", detected.code);
      }
    });
    return () => { cancelled = true; };
  }, []);
  return {
    phoneCountry: phoneCountryByCode(manualCode ?? detectedCode) ?? countries[0],
    setPhoneCountry: setManualCode,
  };
}