import { URL } from 'url';

export const getDomainName = (link: string) => new URL(link).hostname.replace(/^(www\.)/, '');
