# PicPick 部署與開啟方式

如果你按下 **Merge** 後「沒有反應」，這是正常的：Merge 只會合併程式碼，不會自動在你的電腦打開網頁。


## 空白頁排查

若看到空白頁，最常見原因是 HTML 還在載入外部 ES module，但瀏覽器或部署環境沒有成功載入 JS。現在 `index.html` 與 `picpick.html` 都已改成單檔版，正常情況下直接打開就會看到 PicPick 首頁。

請確認：

1. 重新 pull / merge 到包含最新修正的 commit。
2. 若部署到 Vercel 或 Pages，確認部署內容使用最新的 `index.html`。
3. 本機可執行 `npm run build` 後再開 `index.html`，它會重新產生單檔版。

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
4. 到 **Actions → Deploy PicPick to GitHub Pages**。
5. 按 **Run workflow** 手動部署。
6. 部署完成後，點開 workflow summary 裡的 Pages URL。


### Configure Pages 顯示 Not Found 是什麼意思？

這不是 PicPick 程式碼壞掉，而是 GitHub repo 尚未建立 Pages site。`actions/configure-pages` 會呼叫 GitHub Pages API；如果 repo 的 Pages 沒有啟用，API 會回 `404 Not Found`，所以你會看到 `Get Pages site failed`。

解法：

1. 打開 GitHub repo。
2. 進入 **Settings → Pages**。
3. Source 選 **GitHub Actions**。
4. 回到 **Actions**，重新執行 `Deploy PicPick to GitHub Pages`。

目前 workflow 的 push check 只做靜態檔案存在檢查，避免每次 Merge 都自動部署失敗；真正 Pages 部署改成手動執行，並加入預檢。如果 Pages 尚未啟用，它會在 summary 顯示設定方式並跳過部署，不會再直接卡在 Configure Pages。

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
