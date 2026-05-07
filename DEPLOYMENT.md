# PicPick 部署與開啟方式

如果你按下 **Merge** 後「沒有反應」，這是正常的：Merge 只會合併程式碼，不會自動在你的電腦打開網頁。

## 方式 1：直接開啟單檔版

在 repo 根目錄直接開啟：

```txt
picpick.html
```

這個檔案已經把 CSS 與 JavaScript 打包在同一個 HTML 裡，最適合快速確認畫面。

## 方式 2：本機伺服器

```bash
npm install
npm run dev
```

然後開啟：

```txt
http://localhost:5173
```

## 方式 3：GitHub Pages

本 repo 已加入 `.github/workflows/deploy-pages.yml`。

1. 到 GitHub repo 的 **Settings → Pages**。
2. 將 Source 設為 **GitHub Actions**。
3. 合併或推送到 `main`、`master` 或 `work`。
4. 到 **Actions → Deploy PicPick to GitHub Pages** 等待部署完成。
5. 點開 workflow summary 裡的 Pages URL。

部署內容會包含：

- `index.html`
- `picpick.html`
- `src/*.js`
- `src/styles.css`
