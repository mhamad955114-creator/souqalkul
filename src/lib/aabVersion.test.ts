import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { verifyAabVersion } from '../../scripts/verify-aab-version.mjs';

describe('generated AAB version gate', () => {
  let directory;
  let aab;
  let tool;
  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'aab-version-'));
    aab = join(directory, 'app.aab');
    tool = join(directory, 'bundletool.jar');
    writeFileSync(aab, 'fixture');
    writeFileSync(tool, 'fixture');
  });
  afterEach(() => rmSync(directory, { recursive: true, force: true }));
  const manifest = (code, name) => (_command, args) => ({
    status: 0, stdout: `${args.at(-1).endsWith('versionCode') ? code : name}\n`, stderr: '',
  });
  it('accepts only release 26 (1.0.26)', () => {
    expect(verifyAabVersion(aab, tool, 26, '1.0.26', manifest('26', '1.0.26')))
      .toEqual({ code: '26', name: '1.0.26' });
  });
  it('blocks the previously uploaded release 23', () => {
    expect(() => verifyAabVersion(aab, tool, 26, '1.0.26', manifest('23', '1.0.23')))
      .toThrow('Upload blocked');
  });
  it('blocks release 25 even if the bundle file is renamed', () => {
    expect(() => verifyAabVersion(aab, tool, 26, '1.0.26', manifest('25', '1.0.25')))
      .toThrow('Upload blocked');
  });
  it('blocks a mismatched version name', () => {
    expect(() => verifyAabVersion(aab, tool, 26, '1.0.26', manifest('26', '1.0.25')))
      .toThrow('Upload blocked');
  });
  it('fails closed when bundletool cannot inspect the actual bundle', () => {
    expect(() => verifyAabVersion(aab, tool, 26, '1.0.26', () => ({ status: 1, stderr: 'Invalid bundle' })))
      .toThrow('Cannot read AAB');
  });
  it('blocks a missing bundle', () => {
    rmSync(aab);
    expect(() => verifyAabVersion(aab, tool, 26, '1.0.26', manifest('26', '1.0.26')))
      .toThrow('Required file not found');
  });
});