const { URL } = require('url');

export const getDomainName = link => new URL(link).hostname.replace(/^(www\.)/, '');
