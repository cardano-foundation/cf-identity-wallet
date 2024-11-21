import { BiometryType } from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { IonRouterOutlet } from "@ionic/react";
import { IonReactMemoryRouter, IonReactRouter } from "@ionic/react-router";
import { fireEvent, render, waitFor } from "@testing-library/react";
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
import { passcodeFiller } from "../../utils/passcodeFiller";

const setKeyStoreSpy = jest.spyOn(SecureStorage, "set").mockResolvedValue();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(() => Promise.resolve()),
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

  test("Renders Re-enter Passcode title and start over button when passcode is set", async () => {
    require("@ionic/react");
    const { getByText, getByTestId, findByText } = render(
      <Provider store={store}>
        <SetPasscode />
      </Provider>
    );

    await passcodeFiller(getByText, getByTestId, "1", 6);
    const text = await findByText(EN_TRANSLATIONS.setpasscode.reenterpasscode);

    await waitFor(() =>
      expect(text).toBeInTheDocument()
    );

    expect(
      getByText(EN_TRANSLATIONS.createpasscodemodule.cantremember)
    ).toBeInTheDocument();
  });

  test("renders enter passcode restarting the process when start over button is clicked", async () => {
    require("@ionic/react");
    const { getByText, queryByText, getByTestId, findByText } = render(
      <Provider store={store}>
        <SetPasscode />
      </Provider>
    );
    
    await passcodeFiller(getByText, getByTestId, "1", 6);
    const text = await findByText(EN_TRANSLATIONS.setpasscode.reenterpasscode);

    await waitFor(() =>
      expect(text).toBeInTheDocument()
    );


    const startOverElement = getByText(
      EN_TRANSLATIONS.createpasscodemodule.cantremember
    );

    fireEvent.click(startOverElement);

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.setpasscode.enterpasscode)
      ).toBeInTheDocument()
    );
  });

  test("Back to enter passcode screen from re-enter passcode screen", async () => {
    const { getByText, getByTestId, queryByText, findByText } = render(
      <Provider store={store}>
        <SetPasscode />
      </Provider>
    );
    await passcodeFiller(getByText, getByTestId, "2", 6);
    const text = await findByText(EN_TRANSLATIONS.setpasscode.reenterpasscode);

    await waitFor(() =>
      expect(text).toBeInTheDocument()
    );


    fireEvent.click(getByTestId("close-button"));

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.setpasscode.enterpasscode)
      ).toBeInTheDocument()
    );
  });

  test("Redirects to next page when passcode is entered correctly", async () => {
    require("@ionic/react");
    const { getByText, queryByText, getByTestId, findByText } = render(
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

    await passcodeFiller(getByText, getByTestId, "1", 6);

    const text = await findByText(EN_TRANSLATIONS.setpasscode.reenterpasscode);

    await waitFor(() =>
      expect(text).toBeInTheDocument()
    );

    await passcodeFiller(getByText, getByTestId, "1", 6);

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
    const backButton = getByTestId("close-button");
    fireEvent.click(backButton);
    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.setpasscode.enterpasscode)
      ).toBeInTheDocument()
    );
  });
});
