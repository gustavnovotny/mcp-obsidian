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
