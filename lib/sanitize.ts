import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window as unknown as Window;
const DOMPurify = createDOMPurify(window as any);

export function sanitizeHtml(dirty: string){
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ALLOWED_ATTR: ['class','style','href','target','rel','src','alt'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|ftp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-]|$))/i
  });
}
