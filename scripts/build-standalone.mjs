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
    <div id="root">
      <div class="app-shell">
        <main class="hero-grid">
          <section class="hero-card hero-main">
            <span class="eyebrow">AI 照片編輯提示詞生成器</span>
            <h1>PicPick 已載入</h1>
            <p>如果你一直看到這段文字，代表瀏覽器阻擋或中斷了 JavaScript。請改用 npm run dev 開啟 http://localhost:5173，或重新部署最新版本。</p>
            <div class="hero-actions">
              <a class="fallback-button primary" href="./picpick.html">開啟 PicPick 單檔版</a>
            </div>
          </section>
        </main>
      </div>
    </div>
    <script>
try {
${js}
} catch (error) {
  console.error('PicPick failed to start:', error);
  const root = document.querySelector('#root');
  if (root) {
    root.insertAdjacentHTML('afterbegin', '<div style="position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;padding:14px 16px;border-radius:14px;background:#fee2e2;color:#991b1b;border:1px solid #fecaca;font:14px system-ui;box-shadow:0 10px 30px rgba(0,0,0,.12)">PicPick 啟動時發生錯誤，請開啟瀏覽器 Console 查看細節，或改用 npm run dev / 重新部署最新版本。</div>');
  }
}
    </script>
  </body>
</html>
`;

writeFileSync('picpick.html', html);
writeFileSync('index.html', html);
