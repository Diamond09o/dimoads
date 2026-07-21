import { languageRegistry } from "./LanguageRegistry";

const LANGUAGE_ALIASES: Record<string, string> = {
  "en-us": "en",
  "en-gb": "en",
  "en-au": "en",
  "ar-eg": "ar",
  "ar-sa": "ar",
  "zh-hans-cn": "zh-CN",
  "zh-hant-tw": "zh-CN",
  "pt-br": "pt",
  "pt-pt": "pt",
  "es-es": "es",
  "es-mx": "es",
  "fr-fr": "fr",
  "fr-ca": "fr",
  "hi-in": "hi",
  "ru-ru": "ru",
  "id-id": "id",
  "de-de": "de",
  "ja-jp": "ja",
  "ko-kr": "ko",
  "tr-tr": "tr",
  "it-it": "it",
  "pl-pl": "pl",
  "nl-nl": "nl",
  "bn-bd": "bn",
  "ur-pk": "ur",
  "vi-vn": "vi",
  "th-th": "th",
};

export function normalizeLanguageCode(languageCode?: string | null): string {
  if (!languageCode) return "en";

  const normalized = languageCode.trim().toLowerCase();
  if (LANGUAGE_ALIASES[normalized]) {
    return LANGUAGE_ALIASES[normalized];
  }

  const directMatch = languageRegistry.getByCode(languageCode);
  if (directMatch) {
    return directMatch.code;
  }

  if (normalized.includes("-")) {
    const [base] = normalized.split("-");
    const baseMatch = languageRegistry.getByCode(base);
    if (baseMatch) {
      return baseMatch.code;
    }
  }

  return languageCode;
}

export function isRTL(languageCode: string): boolean {
  const normalizedCode = normalizeLanguageCode(languageCode);
  const language = languageRegistry.getByCode(normalizedCode);

  return language?.direction === "rtl";
}

export function getLanguageDirection(
  languageCode: string
): "ltr" | "rtl" {
  return isRTL(languageCode) ? "rtl" : "ltr";
}