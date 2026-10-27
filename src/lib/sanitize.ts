import DOMPurify from 'dompurify';

/** Sanitize merchant-authored or server-rendered HTML before injecting it into the page. */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['srcset'],
  });
}
