# PicPick

PicPick 是一個繁體中文 AI 照片編輯提示詞生成 Web App。它不是傳統修圖工具，而是透過照片上傳、卡片式選項與滑桿微調，自動組裝可用於 ChatGPT、Midjourney、Grok、Gemini、可靈、即夢等工具的提示詞。

## 立刻開啟

如果你只是想馬上看到畫面，不想跑任何指令：

1. 直接打開 repo 根目錄的 `picpick.html`。
2. 這是完整打包的單檔版本，包含 UI、樣式、假資料與提示詞生成邏輯。

## 使用本機伺服器開啟

```bash
npm install
npm run dev
```

然後開啟：

```txt
http://localhost:5173
```

`npm run dev` 會啟動本機靜態伺服器，載入 `index.html` 與 `src/main.js`。


## Merge 之後為什麼沒有畫面？

按下 GitHub 的 **Merge** 只代表程式碼被合併到分支，瀏覽器不會自動跳出 App，也不等於已經部署到公開網址。

合併後請用其中一種方式開啟：

1. **最直接**：在 repo 裡打開 `picpick.html`。
2. **本機預覽**：執行 `npm run dev`，再開 `http://localhost:5173`。
3. **線上預覽**：本 repo 已加入 GitHub Pages workflow；合併到 `main`、`master` 或 `work` 後，到 GitHub 的 **Actions → Deploy PicPick to GitHub Pages** 查看部署結果與 Pages 網址。

> 你截圖中的 `Get Pages site failed / Not Found` 就是 GitHub Pages 尚未啟用造成的。請先到 repo 的 **Settings → Pages**，將 Source 設為 **GitHub Actions**，再重新執行 workflow。現在 workflow 會先檢查 Pages 是否啟用；若尚未啟用，會用提示訊息跳過部署，避免直接在 Configure Pages 爆紅。


## Vercel 部署

本專案現在可直接串 Vercel：

1. 到 Vercel 選 **Add New Project**。
2. Import 這個 GitHub repo。
3. Vercel 會讀取 `vercel.json`：
   - Build Command：`npm run build`
   - Output Directory：`dist`
   - Framework：Other / Static
4. 部署完成後開啟 Vercel 給你的網址。

如果之前按 Merge 後 Vercel 沒反應，通常是因為 repo 沒有連到 Vercel 專案、Vercel 沒有正確的 Output Directory，或 build script 依賴未安裝的 TypeScript 編譯器。現在 build 已改成使用已提交的瀏覽器版 JS 產生 `dist/`，不需要額外 npm 套件即可部署。

## 功能

- 首頁提供「快速生成」、「進階客製」、「我的風格庫」三個入口。
- 菜鳥版採分步驟流程與精簡選項，讓新手快速完成提示詞。
- 高手版展開完整模組，支援 200 種畫風、100 種地點、服裝、配件、配色、氛圍、框線、用途，以及 50 種排版的可擴充假資料。
- 支援照片預覽、照片類型 / 人物模式、年紀、畫風、BAR 微調、光線、地點、服裝、配件、配色、氛圍、框線、排版、用途、文字內容與字體風格。
- 結果頁輸出完整提示詞、精簡提示詞、負面提示詞與專屬風格碼，並支援一鍵複製。
- 我的風格庫使用 localStorage 儲存常用設定，可再次套用、編輯與刪除。

## 建置

```bash
npm run build
```

建置流程會：

1. 複製 `index.html`、`picpick.html`、`src/*.js` 與 CSS 到 `dist/`。
2. 重新產生可直接雙擊開啟的 `picpick.html` 單檔版。
3. 如需檢查 TypeScript 型別，可另外執行 `npm run typecheck`。

如果只想檢視已建置的輸出，可執行：

```bash
npm run preview
```
