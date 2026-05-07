import { accessories, accessoryModes, ageModes, basicSliders, colorPalettes, expertSliders, frameSliders, frames, layouts, lights, locations, moods, outfits, outputs, photoTypes, styleCategories, styles, textSliders, textStyles } from './data.js';
import { assemblePrompt, createInitialState } from './promptEngine.js';
import { deletePreset, loadPresets, upsertPreset } from './storage.js';
const root = document.querySelector('#root');
let page = 'home';
let state = createInitialState('basic');
let result = assemblePrompt(state);
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
const html = (strings, ...values) => strings.reduce((out, part, i) => out + part + String(values[i] ?? ''), '');
const esc = (value) => String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const optionById = (items, id) => items.find((item) => item.id === id) ?? items[0];
const filterIds = (items, ids) => ids ? items.filter((item) => ids.includes(item.id)) : items;
function navigate(next) { page = next; render(); }
function start(mode, preset) { state = { ...(preset ?? createInitialState(mode)), mode }; navigate(mode); }
function generate() { result = assemblePrompt(state); navigate('result'); }
function update(key, value) { state = { ...state, [key]: value }; render(); }
function setSlider(key, value) { state = { ...state, sliders: { ...state.sliders, [key]: value } }; }
function shell(content) {
    root.innerHTML = html `<div class="app-shell"><nav class="topbar"><button class="brand" data-nav="home">✨ PicPick</button><div class="nav-actions"><button data-start="basic">快速生成</button><button data-start="expert">進階客製</button><button data-nav="library">我的風格庫</button></div></nav>${content}</div>`;
    bindCommon();
}
function bindCommon() {
    root.querySelectorAll('[data-nav]').forEach((el) => el.onclick = () => navigate(el.dataset.nav));
    root.querySelectorAll('[data-start]').forEach((el) => el.onclick = () => start(el.dataset.start));
}
function modeCard(icon, title, desc, action, data) {
    return html `<button class="mode-card" ${data}><div class="mode-icon">${icon}</div><h3>${title}</h3><p>${desc}</p><span>${action} →</span></button>`;
}
function renderHome() {
    shell(html `<main class="hero-grid"><section class="hero-card hero-main"><span class="eyebrow">AI 照片編輯提示詞生成器</span><h1>用選項與拉桿，快速生成可直接丟給 AI 工具的照片提示詞。</h1><p>PicPick 不是修圖軟體，而是把你的照片想法整理成完整、精簡、負面提示詞與專屬風格碼的創作助手。</p><div class="hero-actions"><button class="primary" data-start="basic">🚀 開始快速生成</button><button data-start="expert">🎚️ 進入高手版</button></div></section>${modeCard('🪄', '快速生成', '菜鳥版：只顯示大分類與常用選項，照著步驟選風格、微調、產提示詞。', '適合第一次使用', 'data-start="basic"')}${modeCard('🎚️', '進階客製', '高手版：完整模組展開，支援分類、搜尋、文字與框線細項，保留極高客製化彈性。', '適合 AI 創作者', 'data-start="expert"')}${modeCard('📚', '我的風格庫', '儲存常用組合、模板與風格碼，可再次套用、編輯或刪除。', '管理常用風格', 'data-nav="library"')}</main>`);
}
function optionGrid(items, selected, key, compact = false) {
    return html `<div class="option-grid ${compact ? 'compact' : ''}">${items.map((item) => html `<button data-update="${String(key)}" data-value="${item.id}" class="${selected === item.id ? 'selected' : ''}"><strong>${esc(item.label)}</strong>${compact ? '' : `<span>${esc(item.description ?? item.category ?? item.prompt)}</span>`}</button>`).join('')}</div>`;
}
function selectRow(label, items, value, key) {
    return html `<label class="select-row"><span>${label}</span><select data-select="${String(key)}">${items.map((item) => html `<option value="${item.id}" ${value === item.id ? 'selected' : ''}>${item.category ? `${esc(item.category)}｜` : ''}${esc(item.label)}</option>`).join('')}</select></label>`;
}
function sliders(configs) {
    return html `<div class="slider-grid">${configs.map((c) => html `<label class="slider"><div><span>${c.label}</span><b>${state.sliders[c.key]}</b></div><input data-slider="${c.key}" type="range" min="0" max="100" value="${state.sliders[c.key]}"><small>${c.minLabel}<em>${c.maxLabel}</em></small></label>`).join('')}</div>`;
}
function palettes(items) {
    return html `<div class="palette-grid">${items.map((p) => html `<button data-update="palette" data-value="${p.id}" class="${state.palette === p.id ? 'selected' : ''}"><span>${esc(p.label)}</span><div>${Object.values(p.colors).map((c) => `<i style="background:${c}"></i>`).join('')}</div></button>`).join('')}</div>`;
}
function panel(title, body, open = false) { return html `<details class="panel" ${open ? 'open' : ''}><summary>${title}</summary><div class="panel-body">${body}</div></details>`; }
function preview() {
    const palette = optionById(colorPalettes, state.palette);
    return html `<section class="panel sticky-preview"><label class="upload-box">⬆️<strong>上傳照片</strong><span>支援預覽，不會離開瀏覽器</span><input id="photoInput" type="file" accept="image/*"></label><div class="preview-card" style="background:${palette.colors.background}"><div class="mock-photo">${state.photoPreview ? `<img src="${state.photoPreview}" alt="照片預覽">` : '📷<span>照片預覽卡</span>'}</div><div class="swatches"><i style="background:${palette.colors.primary}"></i><i style="background:${palette.colors.accent}"></i><i style="background:${palette.colors.text}"></i></div></div></section>`;
}
function renderGenerator(mode) {
    const basic = mode === 'basic';
    const styleOptions = basic ? styleCategories : styles.filter((s) => s.category === state.styleCategory).slice(0, 30);
    shell(html `<main class="page-wrap"><header class="page-header"><div><span class="eyebrow">${basic ? '基礎客製化（菜鳥版）' : '極度客製化（高手版）'}</span><h1>${basic ? '三步驟快速產生提示詞' : '完整控制每個照片提示詞模組'}</h1><p>${basic ? '只保留最常用選項，先選風格，再用少量 BAR 微調。' : '所有模組完整展開，可分類篩選、搜尋與調整細節。'}</p></div><button class="primary" id="generateBtn">✨ 生成提示詞</button></header><div class="generator-grid">${preview()}<section class="panel-list">${panel('1. 照片類型 / 人物模式', optionGrid(photoTypes, state.photoType, 'photoType'), true)}${panel('2. 年紀與畫風', selectRow('年紀', ageModes, state.age, 'age') + (basic ? optionGrid(styleOptions, state.styleCategory, 'styleCategory') : `<div class="tabs">${styleCategories.map((c) => `<button data-update="styleCategory" data-value="${c.id}" class="${state.styleCategory === c.id ? 'active' : ''}">${c.label}</button>`).join('')}</div>${optionGrid(styleOptions, state.style, 'style')}`), true)}${panel('3. BAR 微調', sliders(basic ? basicSliders : expertSliders), true)}${panel('4. 光線、地點、服裝', selectRow('光線', basic ? lights.slice(0, 7) : lights, state.light, 'light') + selectRow('地點', filterIds(locations, basic ? basicIds.location : undefined), state.location, 'location') + selectRow('服裝', filterIds(outfits, basic ? basicIds.outfit : undefined), state.outfit, 'outfit'))}${panel('5. 配件、配色、氛圍', selectRow('配件模式', accessoryModes, state.accessoryMode, 'accessoryMode') + selectRow('配件', filterIds(accessories, basic ? basicIds.accessory : undefined), state.accessory, 'accessory') + palettes(filterIds(colorPalettes, basic ? basicIds.palette : undefined)) + selectRow('氛圍', filterIds(moods, basic ? basicIds.mood : undefined), state.mood, 'mood'))}${panel('6. 框線、排版、用途', optionGrid(filterIds(frames, basic ? basicIds.frame : undefined), state.frame, 'frame', true) + (basic ? '' : sliders(frameSliders)) + selectRow('排版', filterIds(layouts, basic ? basicIds.layout : undefined), state.layout, 'layout') + selectRow('用途', filterIds(outputs, basic ? basicIds.output : undefined), state.output, 'output'))}${panel('7. 文字內容（可選）', renderTextFields(basic))}</section></div></main>`);
    bindGenerator();
}
function renderTextFields(basic) {
    const fields = basic ? ['title', 'subtitle'] : ['title', 'subtitle', 'body', 'slogan', 'cta', 'brand', 'details', 'note'];
    const labels = { title: '主標題', subtitle: '副標題', body: '內文說明', slogan: '重點標語', cta: 'CTA 行動句', brand: '名字 / 品牌名 / 活動名', details: '日期 / 地點 / 價格 / 聯絡資訊', note: '備註文字' };
    return html `<label class="switch"><input id="textEnabled" type="checkbox" ${state.text.enabled ? 'checked' : ''}>要放文字嗎？</label>${state.text.enabled ? selectRow('字體風格', textStyles, state.textStyle, 'textStyle') + `<div class="text-fields">${fields.map((f) => `<input data-text="${f}" placeholder="${labels[f]}" value="${esc(state.text[f])}">`).join('')}</div>` + (basic ? '' : selectRow('對齊方式', ['左對齊', '置中', '右對齊'].map((label) => ({ id: label, label, prompt: label })), state.text.align, 'text.align') + sliders(textSliders)) : ''}`;
}
function bindGenerator() {
    bindCommon();
    root.querySelector('#generateBtn')?.addEventListener('click', generate);
    root.querySelector('#photoInput')?.addEventListener('change', (e) => { const file = e.target.files?.[0]; if (file)
        update('photoPreview', URL.createObjectURL(file)); });
    root.querySelectorAll('[data-update]').forEach((el) => el.onclick = () => { const key = el.dataset.update; const value = el.dataset.value; if (key === 'styleCategory') {
        state.style = styles.find((s) => s.category === value)?.id ?? state.style;
    } update(key, value); });
    root.querySelectorAll('[data-select]').forEach((el) => el.onchange = () => { if (el.dataset.select === 'text.align') {
        state.text.align = el.value;
        render();
    }
    else
        update(el.dataset.select, el.value); });
    root.querySelectorAll('[data-slider]').forEach((el) => el.oninput = () => { setSlider(el.dataset.slider, Number(el.value)); el.closest('.slider').querySelector('b').textContent = el.value; });
    root.querySelector('#textEnabled')?.addEventListener('change', (e) => { state.text.enabled = e.target.checked; render(); });
    root.querySelectorAll('[data-text]').forEach((el) => el.oninput = () => { state.text[el.dataset.text] = el.value; });
}
function promptBox(title, text, id) { return html `<section class="prompt-box"><div><h3>${title}</h3><button data-copy="${id}">📋 複製</button></div><pre>${esc(text)}</pre></section>`; }
function renderResult() {
    shell(html `<main class="page-wrap"><header class="page-header"><div><span class="eyebrow">結果頁</span><h1>已生成 4 種輸出</h1><p>風格碼：<strong>${result.styleCode}</strong><span id="copyMsg"></span></p></div><div class="hero-actions"><button data-nav="${state.mode}">返回編輯</button><button class="primary" id="regen">重新生成</button><button id="savePreset">💾 儲存我的風格</button></div></header><div class="result-grid">${promptBox('完整提示詞', result.fullPrompt, 'fullPrompt')}${promptBox('精簡提示詞', result.shortPrompt, 'shortPrompt')}${promptBox('負面提示詞', result.negativePrompt, 'negativePrompt')}${promptBox('專屬風格碼', result.styleCode, 'styleCode')}</div></main>`);
    bindCommon();
    root.querySelector('#regen')?.addEventListener('click', generate);
    root.querySelectorAll('[data-copy]').forEach((el) => el.onclick = async () => { await navigator.clipboard.writeText(result[el.dataset.copy]); root.querySelector('#copyMsg').textContent = '｜已複製'; });
    root.querySelector('#savePreset')?.addEventListener('click', () => { const name = window.prompt('請輸入風格名稱', `${result.styleCode} 常用風格`) ?? result.styleCode; upsertPreset({ id: crypto.randomUUID(), name, createdAt: new Date().toISOString(), state, result }); alert('已儲存到我的風格庫'); });
}
function renderLibrary() {
    const items = loadPresets().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    shell(html `<main class="page-wrap"><header class="page-header"><div><span class="eyebrow">我的風格庫</span><h1>常用設定與風格碼</h1><p>所有資料暫存在本機 localStorage，可套用、編輯或刪除。</p></div></header>${items.length === 0 ? '<section class="empty">尚未儲存風格。請先到結果頁按「儲存我的風格」。</section>' : `<div class="library-grid">${items.map((p) => `<article class="preset-card"><span>${p.result.styleCode}</span><h3>${esc(p.name)}</h3><p>${esc(p.result.shortPrompt)}</p><div><button class="primary" data-apply="${p.id}">再次套用</button><button data-edit="${p.id}">編輯</button><button data-delete="${p.id}">🗑️ 刪除</button></div></article>`).join('')}</div>`}</main>`);
    bindCommon();
    root.querySelectorAll('[data-apply]').forEach((el) => el.onclick = () => { const preset = loadPresets().find((p) => p.id === el.dataset.apply); start(preset.state.mode, preset.state); });
    root.querySelectorAll('[data-delete]').forEach((el) => el.onclick = () => { deletePreset(el.dataset.delete); renderLibrary(); });
    root.querySelectorAll('[data-edit]').forEach((el) => el.onclick = () => { const items = loadPresets(); const preset = items.find((p) => p.id === el.dataset.edit); const name = preset && window.prompt('編輯風格名稱', preset.name); if (preset && name) {
        preset.name = name;
        localStorage.setItem('picpick_user_presets', JSON.stringify(items));
        renderLibrary();
    } });
}
function render() { if (page === 'home')
    renderHome();
else if (page === 'result')
    renderResult();
else if (page === 'library')
    renderLibrary();
else
    renderGenerator(page); }
render();
