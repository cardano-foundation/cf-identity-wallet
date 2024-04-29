import { MemoryRouter, Route, Router } from "react-router-dom";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { createMemoryHistory } from "history";
import { IonReactMemoryRouter } from "@ionic/react-router";
import { PasscodeLogin } from "./PasscodeLogin";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { SetPasscode } from "../SetPasscode";
import { store } from "../../../store";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { RoutePath } from "../../../routes";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../globals/constants";
import { OperationType } from "../../globals/types";

interface StoreMocked {
  stateCache: {
    routes: RoutePath[];
    authentication: {
      loggedIn: boolean;
      time: number;
      passcodeIsSet: boolean;
      seedPhraseIsSet?: boolean;
    };
    currentOperation: OperationType;
  };
  seedPhraseCache: {
    seedPhrase160: string;
    seedPhrase256: string;
    selected: number;
  };
}

const mockStore = configureStore();
const dispatchMock = jest.fn();
const history = createMemoryHistory();
const storeMocked = (initialState: StoreMocked) => {
  return {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };
};

describe("Passcode Login Page", () => {
  beforeAll(() => {
    history.push(RoutePath.PASSCODE_LOGIN);
  });

  const initialStateWithSeedPhrase = {
    stateCache: {
      routes: [RoutePath.PASSCODE_LOGIN],
      authentication: {
        loggedIn: false,
        time: Date.now(),
        passcodeIsSet: true,
        seedPhraseIsSet: true,
      },
      currentOperation: OperationType.IDLE,
    },
    seedPhraseCache: {
      seedPhrase160:
        "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
      seedPhrase256: "",
      selected: FIFTEEN_WORDS_BIT_LENGTH,
    },
  };

  const initialStateWithoutSeedPhrase = {
    stateCache: {
      routes: [RoutePath.PASSCODE_LOGIN],
      authentication: {
        loggedIn: false,
        time: Date.now(),
        passcodeIsSet: true,
        seedPhraseIsSet: false,
      },
      currentOperation: OperationType.IDLE,
    },
    seedPhraseCache: {
      seedPhrase160: "",
      seedPhrase256: "",
      selected: FIFTEEN_WORDS_BIT_LENGTH,
    },
  };

  test("Renders Passcode Login page with title and description", () => {
    const { getByText } = render(
      <Provider store={store}>
        <PasscodeLogin />
      </Provider>
    );
    expect(getByText(EN_TRANSLATIONS.passcodelogin.title)).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.passcodelogin.description)
    ).toBeInTheDocument();
  });

  test("The user can add and remove digits from the passcode", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <PasscodeLogin />
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

  test("If no seed phrase was stored and I click on I forgot my passcode, I can start over", async () => {
    const history = createMemoryHistory();
    history.push(RoutePath.PASSCODE_LOGIN);

    const { getByText, findByText } = render(
      <Provider store={storeMocked(initialStateWithoutSeedPhrase)}>
        <IonReactMemoryRouter
          history={history}
          initialEntries={[RoutePath.PASSCODE_LOGIN]}
        >
          <Route
            path={RoutePath.PASSCODE_LOGIN}
            component={PasscodeLogin}
          />
          <Route
            path={RoutePath.SET_PASSCODE}
            component={SetPasscode}
          />
        </IonReactMemoryRouter>
      </Provider>
    );
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/2/));
    fireEvent.click(getByText(/3/));
    fireEvent.click(getByText(/4/));
    fireEvent.click(getByText(/5/));
    fireEvent.click(getByText(/6/));
    expect(await findByText(EN_TRANSLATIONS.passcodelogin.error)).toBeVisible();
    fireEvent.click(getByText(EN_TRANSLATIONS.passcodelogin.forgotten.button));
    expect(
      await findByText(EN_TRANSLATIONS.passcodelogin.alert.text.restart)
    ).toBeVisible();
    fireEvent.click(
      getByText(EN_TRANSLATIONS.passcodelogin.alert.button.restart)
    );
    expect(
      await findByText(EN_TRANSLATIONS.setpasscode.enterpasscode.title)
    ).toBeVisible();
  });

  test("If a seed phrase was stored and I click on I forgot my passcode, I can start over", async () => {
    const history = createMemoryHistory();
    history.push(RoutePath.PASSCODE_LOGIN);

    const { getByText, findByText } = render(
      <Provider store={storeMocked(initialStateWithSeedPhrase)}>
        <IonReactMemoryRouter
          history={history}
          initialEntries={[RoutePath.PASSCODE_LOGIN]}
        >
          <Route
            path={RoutePath.PASSCODE_LOGIN}
            component={PasscodeLogin}
          />
          <Route
            path={RoutePath.SET_PASSCODE}
            component={SetPasscode}
          />
        </IonReactMemoryRouter>
      </Provider>
    );
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/2/));
    fireEvent.click(getByText(/3/));
    fireEvent.click(getByText(/4/));
    fireEvent.click(getByText(/5/));
    fireEvent.click(getByText(/6/));
    expect(await findByText(EN_TRANSLATIONS.passcodelogin.error)).toBeVisible();
    fireEvent.click(getByText(EN_TRANSLATIONS.passcodelogin.forgotten.button));
    expect(
      await findByText(EN_TRANSLATIONS.passcodelogin.alert.text.verify)
    ).toBeVisible();
    fireEvent.click(
      getByText(EN_TRANSLATIONS.passcodelogin.alert.button.verify)
    );
    expect(
      await findByText(EN_TRANSLATIONS.setpasscode.enterpasscode.title)
    ).toBeVisible();
  });

  test("verifies passcode and navigates to next route", async () => {
    const storedPass = "storedPass";
    const secureStorageGetMock = jest
      .spyOn(SecureStorage, "get")
      .mockResolvedValue(storedPass);

    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[RoutePath.PASSCODE_LOGIN]}>
          <Route
            path={RoutePath.PASSCODE_LOGIN}
            component={PasscodeLogin}
          />
          <Route
            path={RoutePath.SET_PASSCODE}
            component={SetPasscode}
          />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));

    await waitFor(() => {
      expect(secureStorageGetMock).toHaveBeenCalledWith(
        KeyStoreKeys.APP_PASSCODE
      );
    });
  });
  test.skip("verifies passcode and navigates to next route", async () => {
    const { getByText, queryByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[RoutePath.PASSCODE_LOGIN]}>
          <Route
            path={RoutePath.PASSCODE_LOGIN}
            component={PasscodeLogin}
          />
          <Route
            path={RoutePath.SET_PASSCODE}
            component={SetPasscode}
          />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));

    await waitFor(() => {
      expect(
        queryByText(EN_TRANSLATIONS.generateseedphrase.onboarding.title)
      ).toBeVisible();
    });
  });
});
