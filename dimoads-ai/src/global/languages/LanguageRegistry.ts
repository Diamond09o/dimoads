import { languages, Language } from "./languages";

class LanguageRegistry {
  private languages: Language[] = languages;

  getAll(): Language[] {
    return this.languages;
  }

  getByCode(code: string): Language | undefined {
    return this.languages.find(
      (language) => language.code === code
    );
  }

  exists(code: string): boolean {
    return this.languages.some(
      (language) => language.code === code
    );
  }
}

export const languageRegistry = new LanguageRegistry();