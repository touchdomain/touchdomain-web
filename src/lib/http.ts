/**
 * Build a `Content-Disposition` header that is safe for HTTP (Latin-1 only)
 * while still carrying a full UTF-8 filename via the RFC 5987 `filename*`
 * form. Non-ASCII characters in a raw header value throw a ByteString error.
 */
export function contentDisposition(filename: string, type: 'inline' | 'attachment' = 'inline'): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, "'");
  return `${type}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
