import { passwordStrengthChecker } from "./passwordStrengthChecker";

describe("passwordStrengthChecker", () => {
  it("should return true if the password contains an uppercase letter", () => {
    const password = "Cardano1$";
    expect(passwordStrengthChecker.isUppercaseValid(password)).toBe(true);
  });
  it("should return true if the password contains a lower case letter", () => {
    const password = "Cardano1$";
    expect(passwordStrengthChecker.isLowercaseValid(password)).toBe(true);
  });
  it("should return true if the password contains a number", () => {
    const password = "Cardano1$";
    expect(passwordStrengthChecker.isNumberValid(password)).toBe(true);
  });
  it("should return true if the password contains a symbol", () => {
    const password = "Cardano1$";
    expect(passwordStrengthChecker.isSymbolValid(password)).toBe(true);
  });
  it("should return true if password contains valid characters", () => {
    const password = "Cardano1$";
    expect(passwordStrengthChecker.isValidCharacters(password)).toBe(true);
  });
  it("should return true if password length is less than 64", () => {
    const password = "Cardano1$";
    expect(passwordStrengthChecker.isLengthValid(password)).toBe(true);
  });
  it("should return false if password length is 64 or more", () => {
    const password =
      "Abc123456789012345678901234567890123456789012345678901234567890123@";
    expect(passwordStrengthChecker.isLengthValid(password)).toBe(false);
  });
  it("should return false if has invalid character", () => {
    const password = "Abc@12344,∞";
    expect(passwordStrengthChecker.getErrorByPriority(password)).toBe(
      "Use only lowercase/uppercase letters, numbers & symbols for your password."
    );
  });
});
