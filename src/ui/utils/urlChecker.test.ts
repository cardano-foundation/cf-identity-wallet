import { isValidHttpUrl } from "./urlChecker";

const validUrl = [
  "https://a.long.sub-domain.example.com/foo/bar?foo=bar&boo=far#a%20b",
  "www.police.academy",
  "https://x.com/?twitter?",
  "http://example.com?a=%bc&d=%ef&g=%H",
];

const inValidUrl = ["https://a", "//x.com/?twitter?", "dsadasda"];

describe("Url checker", () => {
  test("valid format", () => {
    validUrl.forEach((url) => {
      expect(isValidHttpUrl(url)).toBe(true);
    });
  });

  test("invalid format", () => {
    inValidUrl.forEach((url) => {
      expect(isValidHttpUrl(url)).toBe(false);
    });
  });
});
