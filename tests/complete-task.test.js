import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { completeTask } from '../src/tools.js';
import { MCPError } from '../src/errors.js';

let vault;
beforeEach(async () => { vault = await mkdtemp(path.join(tmpdir(), 'vault-')); });
afterEach(async () => { await rm(vault, { recursive: true, force: true }); });

describe('completeTask', () => {
  it('ticks an existing open task', async () => {
    await mkdir(path.join(vault, 'journals'), { recursive: true });
    await writeFile(path.join(vault, 'journals/d.md'), '# d\n\n## Úkoly\n- [ ] zavolat zubaři\n', 'utf-8');
    const res = await completeTask(vault, 'journals/d.md', 'Úkoly', 'Zavolat Zubaři', '- [x] Zavolat Zubaři');
    expect(res.ticked).toBe(true);
    const out = await readFile(path.join(vault, 'journals/d.md'), 'utf-8');
    expect(out).toContain('- [x] zavolat zubaři');
  });

  it('creates the file and appends [x] when no open task matches', async () => {
    const tmpl = '---\ntype: daily\n---\n# d\n\n## Úkoly\n';
    const res = await completeTask(vault, 'journals/d.md', 'Úkoly', 'cokoli', '- [x] cokoli', tmpl);
    expect(res.ticked).toBe(false);
    const out = await readFile(path.join(vault, 'journals/d.md'), 'utf-8');
    expect(out).toContain('## Úkoly\n- [x] cokoli');
  });

  it('rejects a non-markdown path', async () => {
    await expect(completeTask(vault, 'journals/x.txt', 'Úkoly', 'a', '- [x] a')).rejects.toBeInstanceOf(MCPError);
  });
});
