/**
 * Append `line` at the end of the "## <section>" block in markdown `content` (pure).
 * If the section heading is absent, append the heading + line at EOF.
 * Section end = the next line that starts a new "## " heading, else EOF.
 * @param {string} content - The full markdown content
 * @param {string} section - Section heading text without the leading "## "
 * @param {string} line - The exact markdown line to append
 * @returns {string} The updated markdown
 */
export function appendUnderSection(content, section, line) {
  const heading = `## ${section}`;
  const lines = content.split('\n');
  const headingIdx = lines.findIndex((l) => l.trim() === heading);

  if (headingIdx === -1) {
    const base = content.endsWith('\n') ? content : `${content}\n`;
    return `${base}\n${heading}\n${line}\n`;
  }

  let end = lines.length;
  for (let i = headingIdx + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) { end = i; break; }
  }
  let insertAt = end;
  while (insertAt > headingIdx + 1 && lines[insertAt - 1].trim() === '') insertAt--;
  lines.splice(insertAt, 0, line);
  return lines.join('\n');
}

/** Normalize a task string for matching: lowercase, strip diacritics, trailing punctuation, collapse spaces. */
function normalizeTask(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[.,!?;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Complete a task: find the best-matching OPEN `- [ ]` item under "## <section>" and flip it to
 * `- [x]`; if none matches, append `line` under the section instead. Pure.
 * Matching (on the task text): exact-normalized first, else substring either way; when several
 * match, the LAST (most recent) wins. Already-checked items are ignored.
 * @returns {{ ticked: boolean, content: string }}
 */
export function tickOrAppendTask(content, section, match, line) {
  const heading = `## ${section}`;
  const lines = content.split('\n');
  const headingIdx = lines.findIndex((l) => l.trim() === heading);
  const nm = normalizeTask(match);

  if (headingIdx !== -1 && nm) {
    let end = lines.length;
    for (let i = headingIdx + 1; i < lines.length; i++) {
      if (/^##\s/.test(lines[i])) { end = i; break; }
    }
    let bestExact = -1;
    let bestSub = -1;
    for (let i = headingIdx + 1; i < end; i++) {
      const m = lines[i].match(/^(\s*[-*]\s+)\[ \]\s+(.*)$/);
      if (!m) continue;
      const nt = normalizeTask(m[2]);
      if (nt === nm) bestExact = i;
      else if (nt.includes(nm) || nm.includes(nt)) bestSub = i;
    }
    const idx = bestExact !== -1 ? bestExact : bestSub;
    if (idx !== -1) {
      lines[idx] = lines[idx].replace('[ ]', '[x]');
      return { ticked: true, content: lines.join('\n') };
    }
  }
  return { ticked: false, content: appendUnderSection(content, section, line) };
}
