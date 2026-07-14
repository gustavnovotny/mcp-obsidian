export const toolDefinitions = [
  {
    name: 'search-vault',
    title: 'Search Vault',
    description: 'Full-text search of note CONTENT. Be efficient: usually ONE search is enough. Use a SINGLE short keyword stem (e.g. "lyze", not "2023 lyzovani"). Space-separated terms are AND (all must appear in the SAME note), so do NOT combine unrelated concepts and do NOT include years/dates/numbers in the query (filter those by reading the note afterwards). For broader matches, OR a few synonyms: "git OR backup". To locate a note by its NAME/title, prefer search-by-title (it also matches the filename) or list-notes instead. Supports AND/OR/NOT, field specifiers (title:, content:, tag:), quoted phrases, parentheses.',
    inputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query over note content. Prefer a SINGLE short stem; combine synonyms with OR ("lyze OR ski"). Space-separated terms are AND (all required in one note) - do not include years/numbers or unrelated concepts. Supports AND/OR/NOT, field specifiers (title:, content:, tag:), quoted phrases, parentheses.',
          minLength: 1
        },
        path: {
          type: 'string',
          description: 'Optional path within vault to search',
        },
        caseSensitive: {
          type: 'boolean',
          description: 'Case sensitive search (default: false)',
          default: false
        },
        includeContext: {
          type: 'boolean',
          description: 'Include surrounding lines for context (default: true)',
          default: true
        },
        contextLines: {
          type: 'integer',
          description: 'Number of lines before and after match to include (default: 2)',
          default: 2,
          minimum: 0,
          maximum: 10
        },
        limit: {
          type: 'integer',
          description: 'Maximum number of matches to return (default: 100)',
          default: 100,
          minimum: 1,
          maximum: 500
        },
        offset: {
          type: 'integer',
          description: 'Number of matches to skip for pagination (default: 0)',
          default: 0,
          minimum: 0
        }
      },
      required: ['query'],
      additionalProperties: false
    },
    outputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        files: {
          type: 'array',
          description: 'List of files containing matches',
          items: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the file relative to vault root'
              },
              matchCount: {
                type: 'integer',
                description: 'Number of matches in this file',
                minimum: 1
              },
              matches: {
                type: 'array',
                description: 'List of matches in this file',
                items: {
                  type: 'object',
                  properties: {
                    line: {
                      type: 'integer',
                      description: 'Line number where match was found',
                      minimum: 1
                    },
                    content: {
                      type: 'string',
                      description: 'Content of the matching line'
                    },
                    context: {
                      type: 'object',
                      description: 'Context information if includeContext is true',
                      properties: {
                        lines: {
                          type: 'array',
                          description: 'Surrounding lines with line numbers',
                          items: {
                            type: 'object',
                            properties: {
                              number: {
                                type: 'integer',
                                description: 'Line number',
                                minimum: 1
                              },
                              text: {
                                type: 'string',
                                description: 'Line content'
                              },
                              isMatch: {
                                type: 'boolean',
                                description: 'Whether this is the matching line'
                              }
                            },
                            required: ['number', 'text', 'isMatch']
                          }
                        },
                        highlighted: {
                          type: 'string',
                          description: 'Matching line with search terms highlighted using **'
                        }
                      },
                      required: ['highlighted']
                    }
                  },
                  required: ['line', 'content']
                }
              }
            },
            required: ['path', 'matchCount', 'matches']
          }
        },
        totalMatches: {
          type: 'integer',
          description: 'Total number of matches across all files',
          minimum: 0
        },
        fileCount: {
          type: 'integer',
          description: 'Number of files containing matches',
          minimum: 0
        },
        filesSearched: {
          type: 'integer',
          description: 'Total number of files searched',
          minimum: 0
        },
        pagination: {
          type: 'object',
          description: 'Pagination metadata for iterating through results',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of matches across all pages',
              minimum: 0
            },
            returned: {
              type: 'integer',
              description: 'Number of matches returned in this response',
              minimum: 0
            },
            limit: {
              type: 'integer',
              description: 'Limit parameter used for this request',
              minimum: 1
            },
            offset: {
              type: 'integer',
              description: 'Offset parameter used for this request',
              minimum: 0
            },
            hasMore: {
              type: 'boolean',
              description: 'Whether there are more results available'
            }
          },
          required: ['total', 'returned', 'limit', 'offset', 'hasMore']
        }
      },
      required: ['files', 'totalMatches', 'fileCount', 'filesSearched', 'pagination'],
      additionalProperties: false
    }
  },
  {
    name: 'search-by-title',
    title: 'Search by Title',
    description: 'Find notes by title. Matches the note H1 heading, and falls back to the FILENAME when a note has no H1 (Obsidian uses the filename as the title). Best tool to locate a note by its name - e.g. query "lyze" finds "Lyze 2023.md".',
    inputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Title search query',
          minLength: 1
        },
        path: {
          type: 'string',
          description: 'Optional path within vault to search',
        },
        caseSensitive: {
          type: 'boolean',
          description: 'Case sensitive search (default: false)',
          default: false
        },
        limit: {
          type: 'integer',
          description: 'Maximum number of results to return (default: 100)',
          default: 100,
          minimum: 1,
          maximum: 1000
        },
        offset: {
          type: 'integer',
          description: 'Number of results to skip for pagination (default: 0)',
          default: 0,
          minimum: 0
        }
      },
      required: ['query'],
      additionalProperties: false
    },
    outputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              file: {
                type: 'string',
                description: 'Path to the file relative to vault root'
              },
              title: {
                type: 'string',
                description: 'The H1 title of the note'
              },
              line: {
                type: 'integer',
                description: 'Line number where title was found',
                minimum: 1
              }
            },
            required: ['file', 'title', 'line'],
            additionalProperties: false
          }
        },
        count: {
          type: 'integer',
          description: 'Number of results found',
          minimum: 0
        },
        filesSearched: {
          type: 'integer',
          description: 'Number of files searched',
          minimum: 0
        },
        pagination: {
          type: 'object',
          description: 'Pagination metadata',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of results across all pages',
              minimum: 0
            },
            returned: {
              type: 'integer',
              description: 'Number of results returned in this response',
              minimum: 0
            },
            limit: {
              type: 'integer',
              description: 'Limit parameter used',
              minimum: 1
            },
            offset: {
              type: 'integer',
              description: 'Offset parameter used',
              minimum: 0
            },
            hasMore: {
              type: 'boolean',
              description: 'Whether there are more results available'
            }
          },
          required: ['total', 'returned', 'limit', 'offset', 'hasMore']
        }
      },
      required: ['results', 'count', 'filesSearched', 'pagination'],
      additionalProperties: false
    }
  },
  {
    name: 'list-notes',
    title: 'List Notes',
    description: 'List all notes in the vault or a specific directory',
    inputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Directory path relative to vault root (optional)',
        },
        limit: {
          type: 'integer',
          description: 'Maximum number of notes to return (default: 100)',
          default: 100,
          minimum: 1,
          maximum: 1000
        },
        offset: {
          type: 'integer',
          description: 'Number of notes to skip for pagination (default: 0)',
          default: 0,
          minimum: 0
        }
      },
      additionalProperties: false
    },
    outputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        notes: {
          type: 'array',
          items: {
            type: 'string',
            description: 'Path to note relative to vault root'
          },
          description: 'List of note paths'
        },
        count: {
          type: 'integer',
          description: 'Total number of notes found',
          minimum: 0
        },
        pagination: {
          type: 'object',
          description: 'Pagination metadata',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of notes across all pages',
              minimum: 0
            },
            returned: {
              type: 'integer',
              description: 'Number of notes returned in this response',
              minimum: 0
            },
            limit: {
              type: 'integer',
              description: 'Limit parameter used',
              minimum: 1
            },
            offset: {
              type: 'integer',
              description: 'Offset parameter used',
              minimum: 0
            },
            hasMore: {
              type: 'boolean',
              description: 'Whether there are more notes available'
            }
          },
          required: ['total', 'returned', 'limit', 'offset', 'hasMore']
        }
      },
      required: ['notes', 'count', 'pagination'],
      additionalProperties: false
    }
  },
  {
    name: 'read-note',
    title: 'Read Note',
    description: 'Read the content of a specific note',
    inputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the note relative to vault root',
          minLength: 1,
          pattern: '\\.md$'
        },
      },
      required: ['path'],
      additionalProperties: false
    },
    // Output is unstructured text content, so no outputSchema
  },
  {
    name: 'write-note',
    title: 'Write Note',
    description: 'Create or update a note',
    inputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the note relative to vault root',
          minLength: 1,
          pattern: '\\.md$'
        },
        content: {
          type: 'string',
          description: 'Content of the note',
        },
      },
      required: ['path', 'content'],
      additionalProperties: false
    },
    // Output is just a success message, so no outputSchema
  },
  {
    name: 'append-note',
    title: 'Append to Note Section',
    description: 'Append a single markdown line to the end of a "## Section" in a note (e.g. a daily journal). Creates the note — optionally seeded from `createIfMissing` — and the section if either is missing. Never overwrites existing content and cannot delete.',
    inputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the note relative to vault root',
          minLength: 1,
          pattern: '\\.md$'
        },
        section: {
          type: 'string',
          description: 'Section heading text WITHOUT the leading "## " (e.g. "Osobní")',
          minLength: 1
        },
        line: {
          type: 'string',
          description: 'The exact markdown line to append (e.g. "- 14:03 ..." or "- [ ] ...")',
          minLength: 1
        },
        createIfMissing: {
          type: 'string',
          description: 'Optional full note content to seed the file if it does not exist yet (e.g. a rendered daily template)'
        }
      },
      required: ['path', 'section', 'line'],
      additionalProperties: false
    },
    // Output is just a success message, so no outputSchema
  },
  {
    name: 'complete-task',
    title: 'Complete Task',
    description: 'Mark a task done: find the best-matching OPEN "- [ ]" item under a "## Section" (e.g. Úkoly) and flip it to "- [x]". If none matches, append `line` under the section instead. Creates the note/section if missing. Never deletes.',
    inputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the note relative to vault root',
          minLength: 1,
          pattern: '\\.md$'
        },
        section: {
          type: 'string',
          description: 'Section heading text WITHOUT the leading "## " (e.g. "Úkoly")',
          minLength: 1
        },
        match: {
          type: 'string',
          description: 'The task text to match against existing open items (diacritics- and case-insensitive)',
          minLength: 1
        },
        line: {
          type: 'string',
          description: 'The completed line to append if no open task matches (e.g. "- [x] ...")',
          minLength: 1
        },
        createIfMissing: {
          type: 'string',
          description: 'Optional full note content to seed the file if it does not exist yet (e.g. a rendered daily template)'
        }
      },
      required: ['path', 'section', 'match', 'line'],
      additionalProperties: false
    },
    // Output is just a success message, so no outputSchema
  },
  {
    name: 'delete-note',
    title: 'Delete Note',
    description: 'Delete a note',
    inputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the note relative to vault root',
          minLength: 1,
          pattern: '\\.md$'
        },
      },
      required: ['path'],
      additionalProperties: false
    },
    // Output is just a success message, so no outputSchema
  },
  {
    name: 'search-by-tags',
    title: 'Search by Tags',
    description: 'Search for notes by tags (supports both frontmatter and inline tags)',
    inputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: {
            type: 'string',
            minLength: 1
          },
          description: 'Tags to search for (AND operation - notes must have all specified tags)',
          minItems: 1
        },
        directory: {
          type: 'string',
          description: 'Directory path relative to vault root (optional)',
        },
        caseSensitive: {
          type: 'boolean',
          description: 'Case sensitive tag matching (default: false)',
          default: false
        },
      },
      required: ['tags'],
      additionalProperties: false
    },
    outputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        notes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the note relative to vault root'
              },
              tags: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'All tags found in the note'
              }
            },
            required: ['path', 'tags'],
            additionalProperties: false
          },
          description: 'List of notes matching all specified tags'
        },
        count: {
          type: 'integer',
          description: 'Total number of matching notes',
          minimum: 0
        }
      },
      required: ['notes', 'count'],
      additionalProperties: false
    }
  },
  {
    name: 'get-note-metadata',
    title: 'Get Note Metadata',
    description: 'Get metadata for a specific note or all notes in the vault',
    inputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to a specific note (for single note mode)',
        },
        batch: {
          type: 'boolean',
          description: 'Enable batch mode to get metadata for all notes',
          default: false
        },
        directory: {
          type: 'string',
          description: 'In batch mode, limit to specific directory',
        },
        limit: {
          type: 'integer',
          description: 'Maximum number of notes to return in batch mode (default: 50)',
          default: 50,
          minimum: 1,
          maximum: 500
        },
        offset: {
          type: 'integer',
          description: 'Number of notes to skip for pagination in batch mode (default: 0)',
          default: 0,
          minimum: 0
        }
      },
      additionalProperties: false
    },
    outputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        // For single note mode
        path: {
          type: 'string',
          description: 'Path to the note'
        },
        frontmatter: {
          type: 'object',
          description: 'Parsed frontmatter metadata'
        },
        title: {
          type: ['string', 'null'],
          description: 'H1 title from content'
        },
        titleLine: {
          type: ['integer', 'null'],
          description: 'Line number of title'
        },
        hasContent: {
          type: 'boolean',
          description: 'Whether note has content'
        },
        contentLength: {
          type: 'integer',
          description: 'Total content length'
        },
        contentPreview: {
          type: 'string',
          description: 'Preview of content'
        },
        inlineTags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Inline tags found in content'
        },
        // For batch mode
        notes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              frontmatter: { type: 'object' },
              title: { type: ['string', 'null'] },
              titleLine: { type: ['integer', 'null'] },
              hasContent: { type: 'boolean' },
              contentLength: { type: 'integer' },
              contentPreview: { type: 'string' },
              inlineTags: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        count: {
          type: 'integer',
          description: 'Number of notes processed'
        },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              file: { type: 'string' },
              error: { type: 'string' }
            }
          }
        },
        pagination: {
          type: 'object',
          description: 'Pagination metadata for batch mode',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of notes across all pages',
              minimum: 0
            },
            returned: {
              type: 'integer',
              description: 'Number of notes returned in this response',
              minimum: 0
            },
            limit: {
              type: 'integer',
              description: 'Limit parameter used',
              minimum: 1
            },
            offset: {
              type: 'integer',
              description: 'Offset parameter used',
              minimum: 0
            },
            hasMore: {
              type: 'boolean',
              description: 'Whether there are more notes available'
            }
          },
          required: ['total', 'returned', 'limit', 'offset', 'hasMore']
        }
      },
      additionalProperties: false
    }
  },
  {
    name: 'discover-mocs',
    title: 'Discover MOCs',
    description: 'RECOMMENDED: Start here to explore the vault! Discover MOCs (Maps of Content) - organizational hub notes tagged with #moc that link to related content. MOCs provide a high-level map of the vault\'s knowledge structure. Use this tool first to understand how notes are organized, then drill down into specific areas of interest.',
    inputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        mocName: {
          type: 'string',
          description: 'Filter by specific MOC name (optional)',
        },
        directory: {
          type: 'string',
          description: 'Limit search to specific directory (optional)',
        },
      },
      additionalProperties: false
    },
    outputSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        mocs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the MOC relative to vault root'
              },
              title: {
                type: 'string',
                description: 'H1 title of the MOC'
              },
              tags: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'All tags found in the MOC'
              },
              linkedNotes: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Array of note names linked from this MOC (wikilinks)'
              },
              linkCount: {
                type: 'integer',
                description: 'Number of linked notes',
                minimum: 0
              },
              linkedMocs: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Array of linked notes that are themselves MOCs (subset of linkedNotes)'
              }
            },
            required: ['path', 'title', 'tags', 'linkedNotes', 'linkCount', 'linkedMocs'],
            additionalProperties: false
          },
          description: 'List of discovered MOCs with their linked notes'
        },
        count: {
          type: 'integer',
          description: 'Total number of MOCs found',
          minimum: 0
        }
      },
      required: ['mocs', 'count'],
      additionalProperties: false
    }
  },
];