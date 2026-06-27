export type Language = 'en' | 'hi' | 'pa';

export type TranslationTree = {
  [key: string]: string | TranslationTree;
};

export type LanguageOption = {
  code: Language;
  label: string;
  nativeLabel: string;
};

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
];