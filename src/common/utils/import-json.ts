import { createRequire } from 'module';

const requireFile = createRequire(import.meta.url);

export const importJson = (path: string) => requireFile(path);
