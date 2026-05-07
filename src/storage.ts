import { UserPreset } from './types.js';

const KEY = 'picpick_user_presets';

export const loadPresets = (): UserPreset[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserPreset[]) : [];
  } catch {
    return [];
  }
};

export const savePresets = (presets: UserPreset[]) => localStorage.setItem(KEY, JSON.stringify(presets));
export const upsertPreset = (preset: UserPreset) => {
  const next = [preset, ...loadPresets().filter((item) => item.id !== preset.id)];
  savePresets(next);
  return next;
};
export const deletePreset = (id: string) => {
  const next = loadPresets().filter((item) => item.id !== id);
  savePresets(next);
  return next;
};
