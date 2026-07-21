import { describe, expect, it } from "vitest";
import { normalizeLanguageCode } from "./LanguageUtils";

describe("normalizeLanguageCode", () => {
  it("maps common browser locale variants to supported app codes", () => {
    expect(normalizeLanguageCode("en-US")).toBe("en");
    expect(normalizeLanguageCode("en_us")).toBe("en");
    expect(normalizeLanguageCode("ar-EG")).toBe("ar");
    expect(normalizeLanguageCode("zh-Hans-CN")).toBe("zh-CN");
    expect(normalizeLanguageCode("pt-BR")).toBe("pt");
  });

  it("returns the original supported code when it is already valid", () => {
    expect(normalizeLanguageCode("fr")).toBe("fr");
    expect(normalizeLanguageCode("zh-CN")).toBe("zh-CN");
  });
});
