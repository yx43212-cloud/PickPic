import { accessories, accessoryModes, ageModes, basicSliders, colorPalettes, expertSliders, frameSliders, frames, layouts, lights, locations, moods, outfits, outputs, photoTypes, styleCategories, styles, textSliders, textStyles } from './data.js';
import { assemblePrompt, createInitialState } from './promptEngine.js';
import { deletePreset, loadPresets, upsertPreset } from './storage.js';
import { GeneratorState, Mode, Option, PromptResult, SliderConfig, SliderKey, UserPreset } from './types.js';

type Page = 'home' | 'basic' | 'expert' | 'result' | 'library' | 'comic';
const root = document.querySelector<HTMLDivElement>('#root')!;
let page: Page = 'home';
let state: GeneratorState = createInitialState('basic');
let result: PromptResult = assemblePrompt(state);

const basicIds = {
  location: ['location-1', 'location-2', 'location-3', 'location-6', 'location-8', 'location-10'],
  outfit: ['outfit-1', 'outfit-2', 'outfit-3', 'outfit-4', 'outfit-5', 'outfit-6', 'outfit-7', 'outfit-8'],
  accessory: ['accessory-1', 'accessory-2', 'accessory-3', 'accessory-4', 'accessory-5', 'accessory-6', 'accessory-7', 'accessory-8'],
  palette: ['palette-1', 'palette-2', 'palette-3', 'palette-4', 'palette-5', 'palette-6', 'palette-7'],
  mood: ['mood-1', 'mood-2', 'mood-3', 'mood-4', 'mood-5', 'mood-6', 'mood-7', 'mood-8'],
  frame: ['frame-1', 'frame-2', 'frame-3', 'frame-4', 'frame-5', 'frame-6'],
  layout: ['layout-1', 'layout-6', 'layout-8', 'layout-15', 'layout-11'],
  output: ['output-1', 'output-2', 'output-3', 'output-4', 'output-5', 'output-6', 'output-7']
};

const html = (strings: TemplateStringsArray, ...values: unknown[]) => strings.reduce((out, part, i) => out + part + String(values[i] ?? ''), '');
const esc = (value: unknown) => String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const optionById = <T extends { id: string }>(items: T[], id: string) => items.find((item) => item.id === id) ?? items[0];
const filterIds = <T extends Option>(items: T[], ids?: string[]) => ids ? items.filter((item) => ids.includes(item.id)) : items;

function navigate(next: Page) { page = next; render(); }
function start(mode: Mode, preset?: GeneratorState) { state = { ...(preset ?? createInitialState(mode)), mode }; navigate(mode); }
function generate() { result = assemblePrompt(state); navigate('result'); }
function update<K extends keyof GeneratorState>(key: K, value: GeneratorState[K]) { state = { ...state, [key]: value }; render(); }
function setSlider(key: SliderKey, value: number) { state = { ...state, sliders: { ...state.sliders, [key]: value } }; }

function shell(content: string) {
  root.innerHTML = html`<div class="app-shell"><nav class="topbar"><button class="brand" data-nav="home">✨ PicPick</button><div class="nav-actions"><button data-start="basic">快速生成</button><button data-start="expert">進階客製</button><button data-nav="library">我的風格庫</button><button class="comic-nav" data-nav="comic">🐱 上班毛很多</button></div></nav>${content}</div>`;
  bindCommon();
}
function bindCommon() {
  root.querySelectorAll<HTMLElement>('[data-nav]').forEach((el) => el.onclick = () => navigate(el.dataset.nav as Page));
  root.querySelectorAll<HTMLElement>('[data-start]').forEach((el) => el.onclick = () => start(el.dataset.start as Mode));
}
function modeCard(icon: string, title: string, desc: string, action: string, data: string) {
  return html`<button class="mode-card" ${data}><div class="mode-icon">${icon}</div><h3>${title}</h3><p>${desc}</p><span>${action} →</span></button>`;
}
function renderHome() {
  shell(html`<main class="hero-grid"><section class="hero-card hero-main"><span class="eyebrow">AI 照片編輯提示詞生成器</span><h1>用選項與拉桿，快速生成可直接丟給 AI 工具的照片提示詞。</h1><p>PicPick 不是修圖軟體，而是把你的照片想法整理成完整、精簡、負面提示詞與專屬風格碼的創作助手。</p><div class="hero-actions"><button class="primary" data-start="basic">🚀 開始快速生成</button><button data-start="expert">🎚️ 進入高手版</button><button data-nav="comic">🐱 做上班毛很多漫畫</button></div></section>${modeCard('🪄', '快速生成', '菜鳥版：只顯示大分類與常用選項，照著步驟選風格、微調、產提示詞。', '適合第一次使用', 'data-start="basic"')}${modeCard('🎚️', '進階客製', '高手版：完整模組展開，支援分類、搜尋、文字與框線細項，保留極高客製化彈性。', '適合 AI 創作者', 'data-start="expert"')}${modeCard('📚', '我的風格庫', '儲存常用組合、模板與風格碼，可再次套用、編輯或刪除。', '管理常用風格', 'data-nav="library"')}${modeCard('🐱', '上班毛很多 GPT', '點進去直接複製系統提示詞與單集模板，製作 9:16 直幅 6–8 格健康漫畫。', '開始做漫畫', 'data-nav="comic"')}</main>`);
}
function optionGrid(items: Option[], selected: string, key: keyof GeneratorState, compact = false) {
  return html`<div class="option-grid ${compact ? 'compact' : ''}">${items.map((item) => html`<button data-update="${String(key)}" data-value="${item.id}" class="${selected === item.id ? 'selected' : ''}"><strong>${esc(item.label)}</strong>${compact ? '' : `<span>${esc(item.description ?? item.category ?? item.prompt)}</span>`}</button>`).join('')}</div>`;
}
function selectRow(label: string, items: Option[], value: string, key: keyof GeneratorState | 'text.align') {
  return html`<label class="select-row"><span>${label}</span><select data-select="${String(key)}">${items.map((item) => html`<option value="${item.id}" ${value === item.id ? 'selected' : ''}>${item.category ? `${esc(item.category)}｜` : ''}${esc(item.label)}</option>`).join('')}</select></label>`;
}
function sliders(configs: SliderConfig[]) {
  return html`<div class="slider-grid">${configs.map((c) => html`<label class="slider"><div><span>${c.label}</span><b>${state.sliders[c.key]}</b></div><input data-slider="${c.key}" type="range" min="0" max="100" value="${state.sliders[c.key]}"><small>${c.minLabel}<em>${c.maxLabel}</em></small></label>`).join('')}</div>`;
}
function palettes(items: typeof colorPalettes) {
  return html`<div class="palette-grid">${items.map((p) => html`<button data-update="palette" data-value="${p.id}" class="${state.palette === p.id ? 'selected' : ''}"><span>${esc(p.label)}</span><div>${Object.values(p.colors).map((c) => `<i style="background:${c}"></i>`).join('')}</div></button>`).join('')}</div>`;
}
function panel(title: string, body: string, open = false) { return html`<details class="panel" ${open ? 'open' : ''}><summary>${title}</summary><div class="panel-body">${body}</div></details>`; }
function preview() {
  const palette = optionById(colorPalettes, state.palette);
  return html`<section class="panel sticky-preview"><label class="upload-box">⬆️<strong>上傳照片</strong><span>支援預覽，不會離開瀏覽器</span><input id="photoInput" type="file" accept="image/*"></label><div class="preview-card" style="background:${palette.colors.background}"><div class="mock-photo">${state.photoPreview ? `<img src="${state.photoPreview}" alt="照片預覽">` : '📷<span>照片預覽卡</span>'}</div><div class="swatches"><i style="background:${palette.colors.primary}"></i><i style="background:${palette.colors.accent}"></i><i style="background:${palette.colors.text}"></i></div></div></section>`;
}
function renderGenerator(mode: Mode) {
  const basic = mode === 'basic';
  const styleOptions = basic ? styleCategories : styles.filter((s) => s.category === state.styleCategory).slice(0, 30);
  shell(html`<main class="page-wrap"><header class="page-header"><div><span class="eyebrow">${basic ? '基礎客製化（菜鳥版）' : '極度客製化（高手版）'}</span><h1>${basic ? '三步驟快速產生提示詞' : '完整控制每個照片提示詞模組'}</h1><p>${basic ? '只保留最常用選項，先選風格，再用少量 BAR 微調。' : '所有模組完整展開，可分類篩選、搜尋與調整細節。'}</p></div><button class="primary" id="generateBtn">✨ 生成提示詞</button></header><div class="generator-grid">${preview()}<section class="panel-list">${panel('1. 照片類型 / 人物模式', optionGrid(photoTypes, state.photoType, 'photoType'), true)}${panel('2. 年紀與畫風', selectRow('年紀', ageModes, state.age, 'age') + (basic ? optionGrid(styleOptions, state.styleCategory, 'styleCategory') : `<div class="tabs">${styleCategories.map((c) => `<button data-update="styleCategory" data-value="${c.id}" class="${state.styleCategory === c.id ? 'active' : ''}">${c.label}</button>`).join('')}</div>${optionGrid(styleOptions, state.style, 'style')}`), true)}${panel('3. BAR 微調', sliders(basic ? basicSliders : expertSliders), true)}${panel('4. 光線、地點、服裝', selectRow('光線', basic ? lights.slice(0, 7) : lights, state.light, 'light') + selectRow('地點', filterIds(locations, basic ? basicIds.location : undefined), state.location, 'location') + selectRow('服裝', filterIds(outfits, basic ? basicIds.outfit : undefined), state.outfit, 'outfit'))}${panel('5. 配件、配色、氛圍', selectRow('配件模式', accessoryModes, state.accessoryMode, 'accessoryMode') + selectRow('配件', filterIds(accessories, basic ? basicIds.accessory : undefined), state.accessory, 'accessory') + palettes(filterIds(colorPalettes, basic ? basicIds.palette : undefined)) + selectRow('氛圍', filterIds(moods, basic ? basicIds.mood : undefined), state.mood, 'mood'))}${panel('6. 框線、排版、用途', optionGrid(filterIds(frames, basic ? basicIds.frame : undefined), state.frame, 'frame', true) + (basic ? '' : sliders(frameSliders)) + selectRow('排版', filterIds(layouts, basic ? basicIds.layout : undefined), state.layout, 'layout') + selectRow('用途', filterIds(outputs, basic ? basicIds.output : undefined), state.output, 'output'))}${panel('7. 文字內容（可選）', renderTextFields(basic))}</section></div></main>`);
  bindGenerator();
}
const comicSystemPrompt = `你是「上班毛很多」的連載漫畫製作 GPT。你的任務是把單一營養健康觀念，改寫成 9:16 直幅、6–8 格、文字精簡、可直接交給 AI 繪圖或短影片製作的繁體中文漫畫腳本。

固定角色：
1. 灰藍短毛貓＝醫師貓：拿聽診器、看報告、指向問題。冷靜、專業、微厭世。負責判斷問題。
2. 橘胖貓＝貪吃營養貓：負責外食、蛋白質、便當、火鍋、超商。貪吃但懂吃。
3. 黑貓＝運動提醒貓：負責活動、伸展、代謝、久坐、睡眠。動作快，像教練。
4. 白色長毛貓＝療癒照護貓：負責喝水、暖身、休息、壓力、腸胃保養。溫柔照顧型。
5. 豹貓＝效率執行貓：負責整理、快速改菜單、準備餐盒、替換不健康食物。俐落、行動派。

硬性規則：
- 一集只講 1 個健康觀念。
- 每集 6–8 格，不可少於 6 格，不可超過 8 格。
- 版面必須是 9:16 直幅漫畫。
- 每格台詞要短，每格最多 1 句主要台詞。
- 內容要能傳達單一營養健康故事：問題、提醒、可執行做法、收尾金句。
- 不要塞入多個健康主題，不要做成百科文章。
- 不要做醫療診斷，不承諾療效。
- 使用繁體中文。

輸出格式固定包含：集數、標題、本集健康觀念、主角貓、配角貓、6–8 格分鏡、收尾金句、AI 繪圖總提示詞、負面提示詞。`;

const comicEpisodeTemplate = `請製作「上班毛很多」第 2 集。

健康觀念：早餐先補蛋白質，不只喝甜飲
想出現的主角貓：橘胖貓
想出現的配角貓：灰藍短毛貓、豹貓
場景：貓咪公司茶水間
觀眾痛點：早上只喝含糖飲，還沒中午就餓
希望語氣：輕鬆、可愛、微吐槽、不要說教

請輸出：
1. 6–8 格 9:16 直幅漫畫腳本
2. 每格畫面描述
3. 每格精簡台詞
4. 最後一句健康金句
5. 可直接給 AI 繪圖工具使用的總提示詞
6. 負面提示詞

限制：一集只講這一個健康觀念，不要加入第二個主題。`;

const comicOneLinePrompt = '請用上班毛很多格式，做一集 9:16 直幅 6 格漫畫。主題：便當醬汁分開放，鈉量比較好控制。';

async function copyText(text: string, message = '已複製') {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
  const msg = root.querySelector<HTMLElement>('#copyMsg');
  if (msg) msg.textContent = `｜${message}`;
}

function comicCopyBox(title: string, desc: string, text: string, id: string) {
  return html`<section class="prompt-box comic-copy-box"><div><h3>${title}</h3><button data-copy-comic="${id}">📋 複製</button></div><p>${desc}</p><pre>${esc(text)}</pre></section>`;
}

function renderComicSystem() {
  shell(html`<main class="page-wrap"><header class="page-header"><div><span class="eyebrow">上班毛很多 GPT</span><h1>這裡就可以按：複製 → 貼到 ChatGPT</h1><p>操作方式很簡單：先按「複製系統提示詞」貼到自訂 GPT 的 Instructions；之後每集按「複製單集模板」貼到對話框，改健康觀念就能產生漫畫。<span id="copyMsg"></span></p></div><div class="hero-actions"><button class="primary" data-copy-comic="episode">先複製單集模板</button><button data-copy-comic="system">複製系統提示詞</button></div></header><section class="comic-steps"><article><b>1</b><h3>按這裡複製系統提示詞</h3><p>只要第一次設定自訂 GPT 時使用。</p><button class="primary" data-copy-comic="system">📋 複製系統提示詞</button></article><article><b>2</b><h3>貼到 Custom GPT Instructions</h3><p>如果不建立自訂 GPT，也可以直接貼到一般 ChatGPT 對話。</p></article><article><b>3</b><h3>按這裡複製每集模板</h3><p>把健康觀念、角色、場景改成你要的內容。</p><button class="primary" data-copy-comic="episode">📋 複製單集模板</button></article></section><div class="result-grid">${comicCopyBox('系統提示詞（貼到自訂 GPT Instructions）', '建立漫畫 GPT 時貼這段，之後角色與格式就會固定。', comicSystemPrompt, 'system')}${comicCopyBox('單集模板（每次做新一集貼這段）', '改集數、健康觀念、角色與場景，就會產出 6–8 格腳本。', comicEpisodeTemplate, 'episode')}${comicCopyBox('最短提示詞（懶人用）', '不想填模板時，複製這句再把主題換掉。', comicOneLinePrompt, 'oneLine')}<section class="prompt-box comic-copy-box"><div><h3>按完後貼去哪？</h3></div><ol><li>按上面的複製按鈕。</li><li>開 ChatGPT 或你的自訂 GPT。</li><li>貼上內容並送出。</li><li>把產出的「AI 繪圖總提示詞」再貼到繪圖工具。</li></ol><p>這個頁面目前負責「產生可複製的漫畫 GPT 指令」，不會直接在本機畫圖。</p></section></div></main>`);
  bindCommon();
  const copyMap: Record<string, string> = { system: comicSystemPrompt, episode: comicEpisodeTemplate, oneLine: comicOneLinePrompt };
  root.querySelectorAll<HTMLElement>('[data-copy-comic]').forEach((el) => el.onclick = () => copyText(copyMap[el.dataset.copyComic!], '已複製，現在貼到 ChatGPT'));
}

function renderTextFields(basic: boolean) {
  const fields = basic ? ['title', 'subtitle'] : ['title', 'subtitle', 'body', 'slogan', 'cta', 'brand', 'details', 'note'];
  const labels: Record<string, string> = { title: '主標題', subtitle: '副標題', body: '內文說明', slogan: '重點標語', cta: 'CTA 行動句', brand: '名字 / 品牌名 / 活動名', details: '日期 / 地點 / 價格 / 聯絡資訊', note: '備註文字' };
  return html`<label class="switch"><input id="textEnabled" type="checkbox" ${state.text.enabled ? 'checked' : ''}>要放文字嗎？</label>${state.text.enabled ? selectRow('字體風格', textStyles, state.textStyle, 'textStyle') + `<div class="text-fields">${fields.map((f) => `<input data-text="${f}" placeholder="${labels[f]}" value="${esc(state.text[f as keyof typeof state.text])}">`).join('')}</div>` + (basic ? '' : selectRow('對齊方式', ['左對齊', '置中', '右對齊'].map((label) => ({ id: label, label, prompt: label })), state.text.align, 'text.align') + sliders(textSliders)) : ''}`;
}
function bindGenerator() {
  bindCommon();
  root.querySelector('#generateBtn')?.addEventListener('click', generate);
  root.querySelector('#photoInput')?.addEventListener('change', (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) update('photoPreview', URL.createObjectURL(file)); });
  root.querySelectorAll<HTMLElement>('[data-update]').forEach((el) => el.onclick = () => { const key = el.dataset.update as keyof GeneratorState; const value = el.dataset.value!; if (key === 'styleCategory') { state.style = styles.find((s) => s.category === value)?.id ?? state.style; } update(key, value as never); });
  root.querySelectorAll<HTMLSelectElement>('[data-select]').forEach((el) => el.onchange = () => { if (el.dataset.select === 'text.align') { state.text.align = el.value as typeof state.text.align; render(); } else update(el.dataset.select as keyof GeneratorState, el.value as never); });
  root.querySelectorAll<HTMLInputElement>('[data-slider]').forEach((el) => el.oninput = () => { setSlider(el.dataset.slider as SliderKey, Number(el.value)); el.closest('.slider')!.querySelector('b')!.textContent = el.value; });
  root.querySelector('#textEnabled')?.addEventListener('change', (e) => { state.text.enabled = (e.target as HTMLInputElement).checked; render(); });
  root.querySelectorAll<HTMLInputElement>('[data-text]').forEach((el) => el.oninput = () => { (state.text as unknown as Record<string, string>)[el.dataset.text!] = el.value; });
}
function promptBox(title: string, text: string, id: string) { return html`<section class="prompt-box"><div><h3>${title}</h3><button data-copy="${id}">📋 複製</button></div><pre>${esc(text)}</pre></section>`; }
function renderResult() {
  shell(html`<main class="page-wrap"><header class="page-header"><div><span class="eyebrow">結果頁</span><h1>已生成 4 種輸出</h1><p>風格碼：<strong>${result.styleCode}</strong><span id="copyMsg"></span></p></div><div class="hero-actions"><button data-nav="${state.mode}">返回編輯</button><button class="primary" id="regen">重新生成</button><button id="savePreset">💾 儲存我的風格</button></div></header><div class="result-grid">${promptBox('完整提示詞', result.fullPrompt, 'fullPrompt')}${promptBox('精簡提示詞', result.shortPrompt, 'shortPrompt')}${promptBox('負面提示詞', result.negativePrompt, 'negativePrompt')}${promptBox('專屬風格碼', result.styleCode, 'styleCode')}</div></main>`);
  bindCommon();
  root.querySelector('#regen')?.addEventListener('click', generate);
  root.querySelectorAll<HTMLElement>('[data-copy]').forEach((el) => el.onclick = async () => { await navigator.clipboard.writeText((result as unknown as Record<string, string>)[el.dataset.copy!]); root.querySelector('#copyMsg')!.textContent = '｜已複製'; });
  root.querySelector('#savePreset')?.addEventListener('click', () => { const name = window.prompt('請輸入風格名稱', `${result.styleCode} 常用風格`) ?? result.styleCode; upsertPreset({ id: crypto.randomUUID(), name, createdAt: new Date().toISOString(), state, result }); alert('已儲存到我的風格庫'); });
}
function renderLibrary() {
  const items = loadPresets().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  shell(html`<main class="page-wrap"><header class="page-header"><div><span class="eyebrow">我的風格庫</span><h1>常用設定與風格碼</h1><p>所有資料暫存在本機 localStorage，可套用、編輯或刪除。</p></div></header>${items.length === 0 ? '<section class="empty">尚未儲存風格。請先到結果頁按「儲存我的風格」。</section>' : `<div class="library-grid">${items.map((p) => `<article class="preset-card"><span>${p.result.styleCode}</span><h3>${esc(p.name)}</h3><p>${esc(p.result.shortPrompt)}</p><div><button class="primary" data-apply="${p.id}">再次套用</button><button data-edit="${p.id}">編輯</button><button data-delete="${p.id}">🗑️ 刪除</button></div></article>`).join('')}</div>`}</main>`);
  bindCommon();
  root.querySelectorAll<HTMLElement>('[data-apply]').forEach((el) => el.onclick = () => { const preset = loadPresets().find((p) => p.id === el.dataset.apply) as UserPreset; start(preset.state.mode, preset.state); });
  root.querySelectorAll<HTMLElement>('[data-delete]').forEach((el) => el.onclick = () => { deletePreset(el.dataset.delete!); renderLibrary(); });
  root.querySelectorAll<HTMLElement>('[data-edit]').forEach((el) => el.onclick = () => { const items = loadPresets(); const preset = items.find((p) => p.id === el.dataset.edit); const name = preset && window.prompt('編輯風格名稱', preset.name); if (preset && name) { preset.name = name; localStorage.setItem('picpick_user_presets', JSON.stringify(items)); renderLibrary(); } });
}
function render() { if (page === 'home') renderHome(); else if (page === 'result') renderResult(); else if (page === 'library') renderLibrary(); else if (page === 'comic') renderComicSystem(); else renderGenerator(page); }
render();
