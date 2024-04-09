import { MemoryRouter, Route } from "react-router-dom";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { SetPasscode } from "./SetPasscode";
import { GenerateSeedPhrase } from "../GenerateSeedPhrase";
import { SecureStorage, KeyStoreKeys } from "../../../core/storage";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { store } from "../../../store";
import { RoutePath } from "../../../routes";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../globals/constants";

const setKeyStoreSpy = jest.spyOn(SecureStorage, "set").mockResolvedValue();

describe("SetPasscode Page", () => {
  test("Renders Create Passcode page with title and description", () => {
    const { getByText } = render(
      <Provider store={store}>
        <SetPasscode />
      </Provider>
    );
    expect(
      getByText(EN_TRANSLATIONS.setpasscode.enterpasscode.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.setpasscode.enterpasscode.description)
    ).toBeInTheDocument();
  });

  test("The user can add and remove digits from the passcode", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <SetPasscode />
      </Provider>
    );
    fireEvent.click(getByText(/1/));
    const circleElement = getByTestId("circle-0");
    expect(circleElement.classList).toContain("passcode-module-circle-fill");
    const backspaceButton = getByTestId("setpasscode-backspace-button");
    fireEvent.click(backspaceButton);
    expect(circleElement.classList).not.toContain(
      "passcode-module-circle-fill"
    );
  });

  test("Renders Re-enter Passcode title and start over button when passcode is set", () => {
    const { getByText } = render(
      <Provider store={store}>
        <SetPasscode />
      </Provider>
    );
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));

    expect(
      getByText(EN_TRANSLATIONS.setpasscode.reenterpasscode.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.setpasscode.startover.label)
    ).toBeInTheDocument();
  });

  test("renders enter passcode restarting the process when start over button is clicked", () => {
    const { getByText } = render(
      <Provider store={store}>
        <SetPasscode />
      </Provider>
    );
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));

    const labelElement = getByText(
      EN_TRANSLATIONS.setpasscode.reenterpasscode.title
    );
    expect(labelElement).toBeInTheDocument();

    const startOverElement = getByText(
      EN_TRANSLATIONS.setpasscode.startover.label
    );
    fireEvent.click(startOverElement);

    const passcodeLabel = getByText(
      EN_TRANSLATIONS.setpasscode.enterpasscode.title
    );
    expect(passcodeLabel).toBeInTheDocument();
  });

  test("Entering a wrong passcode at the passcode confirmation returns an error", () => {
    const { getByText } = render(
      <Provider store={store}>
        <SetPasscode />
      </Provider>
    );
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/2/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/3/));
    fireEvent.click(getByText(/4/));
    fireEvent.click(getByText(/5/));

    const labelElement = getByText(
      EN_TRANSLATIONS.setpasscode.reenterpasscode.title
    );
    expect(labelElement).toBeInTheDocument();

    fireEvent.click(getByText(/6/));
    fireEvent.click(getByText(/7/));
    fireEvent.click(getByText(/8/));
    fireEvent.click(getByText(/9/));
    fireEvent.click(getByText(/0/));
    fireEvent.click(getByText(/1/));

    const errorMessage = getByText(
      EN_TRANSLATIONS.setpasscode.enterpasscode.error
    );
    expect(errorMessage).toBeInTheDocument();
  });

  test("Back to enter passcode screen from re-enter passcode screen", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <SetPasscode />
      </Provider>
    );
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/2/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/3/));
    fireEvent.click(getByText(/4/));
    fireEvent.click(getByText(/5/));

    const reEnterPasscodeLabel = getByText(
      EN_TRANSLATIONS.setpasscode.reenterpasscode.title
    );
    expect(reEnterPasscodeLabel).toBeInTheDocument();

    fireEvent.click(getByTestId("back-button"));

    const enterPasscodeLabel = getByText(
      EN_TRANSLATIONS.setpasscode.enterpasscode.title
    );
    expect(enterPasscodeLabel).toBeInTheDocument();
  });

  test("Redirects to next page when passcode is entered correctly", async () => {
    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={[RoutePath.SET_PASSCODE]}>
        <Provider store={store}>
          <Route
            exact
            path={RoutePath.SET_PASSCODE}
            component={SetPasscode}
          />
        </Provider>
        <Route
          path={RoutePath.GENERATE_SEED_PHRASE}
          component={GenerateSeedPhrase}
        />
      </MemoryRouter>
    );

    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));

    const labelElement = getByText(
      EN_TRANSLATIONS.setpasscode.reenterpasscode.title
    );
    expect(labelElement).toBeInTheDocument();

    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.generateseedphrase.onboarding.title)
      ).not.toBeInTheDocument()
    );

    expect(setKeyStoreSpy).toBeCalledWith(KeyStoreKeys.APP_PASSCODE, "111111");
  });
  test("calls handleOnBack when back button is clicked", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [RoutePath.SET_PASSCODE, RoutePath.ONBOARDING],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {
        seedPhrase160: "",
        seedPhrase256: "",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { queryByText, getByTestId } = render(
      <MemoryRouter initialEntries={[RoutePath.SET_PASSCODE]}>
        <Provider store={storeMocked}>
          <SetPasscode />
        </Provider>
      </MemoryRouter>
    );
    const backButton = getByTestId("back-button");
    fireEvent.click(backButton);
    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.setpasscode.enterpasscode.title)
      ).toBeInTheDocument()
    );
  });
});
