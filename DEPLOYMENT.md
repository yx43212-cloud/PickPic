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
3. 如果你看到 `Get Pages site failed`、`Not Found` 或 `Configure Pages` 失敗，代表第 2 步還沒設定完成。
4. 合併或推送到 `main`、`master` 或 `work`。
5. 到 **Actions → Deploy PicPick to GitHub Pages** 等待部署完成。
6. 點開 workflow summary 裡的 Pages URL。


### Configure Pages 顯示 Not Found 是什麼意思？

這不是 PicPick 程式碼壞掉，而是 GitHub repo 尚未建立 Pages site。`actions/configure-pages` 會呼叫 GitHub Pages API；如果 repo 的 Pages 沒有啟用，API 會回 `404 Not Found`，所以你會看到 `Get Pages site failed`。

解法：

1. 打開 GitHub repo。
2. 進入 **Settings → Pages**。
3. Source 選 **GitHub Actions**。
4. 回到 **Actions**，重新執行 `Deploy PicPick to GitHub Pages`。

目前 workflow 已加入預檢：如果 Pages 尚未啟用，它會在 summary 顯示設定方式並跳過部署，不會再直接卡在 Configure Pages。

部署內容會包含：

- `index.html`
- `picpick.html`
- `src/*.js`
- `src/styles.css`

## 方式 4：Vercel

本 repo 已加入 `vercel.json`，可以直接 Import 到 Vercel。

1. 到 Vercel 選 **Add New Project**。
2. 選這個 GitHub repo。
3. 確認設定：
   - Framework Preset：Other / Static
   - Build Command：`npm run build`
   - Output Directory：`dist`
4. 按 Deploy。

如果 Vercel 沒自動部署，請檢查：

- Vercel 專案是否真的連到這個 GitHub repo。
- Production Branch 是否是你 merge 的分支。
- GitHub App / Vercel 權限是否允許讀取 repo。
- Deployments 裡是否有 build error。
