import { compareVersion } from "./version";

const testCases: [string, string, number][] = [
  ["2", "1", 1],
  ["1", "2", -1],
  ["1.2", "1.2", 0],
  ["1.2.3", "1.2", 1],
  ["2.3", "2.3.3", -1],
  ["0.0.1", "0.2.1", -1],
];

describe("Version", () => {
  test("Compare", () => {
    testCases.forEach(([version1, version2, result]) => {
      expect(compareVersion(version1, version2)).toBe(result);
    });
  });
});
