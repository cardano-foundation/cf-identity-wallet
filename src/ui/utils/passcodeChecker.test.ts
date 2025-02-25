import {
  isConsecutive,
  isRepeat,
  isReverseConsecutive,
} from "./passcodeChecker";

describe("Passcode checker", () => {
  const repeatDigitTest: [string, boolean][] = [
    ["111111", true],
    ["222222", true],
    ["333333", true],
    ["444444", true],
    ["555555", true],
    ["666666", true],
    ["777777", true],
    ["888888", true],
    ["999999", true],
    ["121111", false],
    ["112111", false],
    ["111211", false],
    ["111121", false],
    ["111112", false],
  ];

  const consecutiveTest: [string, boolean][] = [
    ["123456", true],
    ["234567", true],
    ["345678", true],
    ["456789", true],
    ["012345", true],
    ["123133", false],
    ["429123", false],
  ];

  const reverseConsecutiveTest: [string, boolean][] = [
    ["987654", true],
    ["876543", true],
    ["765432", true],
    ["654321", true],
    ["543210", true],
    ["123133", false],
    ["429123", false],
  ];

  test("Repeative check", () => {
    repeatDigitTest.forEach(([test, result]) => {
      expect(isRepeat(test)).toBe(result);
    });
  });

  test("Consecutive check", () => {
    consecutiveTest.forEach(([test, result]) => {
      expect(isConsecutive(test)).toBe(result);
    });
  });

  test("Reverse consecutive check", () => {
    reverseConsecutiveTest.forEach(([test, result]) => {
      expect(isReverseConsecutive(test)).toBe(result);
    });
  });
});
