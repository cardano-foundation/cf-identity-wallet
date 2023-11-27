import { passwordStrengthChecker } from "./passwordStrengthChecker";

describe("passwordStrengthChecker", () => {
  it("should return true if the password contains an uppercase letter", () => {
    const password = "Abc123";
    expect(passwordStrengthChecker.isUppercaseValid(password)).toBe(true);
  });
  it("should return true if the password contains a lower case letter", () => {
    const password = "abc123";
    expect(passwordStrengthChecker.isLowercaseValid(password)).toBe(true);
  });
  it("should return true if the password contains a number", () => {
    const password = "Abc123";
    expect(passwordStrengthChecker.isNumberValid(password)).toBe(true);
  });
  it("should return true if the password contains a symbol", () => {
    const password = "Abc123";
    expect(passwordStrengthChecker.isSymbolValid(password)).toBe(true);
  });
  it("should return true if password contains valid characters", () => {
    const password = "Abc123";
    expect(passwordStrengthChecker.isValidCharacters(password)).toBe(true);
  });
  it("should return true if password length is less than 64", () => {
    const password = "Abc123";
    expect(passwordStrengthChecker.isLengthValid(password)).toBe(true);
  });
  it("should return false if password length is 64 or more", () => {
    const password = "Abc123456";
    expect(passwordStrengthChecker.isLengthValid(password)).toBe(false);
  });
});
