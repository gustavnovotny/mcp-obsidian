import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { appendNote } from '../src/tools.js';
import { MCPError } from '../src/errors.js';

let vault;
beforeEach(async () => { vault = await mkdtemp(path.join(tmpdir(), 'vault-')); });
afterEach(async () => { await rm(vault, { recursive: true, force: true }); });

describe('appendNote', () => {
  it('creates the file from createIfMissing and appends under the section', async () => {
    const tmpl = '---\ntype: daily\n---\n# 2026-07-14\n\n## Osobní\n\n## Úkoly\n';
    await appendNote(vault, 'journals/2026-07-14.md', 'Osobní', '- 08:00 běh', tmpl);
    const out = await readFile(path.join(vault, 'journals/2026-07-14.md'), 'utf-8');
    expect(out).toContain('## Osobní\n- 08:00 běh');
    expect(out).toContain('type: daily');
  });
  it('appends into an existing file', async () => {
    await mkdir(path.join(vault, 'journals'), { recursive: true });
    await writeFile(path.join(vault, 'journals/d.md'), '# d\n\n## Úkoly\n- [ ] a\n', 'utf-8');
    await appendNote(vault, 'journals/d.md', 'Úkoly', '- [x] b');
    const out = await readFile(path.join(vault, 'journals/d.md'), 'utf-8');
    expect(out).toContain('- [ ] a\n- [x] b');
  });
  it('rejects a non-markdown path', async () => {
    await expect(appendNote(vault, 'journals/x.txt', 'Osobní', '- x')).rejects.toBeInstanceOf(MCPError);
  });
});
