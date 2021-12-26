import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';

const jsdom = new JSDOM('');
const { sanitize } = createDOMPurify(jsdom.window);

/**
 *
 * @param {string} text
 * @returns
 */
export const compileMarkdown = text => marked.parse(sanitize(text, { ALLOWED_TAGS: ['div', 'br', 'a', 'b', 'i', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img'] }));
