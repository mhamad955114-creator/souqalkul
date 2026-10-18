import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Firebase phone authentication configuration", () => {
  it("uses the uploaded Firebase project for Android and token verification", () => {
    const config = JSON.parse(readFileSync("android/app/google-services.json", "utf8"));
    const verifier = readFileSync("supabase/functions/phone-auth/index.ts", "utf8");
    const project = verifier.match(/const FIREBASE_PROJECT_ID = "([^"]+)";/)?.[1];
    expect(config.project_info.project_id).toBe("souk-alkul");
    expect(project).toBe(config.project_info.project_id);
    expect(verifier).toContain("issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`");
    expect(verifier).toContain("audience: FIREBASE_PROJECT_ID");
  });

  it("keeps the registered Android package compatible with the application", () => {
    const config = JSON.parse(readFileSync("android/app/google-services.json", "utf8"));
    const gradle = readFileSync("android/app/build.gradle", "utf8");
    const applicationId = gradle.match(/applicationId "([^"]+)"/)?.[1];
    expect(applicationId).toBe("app.souqalkul");
    expect(config.client[0].client_info.android_client_info.package_name).toBe(applicationId);
  });
});