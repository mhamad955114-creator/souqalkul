import { appendFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function verifyAabVersion(aab, bundletool, expectedCode, expectedName, run = spawnSync) {
  if (!/^\d+$/.test(String(expectedCode)) || !expectedName) {
    throw new Error('Expected versionCode and versionName are required.');
  }
  for (const file of [aab, bundletool]) {
    if (!existsSync(file)) throw new Error(`Required file not found: ${file}`);
  }
  const readAttribute = (attribute) => {
    const result = run('java', ['-jar', bundletool, 'dump', 'manifest',
      `--bundle=${aab}`, '--module=base', `--xpath=/manifest/@android:${attribute}`],
    { encoding: 'utf8' });
    if (result.error || result.status !== 0) {
      throw new Error(`Cannot read AAB ${attribute}: ${result.error?.message || result.stderr || 'bundletool failed'}`);
    }
    return result.stdout.trim();
  };
  const code = readAttribute('versionCode');
  const name = readAttribute('versionName');
  if (code !== String(expectedCode) || name !== expectedName) {
    throw new Error(`AAB rejected: expected ${expectedCode} (${expectedName}), found ${code} (${name}). Upload blocked.`);
  }
  return { code, name };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [aab, bundletool, code, name] = process.argv.slice(2);
    const verified = verifyAabVersion(aab, bundletool, code, name);
    const message = `AAB verified: versionCode ${verified.code}, versionName ${verified.name}`;
    console.log(message);
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Verified Android bundle\n\n${message}\n\nFile: \`${aab}\`\n`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}