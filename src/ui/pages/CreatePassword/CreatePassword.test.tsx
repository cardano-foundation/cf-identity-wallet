import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import { store } from "../../../store";
import {
  CreatePassword,
  PasswordRegex,
  STRING_LENGTH,
  STRING_UPPERCASE,
  STRING_LOWERCASE,
  STRING_NUMBER,
  STRING_SYMBOL,
  STRING_SPECIAL_CHAR,
} from "./CreatePassword";

describe("Create Password Page", () => {
  test("Renders Create Password page", () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <CreatePassword />
      </Provider>
    );
    const createPasswordValue = getByTestId("createPasswordValue");
    const confirmPasswordValue = getByTestId("createPasswordValue");
    const createHintValue = getByTestId("createPasswordValue");
    expect(createPasswordValue).toBeInTheDocument();
    expect(confirmPasswordValue).toBeInTheDocument();
    expect(createHintValue).toBeInTheDocument();
  });

  test("Password is too short", () => {
    const createPasswordValue = "A";
    const setRegexState = jest.fn();
    render(
      <PasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith(STRING_LENGTH);
  });

  test("Password is too long", () => {
    const createPasswordValue =
      "Cardano1$Cardano1$Cardano1$Cardano1$Cardano1$Cardano1$Cardano1$Cardano1$";
    const setRegexState = jest.fn();
    render(
      <PasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith(STRING_LENGTH);
  });

  test("Password doesn't have uppercase", () => {
    const createPasswordValue = "cardano1$";
    const setRegexState = jest.fn();
    render(
      <PasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith(STRING_UPPERCASE);
  });

  test("Password doesn't have lowercase", () => {
    const createPasswordValue = "CARDANO1$";
    const setRegexState = jest.fn();
    render(
      <PasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith(STRING_LOWERCASE);
  });

  test("Password doesn't have number", () => {
    const createPasswordValue = "Cardano$";
    const setRegexState = jest.fn();
    render(
      <PasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith(STRING_NUMBER);
  });

  test("Password doesn't have symbol", () => {
    const createPasswordValue = "Cardano1";
    const setRegexState = jest.fn();
    render(
      <PasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith(STRING_SYMBOL);
  });

  test("Password has space/special character", () => {
    const createPasswordValue = "Cardano1$ ";
    const setRegexState = jest.fn();
    render(
      <PasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith(STRING_SPECIAL_CHAR);
  });

  test("Password is accepted", () => {
    const createPasswordValue = "Cardano1$";
    const setRegexState = jest.fn();
    render(
      <PasswordRegex
        password={createPasswordValue}
        setRegexState={setRegexState}
      />
    );
    expect(setRegexState).toHaveBeenCalledWith("");
  });
});
