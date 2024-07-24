import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { CreatePassword } from "./CreatePassword";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

describe("Create Password Page", () => {
  let storeMocked: Store<unknown, AnyAction>;
  beforeEach(() => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateNoPassword),
      dispatch: dispatchMock,
    };
  });

  const initialStateNoPassword = {
    stateCache: {
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        passwordIsSet: false,
        passwordIsSkipped: true,
      },
    },
  };

  const initialStateWithPassword = {
    stateCache: {
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        passwordIsSet: true,
        passwordIsSkipped: false,
      },
    },
  };

  test("Renders Create Password page when Onboarding", () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateWithPassword),
      dispatch: dispatchMock,
    };
    const handleClear = jest.fn();
    const setPasswordIsSet = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <CreatePassword
          isModal={false}
          handleClear={handleClear}
          setPasswordIsSet={setPasswordIsSet}
        />
      </Provider>
    );

    expect(getByTestId("progress-bar")).toBeInTheDocument();
    expect(queryByTestId("close-button")).not.toBeInTheDocument();
    expect(getByTestId("create-password-title")).toBeInTheDocument();
    expect(getByTestId("create-password-title")).toHaveTextContent(
      EN_TRANSLATIONS.createpassword.title
    );
    expect(getByTestId("create-password-top-paragraph")).toBeInTheDocument();
    expect(getByTestId("create-password-top-paragraph")).toHaveTextContent(
      EN_TRANSLATIONS.createpassword.description
    );
    expect(getByTestId("create-password-input-title")).toBeInTheDocument();
    expect(getByTestId("create-password-input-title")).toHaveTextContent(
      EN_TRANSLATIONS.createpassword.input.first.title
    );
    expect(getByTestId("confirm-password-input-title")).toBeInTheDocument();
    expect(getByTestId("confirm-password-input-title")).toHaveTextContent(
      EN_TRANSLATIONS.createpassword.input.second.title
    );
    expect(getByTestId("create-a-hint-input-title")).toBeInTheDocument();
    expect(getByTestId("create-a-hint-input-title")).toHaveTextContent(
      EN_TRANSLATIONS.createpassword.input.third.title
    );
    expect(getByTestId("primary-button-create-password")).toBeInTheDocument();
    expect(getByTestId("primary-button-create-password")).toHaveTextContent(
      EN_TRANSLATIONS.createpassword.button.continue
    );
    expect(getByTestId("tertiary-button-create-password")).toBeInTheDocument();
    expect(getByTestId("tertiary-button-create-password")).toHaveTextContent(
      EN_TRANSLATIONS.createpassword.button.skip
    );
  });
});
