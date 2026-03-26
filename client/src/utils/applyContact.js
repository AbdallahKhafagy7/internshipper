/**
 * Turn a user-entered apply URL or email into a safe href.
 */
export function resolveApplyHref(raw) {
  const s = (raw || '').trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^mailto:/i.test(s)) return s;
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(s) && !/\s/.test(s)) return `mailto:${s}`;
  if (/^\/\//.test(s)) return `https:${s}`;
  if (/[._\-]/.test(s) && !/\s/.test(s)) return `https://${s.replace(/^\/+/, '')}`;
  return `mailto:${s}`;
}
