const KEY = 'picpick_user_presets';
export const loadPresets = () => {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    }
    catch {
        return [];
    }
};
export const savePresets = (presets) => localStorage.setItem(KEY, JSON.stringify(presets));
export const upsertPreset = (preset) => {
    const next = [preset, ...loadPresets().filter((item) => item.id !== preset.id)];
    savePresets(next);
    return next;
};
export const deletePreset = (id) => {
    const next = loadPresets().filter((item) => item.id !== id);
    savePresets(next);
    return next;
};
