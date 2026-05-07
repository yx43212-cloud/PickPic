import { copyFileSync, readdirSync } from 'node:fs';

for (const file of readdirSync('dist/src')) {
  if (file.endsWith('.js')) {
    copyFileSync(`dist/src/${file}`, `src/${file}`);
  }
}
