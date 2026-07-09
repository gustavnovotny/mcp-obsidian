import { describe, it, expect } from 'vitest';
import { toolEnabled } from '../src/server.js';
import { validateWriteRoot } from '../src/security.js';
import { MCPError } from '../src/errors.js';

const vault = '/test/vault';

describe('toolEnabled — write policy', () => {
  const nonWrite = ['search-vault', 'search-by-title', 'list-notes', 'read-note', 'search-by-tags', 'get-note-metadata', 'discover-mocs'];

  it('exposes everything when not read-only', () => {
    const policy = { readOnly: false, writeRoot: null };
    for (const t of [...nonWrite, 'write-note', 'delete-note']) {
      expect(toolEnabled(t, policy)).toBe(true);
    }
  });

  it('hides both write tools in pure read-only mode', () => {
    const policy = { readOnly: true, writeRoot: null };
    expect(toolEnabled('write-note', policy)).toBe(false);
    expect(toolEnabled('delete-note', policy)).toBe(false);
    for (const t of nonWrite) expect(toolEnabled(t, policy)).toBe(true);
  });

  it('exposes only write-note (never delete-note) in constrained-write mode', () => {
    const policy = { readOnly: true, writeRoot: '00_Inbox' };
    expect(toolEnabled('write-note', policy)).toBe(true);
    expect(toolEnabled('delete-note', policy)).toBe(false);
    for (const t of nonWrite) expect(toolEnabled(t, policy)).toBe(true);
  });
});

describe('validateWriteRoot — path constraint', () => {
  it('is a no-op when writeRoot is falsy', () => {
    expect(() => validateWriteRoot(vault, '30_Knowledge/x.md', null)).not.toThrow();
    expect(() => validateWriteRoot(vault, '30_Knowledge/x.md', '')).not.toThrow();
  });

  it('allows a note directly under the write root', () => {
    expect(() => validateWriteRoot(vault, '00_Inbox/note.md', '00_Inbox')).not.toThrow();
  });

  it('allows a note nested under the write root', () => {
    expect(() => validateWriteRoot(vault, '00_Inbox/2026/note.md', '00_Inbox')).not.toThrow();
  });

  it('rejects a note outside the write root', () => {
    expect(() => validateWriteRoot(vault, '30_Knowledge/note.md', '00_Inbox')).toThrow(MCPError);
  });

  it('rejects a sibling that merely shares the root prefix', () => {
    // "00_Inboxen" must not be treated as inside "00_Inbox"
    expect(() => validateWriteRoot(vault, '00_Inboxen/note.md', '00_Inbox')).toThrow(MCPError);
  });

  it('rejects path traversal that escapes the write root', () => {
    expect(() => validateWriteRoot(vault, '00_Inbox/../_Private/secret.md', '00_Inbox')).toThrow(MCPError);
  });
});
