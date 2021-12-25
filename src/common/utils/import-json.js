import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export const importJson = (path) => require(path);
