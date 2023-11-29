import { render } from "@testing-library/react";
import { PasswordValidation } from "../../components/PasswordValidation";

describe("Create Password Page", () => {
  test("validates password correctly", () => {
    const { container } = render(<PasswordValidation password="Abc123!@" />);
    const regexConditions = container.getElementsByClassName(
      "password-criteria-icon"
    );
    for (let i = 0; i < regexConditions.length; i++) {
      expect(regexConditions[i]).toHaveClass("pass");
    }
  });

  test("validates password length correctly", () => {
    const { container } = render(<PasswordValidation password="Abc123!@" />);
    const regexConditions = container.getElementsByClassName(
      "password-criteria-icon"
    );
    expect(regexConditions[0]).toHaveClass("pass");
  });

  test("validates password is too short", () => {
    const { container } = render(<PasswordValidation password="Ac123@" />);
    const regexConditions = container.getElementsByClassName(
      "password-criteria-icon"
    );
    expect(regexConditions[0]).toHaveClass("fails");
  });

  test("validates password is too long", () => {
    const { container } = render(
      <PasswordValidation password="Abc123456789012345678901234567890123456789012345678901234567890123@" />
    );
    const regexConditions = container.getElementsByClassName(
      "password-criteria-icon"
    );
    expect(regexConditions[0]).toHaveClass("fails");
  });

  test("validates password doesn't have uppercase", () => {
    const { container } = render(<PasswordValidation password="abc123!@" />);
    const regexConditions = container.getElementsByClassName(
      "password-criteria-icon"
    );
    expect(regexConditions[1]).toHaveClass("fails");
  });

  test("validates password doesn't have lowercase", () => {
    const { container } = render(<PasswordValidation password="ABCD123!@" />);
    const regexConditions = container.getElementsByClassName(
      "password-criteria-icon"
    );
    expect(regexConditions[2]).toHaveClass("fails");
  });

  test("validates password doesn't have number", () => {
    const { container } = render(<PasswordValidation password="ABCDabcde!@" />);
    const regexConditions = container.getElementsByClassName(
      "password-criteria-icon"
    );
    expect(regexConditions[3]).toHaveClass("fails");
  });

  test("validates password doesn't have symbol", () => {
    const { container } = render(
      <PasswordValidation password="ABCDabcde123" />
    );
    const regexConditions = container.getElementsByClassName(
      "password-criteria-icon"
    );
    expect(regexConditions[4]).toHaveClass("fails");
  });
});
