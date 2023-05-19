import { render } from "@testing-library/react";
import { OperationsPasswordRegex } from "./OperationsPasswordRegex";

describe("Operations Password Regex", () => {
  test("Password is too short", () => {
    const createPasswordValue = "A";
    const setRegexState = jest.fn();
    render(
      <OperationsPasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith("length");
  });

  test("Password is too long", () => {
    const createPasswordValue =
      "Cardano1$Cardano1$Cardano1$Cardano1$Cardano1$Cardano1$Cardano1$Cardano1$";
    const setRegexState = jest.fn();
    render(
      <OperationsPasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith("length");
  });

  test("Password doesn't have uppercase", () => {
    const createPasswordValue = "cardano1$";
    const setRegexState = jest.fn();
    render(
      <OperationsPasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith("uppercase");
  });

  test("Password doesn't have lowercase", () => {
    const createPasswordValue = "CARDANO1$";
    const setRegexState = jest.fn();
    render(
      <OperationsPasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith("lowercase");
  });

  test("Password doesn't have number", () => {
    const createPasswordValue = "Cardano$";
    const setRegexState = jest.fn();
    render(
      <OperationsPasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith("number");
  });

  test("Password doesn't have symbol", () => {
    const createPasswordValue = "Cardano1";
    const setRegexState = jest.fn();
    render(
      <OperationsPasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith("symbol");
  });

  test("Password has space/special character", () => {
    const createPasswordValue = "Cardano1$ ";
    const setRegexState = jest.fn();
    render(
      <OperationsPasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith("specialChar");
  });

  test("Password is accepted", () => {
    const createPasswordValue = "Cardano1$";
    const setRegexState = jest.fn();
    render(
      <OperationsPasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith("");
  });
});
