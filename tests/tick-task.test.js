import { describe, it, expect } from 'vitest';
import { tickOrAppendTask } from '../src/journal.js';

const doc = `# 2026-07-14

## Úkoly
- [ ] zavolat zubaři
- [x] koupit mléko
- [ ] Zaplatit fakturu ČSOB
`;

describe('tickOrAppendTask', () => {
  it('ticks an exact match, diacritics- and case-insensitive', () => {
    const { ticked, content } = tickOrAppendTask(doc, 'Úkoly', 'Zavolat Zubaři', '- [x] Zavolat Zubaři');
    expect(ticked).toBe(true);
    expect(content).toContain('- [x] zavolat zubaři');
    expect(content).not.toContain('- [ ] zavolat zubaři');
  });

  it('ticks via substring match', () => {
    const { ticked, content } = tickOrAppendTask(doc, 'Úkoly', 'zaplatit fakturu', '- [x] zaplatit fakturu');
    expect(ticked).toBe(true);
    expect(content).toContain('- [x] Zaplatit fakturu ČSOB');
  });

  it('ticks the LAST matching open task when several match', () => {
    const d = `## Úkoly\n- [ ] běh\n- [ ] běh\n`;
    const { ticked, content } = tickOrAppendTask(d, 'Úkoly', 'běh', '- [x] běh');
    expect(ticked).toBe(true);
    expect(content).toBe('## Úkoly\n- [ ] běh\n- [x] běh\n');
  });

  it('does not touch already-checked lines; appends when no open match', () => {
    const { ticked, content } = tickOrAppendTask(doc, 'Úkoly', 'koupit mléko', '- [x] koupit mléko');
    expect(ticked).toBe(false);
    // original checked line stays + a new one is appended → two occurrences
    expect((content.match(/- \[x\] koupit mléko/g) || []).length).toBe(2);
  });

  it('appends and creates the section when it is missing', () => {
    const { ticked, content } = tickOrAppendTask('# d\n', 'Úkoly', 'cokoli', '- [x] cokoli');
    expect(ticked).toBe(false);
    expect(content).toContain('## Úkoly\n- [x] cokoli');
  });
});
