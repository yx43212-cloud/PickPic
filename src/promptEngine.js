import { accessories, accessoryModes, ageModes, colorPalettes, frames, layouts, lights, locations, moods, outfits, outputs, photoTypes, styles, textStyles } from './data.js';
const findLabel = (items, id) => items.find((item) => item.id === id) ?? items[0];
const level = (value) => (value >= 75 ? '高' : value >= 45 ? '中' : '低');
const sliderNames = {
    identity: '人物保留度', retouch: '修飾強度', background: '背景重塑程度', realism: '寫實/插畫程度', color: '色彩濃度', polish: '精緻程度', cinematic: '電影感', mood: '氛圍強度', clarity: '細節清晰度', creative: '創意變形程度', composition: '構圖自由度', textPresence: '文字存在感', textBlend: '圖文融合度', framePresence: '框線存在感', frameThickness: '框線粗細', frameOpacity: '框線透明度', frameRadius: '圓角程度', frameDecoration: '框線裝飾感', frameWhitespace: '留白寬度', frameShadow: '陰影強度', fontSize: '文字大小', fontWeight: '文字粗細', letterSpacing: '字距', lineHeight: '行距'
};
export const createInitialState = (mode) => ({
    mode,
    photoType: 'single',
    age: 'age-0',
    styleCategory: 'style-cat-1',
    style: 'style-001',
    light: '基礎光-0',
    location: 'location-1',
    outfit: 'outfit-1',
    accessoryMode: 'accessory-mode-0',
    accessory: 'accessory-1',
    palette: 'palette-1',
    mood: 'mood-1',
    frame: 'frame-1',
    layout: 'layout-1',
    output: 'output-1',
    textStyle: 'text-style-0',
    text: { enabled: false, title: '', subtitle: '', body: '', slogan: '', cta: '', brand: '', details: '', note: '', align: '置中' },
    sliders: {
        identity: 80, retouch: 45, background: 35, realism: 35, color: 55, polish: 65, cinematic: 45, mood: 50, clarity: 65, creative: 30, composition: 35, textPresence: 45, textBlend: 55, framePresence: 30, frameThickness: 30, frameOpacity: 70, frameRadius: 30, frameDecoration: 20, frameWhitespace: 35, frameShadow: 25, fontSize: 50, fontWeight: 50, letterSpacing: 45, lineHeight: 50
    }
});
export const assemblePrompt = (state) => {
    const photoType = findLabel(photoTypes, state.photoType);
    const age = findLabel(ageModes, state.age);
    const style = findLabel(styles, state.style);
    const light = findLabel(lights, state.light);
    const location = findLabel(locations, state.location);
    const outfit = findLabel(outfits, state.outfit);
    const accessoryMode = findLabel(accessoryModes, state.accessoryMode);
    const accessory = findLabel(accessories, state.accessory);
    const palette = findLabel(colorPalettes, state.palette);
    const mood = findLabel(moods, state.mood);
    const frame = findLabel(frames, state.frame);
    const layout = findLabel(layouts, state.layout);
    const output = findLabel(outputs, state.output);
    const textStyle = findLabel(textStyles, state.textStyle);
    const textParts = state.text.enabled
        ? [
            state.text.title && `主標題「${state.text.title}」`,
            state.text.subtitle && `副標題「${state.text.subtitle}」`,
            state.text.body && `內文「${state.text.body}」`,
            state.text.slogan && `重點標語「${state.text.slogan}」`,
            state.text.cta && `CTA「${state.text.cta}」`,
            state.text.brand && `名稱/品牌「${state.text.brand}」`,
            state.text.details && `日期地點價格聯絡資訊「${state.text.details}」`,
            state.text.note && `備註「${state.text.note}」`,
            `${state.text.align}，${textStyle.prompt}`
        ].filter(Boolean).join('；')
        : '不加入任何文字，保持畫面乾淨';
    const sliderSummary = Object.entries(state.sliders)
        .filter(([key]) => state.mode === 'expert' || ['identity', 'retouch', 'background', 'realism', 'color', 'polish'].includes(key))
        .map(([key, value]) => `${sliderNames[key]}${level(value)}`)
        .join('、');
    const frameDetails = `框線參數：粗細${state.sliders.frameThickness}、透明度${state.sliders.frameOpacity}、圓角${state.sliders.frameRadius}、裝飾感${state.sliders.frameDecoration}、留白${state.sliders.frameWhitespace}、陰影${state.sliders.frameShadow}`;
    const fullPrompt = [
        '請根據上傳照片進行 AI 照片編輯，不要把照片當成全新創作。',
        photoType.prompt,
        age.prompt,
        style.prompt,
        light.prompt,
        location.prompt,
        outfit.prompt,
        `${accessoryMode.prompt}：${accessory.prompt}`,
        `配色採用${palette.label}，主色 ${palette.colors.primary}、輔色 ${palette.colors.secondary}、點綴色 ${palette.colors.accent}、背景色 ${palette.colors.background}、建議文字色 ${palette.colors.text}`,
        mood.prompt,
        `${frame.prompt}，${frameDetails}`,
        layout.prompt,
        `輸出用途：${output.prompt}`,
        `文字內容：${textParts}`,
        `微調要求：${sliderSummary}。請保持五官自然、手部合理、材質清楚、光線一致、構圖乾淨，輸出高解析且適合直接用於${output.label}。`
    ].join('\n');
    const shortPrompt = `將照片轉為${style.label}，${photoType.label}，${age.label}，${light.label}，${location.label}，${palette.label}配色，${mood.label}氛圍，${layout.label}，用途為${output.label}。${state.text.enabled ? `加入文字：${textParts}。` : '不加文字。'}`;
    const negativePrompt = '避免五官變形、手指錯誤、低畫質、構圖擁擠、文字錯字、比例怪異、人物撞臉、背景雜亂、光線不合理、過度磨皮、塑膠皮膚、邊緣破碎、框線誤判成外框、文字遮住主體。';
    const codeNumber = Math.abs([...`${state.style}${state.palette}${state.mood}${state.output}`].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 999;
    const styleCode = `${state.mode === 'expert' ? 'PP-BRAND' : 'PP-STYLE'}-${String(codeNumber || 83).padStart(3, '0')}`;
    return { fullPrompt, shortPrompt, negativePrompt, styleCode };
};
