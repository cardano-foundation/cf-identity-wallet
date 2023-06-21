import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import {
  CreatePassword,
  PasswordRegex
} from "./CreatePassword";

describe("Create Password Page", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const initialState = {
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };
  test("Renders Create Password page", () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
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

  test("validates password correctly", () => {
    const { container } = render(
      <PasswordRegex password="Abc123!@" />
    );
    const regexConditions = container.getElementsByClassName("password-criteria-icon");
    for (let i= 0; i < regexConditions.length; i++){
      expect(regexConditions[i]).toHaveClass("pass");
    }
  });

  test("validates password length correctly", () => {
    const { container } = render(
      <PasswordRegex password="Abc123!@" />
    );
    const regexConditions = container.getElementsByClassName("password-criteria-icon");
    expect(regexConditions[0]).toHaveClass("pass");
  });

  test("validates password is too short", () => {
    const { container } = render(
      <PasswordRegex password="Ac123@" />
    );
    const regexConditions = container.getElementsByClassName("password-criteria-icon");
    expect(regexConditions[0]).toHaveClass("fails");
  });

  test("validates password is too long", () => {
    const { container } = render(
      <PasswordRegex password="Abc123456789012345678901234567890123456789012345678901234567890123@" />
    );
    const regexConditions = container.getElementsByClassName("password-criteria-icon");
    expect(regexConditions[0]).toHaveClass("fails");
  });

  test("validates password doesn't have uppercase", () => {
    const { container } = render(
      <PasswordRegex password="abc123!@" />
    );
    const regexConditions = container.getElementsByClassName("password-criteria-icon");
    expect(regexConditions[1]).toHaveClass("fails");
  });

  test("validates password doesn't have lowercase", () => {
    const { container } = render(
      <PasswordRegex password="ABCD123!@" />
    );
    const regexConditions = container.getElementsByClassName("password-criteria-icon");
    expect(regexConditions[2]).toHaveClass("fails");
  });

  test("validates password doesn't have number", () => {
    const { container } = render(
      <PasswordRegex password="ABCDabcde!@" />
    );
    const regexConditions = container.getElementsByClassName("password-criteria-icon");
    expect(regexConditions[3]).toHaveClass("fails");
  });

  test("validates password doesn't have symbol", () => {
    const { container } = render(
      <PasswordRegex password="ABCDabcde123" />
    );
    const regexConditions = container.getElementsByClassName("password-criteria-icon");
    expect(regexConditions[4]).toHaveClass("fails");
  });
});
