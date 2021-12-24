import { URL } from 'url';

export const getDomainName = link => new URL(link).hostname.replace(/^(www\.)/, '');
