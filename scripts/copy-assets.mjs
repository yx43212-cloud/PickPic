import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';

mkdirSync('dist/src', { recursive: true });
copyFileSync('index.html', 'dist/index.html');
copyFileSync('picpick.html', 'dist/picpick.html');
copyFileSync('src/styles.css', 'dist/src/styles.css');

for (const file of readdirSync('src')) {
  if (file.endsWith('.js')) {
    copyFileSync(`src/${file}`, `dist/src/${file}`);
  }
}
