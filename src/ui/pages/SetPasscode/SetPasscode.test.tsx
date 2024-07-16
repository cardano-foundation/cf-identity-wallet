import { BiometryType } from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { IonRouterOutlet } from "@ionic/react";
import { IonReactMemoryRouter, IonReactRouter } from "@ionic/react-router";
import {
  RenderResult,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Provider } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import configureStore from "redux-mock-store";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { RoutePath } from "../../../routes";
import { store } from "../../../store";
import { GenerateSeedPhrase } from "../GenerateSeedPhrase";
import { SetPasscode } from "./SetPasscode";

const setKeyStoreSpy = jest.spyOn(SecureStorage, "set").mockResolvedValue();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        createOrUpdateBasicRecord: jest.fn(),
      },
    },
  },
}));

jest.mock("../../hooks/useBiometricsHook", () => ({
  useBiometricAuth: jest.fn(() => ({
    biometricsIsEnabled: false,
    biometricInfo: {
      isAvailable: true,
      hasCredentials: false,
      biometryType: BiometryType.fingerprintAuthentication,
      strongBiometryIsAvailable: true,
    },
    handleBiometricAuth: jest.fn(() => Promise.resolve(true)),
    setBiometricsIsEnabled: jest.fn(),
  })),
}));

describe("SetPasscode Page", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock("@ionic/react", () => {
      const actualIonicReact = jest.requireActual("@ionic/react");
      return {
        ...actualIonicReact,
        getPlatforms: () => ["mobileweb"],
      };
    });
  });

  test("Renders Re-enter Passcode title and start over button when passcode is set", () => {
    require("@ionic/react");
    const { getByText } = render(
      <Provider store={store}>
        <SetPasscode />
      </Provider>
    );
    clickButtonRepeatedly(getByText, "1", 6);

    expect(
      getByText(EN_TRANSLATIONS.setpasscode.reenterpasscode)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.createpasscodemodule.cantremember)
    ).toBeInTheDocument();
  });

  test("renders enter passcode restarting the process when start over button is clicked", () => {
    require("@ionic/react");
    const { getByText } = render(
      <Provider store={store}>
        <SetPasscode />
      </Provider>
    );
    clickButtonRepeatedly(getByText, "1", 6);

    const labelElement = getByText(EN_TRANSLATIONS.setpasscode.reenterpasscode);
    expect(labelElement).toBeInTheDocument();

    const startOverElement = getByText(
      EN_TRANSLATIONS.createpasscodemodule.cantremember
    );
    fireEvent.click(startOverElement);

    const passcodeLabel = getByText(EN_TRANSLATIONS.setpasscode.enterpasscode);
    expect(passcodeLabel).toBeInTheDocument();
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
      EN_TRANSLATIONS.setpasscode.reenterpasscode
    );
    expect(reEnterPasscodeLabel).toBeInTheDocument();

    fireEvent.click(getByTestId("back-button"));

    const enterPasscodeLabel = getByText(
      EN_TRANSLATIONS.setpasscode.enterpasscode
    );
    expect(enterPasscodeLabel).toBeInTheDocument();
  });

  test("Redirects to next page when passcode is entered correctly", async () => {
    require("@ionic/react");
    const { getByText, queryByText } = render(
      <IonReactRouter>
        <IonRouterOutlet animated={false}>
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
          <Redirect
            exact
            from="/"
            to={RoutePath.SET_PASSCODE}
          />
        </IonRouterOutlet>
      </IonReactRouter>
    );

    clickButtonRepeatedly(getByText, "1", 6);

    const labelElement = getByText(EN_TRANSLATIONS.setpasscode.reenterpasscode);
    expect(labelElement).toBeInTheDocument();

    clickButtonRepeatedly(getByText, "1", 6);

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.generateseedphrase.onboarding.title)
      ).not.toBeInTheDocument()
    );

    await waitFor(() =>
      expect(setKeyStoreSpy).toBeCalledWith(KeyStoreKeys.APP_PASSCODE, "111111")
    );
  });
  test("calls handleOnBack when back button is clicked", async () => {
    require("@ionic/react");
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
        seedPhrase: "",
        bran: "",
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();
    history.push(RoutePath.VERIFY_SEED_PHRASE);

    const { queryByText, getByTestId } = render(
      <IonReactMemoryRouter
        history={history}
        initialEntries={[RoutePath.SET_PASSCODE]}
      >
        <Provider store={storeMocked}>
          <SetPasscode />
        </Provider>
      </IonReactMemoryRouter>
    );
    const backButton = getByTestId("back-button");
    fireEvent.click(backButton);
    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.setpasscode.enterpasscode)
      ).toBeInTheDocument()
    );
  });
});

const clickButtonRepeatedly = (
  getByText: RenderResult["getByText"],
  buttonLabel: string,
  times: number
) => {
  for (let i = 0; i < times; i++) {
    fireEvent.click(getByText(buttonLabel));
  }
};
