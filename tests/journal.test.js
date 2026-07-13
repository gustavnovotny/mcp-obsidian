import { describe, it, expect } from 'vitest';
import { appendUnderSection } from '../src/journal.js';

const doc = `---\ntype: daily\n---\n# 2026-07-14\n\n## Osobní\n\n## Pracovní\n- 09:00 stand-up\n\n## Úkoly\n`;

describe('appendUnderSection', () => {
  it('appends after existing bullets, before the next heading', () => {
    const out = appendUnderSection(doc, 'Pracovní', '- 10:00 review');
    expect(out).toContain('- 09:00 stand-up\n- 10:00 review\n\n## Úkoly');
  });
  it('appends right after an empty section heading', () => {
    const out = appendUnderSection(doc, 'Osobní', '- 08:00 běh');
    expect(out).toContain('## Osobní\n- 08:00 běh\n\n## Pracovní');
  });
  it('creates the section at EOF when missing', () => {
    const out = appendUnderSection(doc, 'Nápady & úvahy', '- myšlenka');
    expect(out.endsWith('## Nápady & úvahy\n- myšlenka\n')).toBe(true);
  });
  it('supports task checkbox lines', () => {
    const out = appendUnderSection(doc, 'Úkoly', '- [ ] zavolat X');
    expect(out).toContain('## Úkoly\n- [ ] zavolat X\n');
  });
  it('does not disturb other sections', () => {
    const out = appendUnderSection(doc, 'Osobní', '- 08:00 běh');
    expect(out).toContain('## Pracovní\n- 09:00 stand-up');
  });
});
