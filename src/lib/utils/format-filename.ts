const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\u0000-\u001F]/g
const RESERVED_DOTS_AND_SPACES = /[.\s]+$/g
const MULTIPLE_WHITESPACE = /\s+/g

export function formatFilename(input: string, fallback = 'file'): string {
  const normalized = input.normalize('NFKD')
  const sanitized = normalized
    .replace(INVALID_FILENAME_CHARS, '')
    .replace(MULTIPLE_WHITESPACE, '_')
    .replace(RESERVED_DOTS_AND_SPACES, '')
    .trim()

  return sanitized.length > 0 ? sanitized : fallback
}
