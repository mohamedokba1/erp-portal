import { Injectable, effect, signal } from '@angular/core';
import { EN_DICTIONARY } from './translations';

export type Lang = 'ar' | 'en';

const STORAGE_KEY = 'meridian_erp_lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private _lang = signal<Lang>(this.restore());
  readonly lang = this._lang.asReadonly();

  constructor() {
    effect(() => {
      const l = this._lang();
      document.documentElement.setAttribute('lang', l);
      document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr');
      localStorage.setItem(STORAGE_KEY, l);
    });
  }

  private restore(): Lang {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ar';
    } catch {
      return 'ar';
    }
  }

  toggle(): void {
    this._lang.set(this._lang() === 'ar' ? 'en' : 'ar');
  }

  set(lang: Lang): void {
    this._lang.set(lang);
  }

  isEn(): boolean {
    return this._lang() === 'en';
  }

  /** Translate an Arabic source string to English when the active language is 'en'.
   *  Arabic strings are used as dictionary keys directly, so the Arabic text in
   *  templates/components doubles as a readable, always-correct fallback. */
  t(text: string | undefined | null): string {
    if (!text) return '';
    if (this._lang() === 'ar') return text;
    return EN_DICTIONARY[text] ?? text;
  }
}
