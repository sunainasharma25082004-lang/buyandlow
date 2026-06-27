import { en } from './locales/en';
import { hi } from './locales/hi';
import { pa } from './locales/pa';
import type { Language, TranslationTree } from './types';

const catalogs: Record<Language, TranslationTree> = { en, hi, pa };

const getPath = (tree: TranslationTree, key: string): string | undefined => {
  const parts = key.split('.');
  let current: string | TranslationTree | undefined = tree;

  for (const part of parts) {
    if (!current || typeof current === 'string') return undefined;
    current = current[part];
  }

  return typeof current === 'string' ? current : undefined;
};

export const translate = (
  language: Language,
  key: string,
  params?: Record<string, string | number>,
): string => {
  let text = getPath(catalogs[language], key) ?? getPath(catalogs.en, key) ?? key;

  if (params) {
    Object.entries(params).forEach(([name, value]) => {
      text = text.replace(new RegExp(`{{${name}}}`, 'g'), String(value));
    });
  }

  return text;
};

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;