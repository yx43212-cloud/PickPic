export const photoTypes = [
    { id: 'single', label: '單人', prompt: '以單一人物為主體，保留五官辨識度、個人氣場與自然表情' },
    { id: 'couple', label: '雙人', prompt: '強調雙人互動、比例一致與構圖平衡，避免人物特徵混淆' },
    { id: 'multi', label: '多人', prompt: '維持每位人物的辨識度與群體層次，避免撞臉與姿勢重疊' },
    { id: 'group', label: '團體', prompt: '呈現整齊群像排列、清楚前後層次與一致的視覺風格' },
    { id: 'product', label: '商品', prompt: '以商品展示為核心，強調材質、細節、商業感與乾淨背景' },
    { id: 'pet', label: '寵物', prompt: '保留動物特徵與可愛神韻，讓風格一致且自然討喜' },
    { id: 'space', label: '風景 / 空間', prompt: '強調空間氛圍、場景調性、景深與構圖感' }
];
export const ageModes = [
    '保留原年紀,幼兒,兒童,國小生,國中生,高中生,大學生,20代,30代,40代,50代,60代,銀髮族,年輕化,成熟化,兒童化,銀髮化,不改年紀，只調整氣質'
        .split(',')
        .map((label, index) => ({ id: `age-${index}`, label, prompt: label === '保留原年紀' ? '保留照片中人物原本年紀' : `將年紀表現調整為${label}` }))
].flat();
export const styleCategories = [
    '寫實攝影類,日韓質感類,商業形象類,動畫插畫類,潮流酷炫類,復古懷舊類,奇幻變身類,社群爆款類,東方風格類,情緒氛圍類'
        .split(',')
        .map((label, index) => ({ id: `style-cat-${index + 1}`, label, prompt: `${label}的整體視覺語言` }))
].flat();
const styleSeeds = ['自然人像攝影', '柔焦韓系棚拍', '高級商業形象照', '日系清透明亮', '電影劇照感', '極簡品牌主視覺', '二次元精緻插畫', '潮流霓虹海報', '復古膠片雜誌', '新中式雅緻'];
export const styles = Array.from({ length: 200 }, (_, index) => {
    const category = styleCategories[index % styleCategories.length];
    const seed = styleSeeds[index % styleSeeds.length];
    return {
        id: `style-${String(index + 1).padStart(3, '0')}`,
        label: `${seed} ${index + 1}`,
        category: category.id,
        prompt: `${category.label}，${seed}，具備一致美術方向與可直接用於 AI 修圖的視覺描述`
    };
});
export const lights = [
    ['基礎光', '自然光', '柔和窗光', '棚拍白光', '室內暖光', '陰天散射光'],
    ['情緒光', '黃昏逆光', '電影感側光', '戲劇追光', '夜景霓虹光', '柔霧夢幻光', '燭光感', '月光感', '暗調電影光'],
    ['商業光', '精品硬光', '保養品柔膚光', '產品主視覺光', '展示櫥窗光', '高級商攝光']
].flatMap(([category, ...items]) => items.map((label, index) => ({ id: `${category}-${index}`, label, category, prompt: `使用${label}，光影自然合理並符合${category}調性` })));
const makeOptions = (prefix, categories, count, samples) => Array.from({ length: count }, (_, index) => {
    const category = categories[index % categories.length];
    const label = samples[index % samples.length];
    return { id: `${prefix}-${index + 1}`, label: `${label}${count > samples.length ? ` ${index + 1}` : ''}`, category, prompt: `${category}中的${label}設定，細節清楚且與照片主體協調` };
});
export const locations = makeOptions('location', ['攝影棚', '咖啡廳', '街頭', '商辦空間', '百貨商場', '家居空間', '校園', '大自然', '旅遊場景', '特殊主題場景'], 100, ['純白棚景', '木質咖啡廳', '城市街角', '高級辦公室', '精品商場', '溫暖客廳', '校園走廊', '森林步道', '海邊旅拍', '未來太空艙']);
export const outfits = makeOptions('outfit', ['男裝', '女裝', '男女搭配', '雙人搭配', '多人群體搭配', '情侶搭配', '商務搭配', '主題造型搭配', '保留原服裝', '自動換裝'], 100, ['保留原服裝', '韓系襯衫', '商務西裝', '街頭外套', '優雅禮服', '休閒針織', '可愛學院風', '高級時尚套裝', '情侶同色系', '主題變裝']);
export const accessories = makeOptions('accessory', ['個人形象配件', '商務專業配件', '攝影創作配件', '時尚潮流配件', '生活日常配件', '運動健康配件', '奇幻變身配件', '復古懷舊配件', '社群拍攝配件', '節慶主題配件'], 100, ['不加配件', '保留原配件', '眼鏡', '帽子', '相機', '包包', '花束', '咖啡杯', '珍珠耳環', '節慶燈飾']);
export const accessoryModes = ['不加配件', '保留原配件', '替換配件', '新增 1 個配件', '新增 2–3 個配件', '主題配件組合'].map((label, index) => ({ id: `accessory-mode-${index}`, label, prompt: label }));
export const colorPalettes = makeOptions('palette', ['奶油色', '黑金', '粉色', '藍灰', '莫蘭迪', '復古棕', '霓虹色', '森林綠', '海鹽藍', '玫瑰金'], 100, ['柔奶油', '黑金精品', '淡粉甜感', '藍灰專業', '莫蘭迪柔霧', '復古棕調', '霓虹撞色', '森林自然', '海鹽清新', '玫瑰金']).map((option, index) => ({
    ...option,
    colors: { primary: ['#f5e6c8', '#101010', '#f7b8c8', '#6f8095', '#9aa48f'][index % 5], secondary: '#ffffff', accent: ['#d8a64f', '#d4af37', '#ff6f91', '#9fb4c7', '#c8b7a6'][index % 5], background: ['#fffaf0', '#f3f0ea', '#fff4f6', '#edf3f8', '#f2f0ec'][index % 5], text: ['#573b2a', '#f7d57a', '#63303e', '#263747', '#4b4b42'][index % 5] }
}));
export const moods = makeOptions('mood', ['療癒溫柔系', '高級質感系', '電影敘事系', '浪漫情感系', '潮流個性系', '奇幻夢境系', '復古懷舊系', '活力歡樂系', '情緒深層系', '氣勢場域系'], 100, ['高級', '溫柔', '浪漫', '酷炫', '活力', '神秘', '療癒', '專業', '沉靜', '自信']);
export const frames = makeOptions('frame', ['極簡框線', '高級精品框線', '韓系日系框線', '社群框線', '可愛活潑框線', '復古框線', '奇幻主題框線', '商業用途框線', '專業人物框線', '文字版型框線'], 100, ['無框線', '細白框', '細黑框', '雜誌框', '拍立得框', '可愛框', '精品金線', '資訊卡框線', '霧面留白框', '海報分割線']);
export const layouts = makeOptions('layout', ['無文字型', '輕文字型', '重文字型'], 50, ['純圖片', '滿版主視覺', '留白海報式', '雜誌感純圖', '拼貼構圖', '上標題下圖片', '下標題上圖片', '左文右圖', '右文左圖', '簡約封面式', '商品 DM', '活動宣傳', '課程招生', '品牌海報', '雜誌封面', '內頁版型', '名言卡', '資訊卡']);
export const outputs = makeOptions('output', ['社群貼文', '限時動態', '短影音封面', '商品廣告', '個人品牌', '商務履歷', '官網 / Banner', '印刷輸出', '課程 / 簡報', '內容創作封面'], 100, ['IG貼文', 'IG限動', 'FB貼文', '個人品牌照', '商品廣告', '海報', '履歷照', '網站橫幅', '簡報封面', 'YouTube封面']);
export const textStyles = ['極簡現代', '高級精品', '韓系清新', '日系文青', '商務正式', '潮流個性', '可愛活潑', '復古海報', '科技未來', '新中式'].map((label, index) => ({ id: `text-style-${index}`, label, prompt: `${label}字體風格，文字清楚可讀且與圖片融合` }));
export const basicSliders = [
    { key: 'identity', label: '人物保留度', minLabel: '自由改造', maxLabel: '高度保留' },
    { key: 'retouch', label: '修飾強度', minLabel: '自然', maxLabel: '精修' },
    { key: 'background', label: '背景變化程度', minLabel: '保留', maxLabel: '重塑' },
    { key: 'realism', label: '寫實 / 插畫程度', minLabel: '寫實', maxLabel: '插畫' },
    { key: 'color', label: '色彩濃度', minLabel: '淡雅', maxLabel: '鮮明' },
    { key: 'polish', label: '精緻程度', minLabel: '生活感', maxLabel: '高完成度' }
];
export const expertSliders = [
    ...basicSliders,
    { key: 'cinematic', label: '電影感', minLabel: '日常', maxLabel: '電影級' },
    { key: 'mood', label: '氛圍強度', minLabel: '輕微', maxLabel: '強烈' },
    { key: 'clarity', label: '細節清晰度', minLabel: '柔和', maxLabel: '銳利' },
    { key: 'creative', label: '創意變形程度', minLabel: '保守', maxLabel: '大膽' },
    { key: 'composition', label: '構圖自由度', minLabel: '依原圖', maxLabel: '重構圖' },
    { key: 'textPresence', label: '文字存在感', minLabel: '低調', maxLabel: '醒目' },
    { key: 'textBlend', label: '圖文融合度', minLabel: '獨立', maxLabel: '融合' },
    { key: 'framePresence', label: '框線存在感', minLabel: '低調', maxLabel: '強烈' }
];
export const frameSliders = [
    { key: 'frameThickness', label: '框線粗細', minLabel: '細', maxLabel: '粗' },
    { key: 'frameOpacity', label: '框線透明度', minLabel: '透明', maxLabel: '不透明' },
    { key: 'frameRadius', label: '圓角程度', minLabel: '直角', maxLabel: '圓角' },
    { key: 'frameDecoration', label: '框線裝飾感', minLabel: '極簡', maxLabel: '華麗' },
    { key: 'frameWhitespace', label: '留白寬度', minLabel: '窄', maxLabel: '寬' },
    { key: 'frameShadow', label: '陰影強度', minLabel: '無', maxLabel: '明顯' }
];
export const textSliders = [
    { key: 'fontSize', label: '文字大小', minLabel: '小', maxLabel: '大' },
    { key: 'fontWeight', label: '文字粗細', minLabel: '細', maxLabel: '粗' },
    { key: 'letterSpacing', label: '字距', minLabel: '緊', maxLabel: '寬' },
    { key: 'lineHeight', label: '行距', minLabel: '緊', maxLabel: '鬆' },
    { key: 'textPresence', label: '文字存在感', minLabel: '低調', maxLabel: '醒目' },
    { key: 'textBlend', label: '圖文融合度', minLabel: '獨立', maxLabel: '融合' }
];
