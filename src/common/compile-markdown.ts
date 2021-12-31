import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';

const jsdom = new JSDOM('');
const { sanitize } = createDOMPurify(jsdom.window as unknown as Window);

export const compileMarkdown = (text: string) => marked.parse(sanitize(text, { ALLOWED_TAGS: ['div', 'br', 'a', 'b', 'i', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img'] }));
