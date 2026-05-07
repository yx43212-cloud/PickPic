export type Mode = 'basic' | 'expert';

export type Option = {
  id: string;
  label: string;
  description?: string;
  category?: string;
  prompt: string;
  tags?: string[];
};

export type ColorPalette = Option & {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
};

export type SliderKey =
  | 'identity'
  | 'retouch'
  | 'background'
  | 'realism'
  | 'color'
  | 'polish'
  | 'cinematic'
  | 'mood'
  | 'clarity'
  | 'creative'
  | 'composition'
  | 'textPresence'
  | 'textBlend'
  | 'framePresence'
  | 'frameThickness'
  | 'frameOpacity'
  | 'frameRadius'
  | 'frameDecoration'
  | 'frameWhitespace'
  | 'frameShadow'
  | 'fontSize'
  | 'fontWeight'
  | 'letterSpacing'
  | 'lineHeight';

export type SliderConfig = {
  key: SliderKey;
  label: string;
  minLabel: string;
  maxLabel: string;
};

export type TextContent = {
  enabled: boolean;
  title: string;
  subtitle: string;
  body: string;
  slogan: string;
  cta: string;
  brand: string;
  details: string;
  note: string;
  align: '左對齊' | '置中' | '右對齊';
};

export type GeneratorState = {
  mode: Mode;
  photoPreview?: string;
  photoType: string;
  age: string;
  styleCategory: string;
  style: string;
  light: string;
  location: string;
  outfit: string;
  accessoryMode: string;
  accessory: string;
  palette: string;
  mood: string;
  frame: string;
  layout: string;
  output: string;
  textStyle: string;
  text: TextContent;
  sliders: Record<SliderKey, number>;
};

export type PromptResult = {
  fullPrompt: string;
  shortPrompt: string;
  negativePrompt: string;
  styleCode: string;
};

export type UserPreset = {
  id: string;
  name: string;
  createdAt: string;
  state: GeneratorState;
  result: PromptResult;
};
