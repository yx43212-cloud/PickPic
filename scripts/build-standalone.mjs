import { readFileSync, writeFileSync } from 'node:fs';

const css = readFileSync('src/styles.css', 'utf8');
const moduleFiles = ['src/data.js', 'src/promptEngine.js', 'src/storage.js', 'src/main.js'];
const js = moduleFiles
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n\n')
  .replace(/^import .*;\n/gm, '')
  .replace(/\bexport const\b/g, 'const')
  .replace(/\bexport let\b/g, 'let')
  .replace(/\bexport function\b/g, 'function')
  .replace(/\bexport class\b/g, 'class')
  .replace(/\nexport \{\};\n?/g, '\n');

const html = `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PicPick｜可直接開啟版</title>
    <style>
${css}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
${js}
    </script>
  </body>
</html>
`;

writeFileSync('picpick.html', html);
writeFileSync('index.html', html);
