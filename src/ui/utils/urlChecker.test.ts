import { isValidHttpUrl } from "./urlChecker";

const validUrl = [
  "http://a.co",
  "http://a",
  "http://a?",
  "http://localhost",
  "http://localhost:1120/params/dasdadada?name=any",
  "https://a.long.sub-domain.example.com/foo/bar?foo=bar&boo=far#a%20b",
  "www.police.academy",
  "https://x.com/?twitter?",
  "http://example.com?a=%bc&d=%ef&g=%H",
  "https://12.34.56.78:9000",
  "www.12.32.44.22:9323",
];

const inValidUrl = [
  "//x.com/?twitter?",
  "dsadasda",
  "3213.323.321.333",
  "http://",
  "https://-",
];

describe("Url checker", () => {
  test("Valid format", () => {
    validUrl.forEach((url) => {
      expect(isValidHttpUrl(url)).toBe(true);
    });
  });

  test("Invalid format", () => {
    inValidUrl.forEach((url) => {
      expect(isValidHttpUrl(url)).toBe(false);
    });
  });
});
