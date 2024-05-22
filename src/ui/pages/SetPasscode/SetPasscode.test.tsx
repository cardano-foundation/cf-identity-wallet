import { Redirect, Route } from "react-router-dom";
import { createMemoryHistory } from "history";
import {
  act,
  fireEvent,
  render,
  waitFor,
  RenderResult,
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { IonReactMemoryRouter, IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import {
  BiometryError,
  BiometryType,
} from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { BiometryErrorType } from "@aparajita/capacitor-biometric-auth";
import { SetPasscode } from "./SetPasscode";
import { GenerateSeedPhrase } from "../GenerateSeedPhrase";
import { SecureStorage, KeyStoreKeys } from "../../../core/storage";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { store } from "../../../store";
import { RoutePath } from "../../../routes";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../globals/constants";
import { MiscRecordId } from "../../../core/agent/agent.types";

const setKeyStoreSpy = jest.spyOn(SecureStorage, "set").mockResolvedValue();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
      },
    },
  },
}));

const createOrUpdateBasicRecordSpy = jest.spyOn(
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("../../../core/agent/records/createOrUpdateBasicRecord"),
  "createOrUpdateBasicRecord"
);

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

  test("Renders Create Passcode page with title and description", () => {
    require("@ionic/react");
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
    require("@ionic/react");
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
    require("@ionic/react");
    const { getByText } = render(
      <Provider store={store}>
        <SetPasscode />
      </Provider>
    );
    clickButtonRepeatedly(getByText, "1", 6);

    expect(
      getByText(EN_TRANSLATIONS.setpasscode.reenterpasscode.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.setpasscode.startover.label)
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
    require("@ionic/react");
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

    const labelElement = getByText(
      EN_TRANSLATIONS.setpasscode.reenterpasscode.title
    );
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
        seedPhrase160: "",
        seedPhrase256: "",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
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
        queryByText(EN_TRANSLATIONS.setpasscode.enterpasscode.title)
      ).toBeInTheDocument()
    );
  });

  test("Setup passcode and Android biometrics", async () => {
    jest.doMock("@ionic/react", () => {
      const actualIonicReact = jest.requireActual("@ionic/react");
      return {
        ...actualIonicReact,
        getPlatforms: () => ["android"],
      };
    });
    require("@ionic/react");

    const { getByText, queryByText, getByTestId } = render(
      <IonReactRouter>
        <IonRouterOutlet animated={false}>
          <Provider store={store}>
            <SetPasscode />
          </Provider>
        </IonRouterOutlet>
      </IonReactRouter>
    );

    clickButtonRepeatedly(getByText, "1", 6);

    expect(
      getByText(EN_TRANSLATIONS.setpasscode.reenterpasscode.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.setpasscode.startover.label)
    ).toBeInTheDocument();

    clickButtonRepeatedly(getByText, "1", 6);

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.biometry.setupandroidbiometryheader)
      ).toBeInTheDocument()
    );

    act(() => {
      fireEvent.click(
        getByTestId("alert-setup-android-biometry-confirm-button")
      );
    });

    await waitFor(() => {
      expect(createOrUpdateBasicRecordSpy).toBeCalledWith(
        expect.objectContaining({
          id: MiscRecordId.APP_BIOMETRY,
          content: {
            enabled: true,
          },
        })
      );
    });

    expect(setKeyStoreSpy).toBeCalledWith(KeyStoreKeys.APP_PASSCODE, "111111");
    expect(createOrUpdateBasicRecordSpy).toBeCalledWith(
      expect.objectContaining({
        id: MiscRecordId.APP_ALREADY_INIT,
        content: {
          initialized: true,
        },
      })
    );
  });

  test("Setup passcode and cancel Android biometrics", async () => {
    jest.doMock("@ionic/react", () => {
      const actualIonicReact = jest.requireActual("@ionic/react");
      return {
        ...actualIonicReact,
        getPlatforms: () => ["android"],
      };
    });
    require("@ionic/react");

    const { getByText, queryByText, getByTestId } = render(
      <IonReactRouter>
        <IonRouterOutlet animated={false}>
          <Provider store={store}>
            <SetPasscode />
          </Provider>
        </IonRouterOutlet>
      </IonReactRouter>
    );

    clickButtonRepeatedly(getByText, "1", 6);

    expect(
      getByText(EN_TRANSLATIONS.setpasscode.reenterpasscode.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.setpasscode.startover.label)
    ).toBeInTheDocument();

    clickButtonRepeatedly(getByText, "1", 6);

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.biometry.setupandroidbiometryheader)
      ).toBeInTheDocument()
    );

    act(() => {
      fireEvent.click(
        getByTestId("alert-setup-android-biometry-cancel-button")
      );
    });

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.biometry.setupandroidbiometrycancel)
      ).toBeInTheDocument()
    );
  });

  test("Setup passcode and iOS biometrics", async () => {
    jest.doMock("../../hooks/useBiometricsHook", () => ({
      useBiometricAuth: jest.fn(() => ({
        biometricsIsEnabled: false,
        biometricInfo: {
          isAvailable: true,
          hasCredentials: false,
          biometryType: BiometryType.faceId,
          strongBiometryIsAvailable: true,
        },
        handleBiometricAuth: jest.fn(() => Promise.resolve(true)),
        setBiometricsIsEnabled: jest.fn(),
      })),
    }));
    jest.doMock("@ionic/react", () => {
      const actualIonicReact = jest.requireActual("@ionic/react");
      return {
        ...actualIonicReact,
        getPlatforms: () => ["ios"],
      };
    });
    require("@ionic/react");

    const { getByText } = render(
      <IonReactRouter>
        <IonRouterOutlet animated={false}>
          <Provider store={store}>
            <SetPasscode />
          </Provider>
        </IonRouterOutlet>
      </IonReactRouter>
    );

    clickButtonRepeatedly(getByText, "1", 6);

    expect(
      getByText(EN_TRANSLATIONS.setpasscode.reenterpasscode.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.setpasscode.startover.label)
    ).toBeInTheDocument();

    clickButtonRepeatedly(getByText, "1", 6);

    await waitFor(() => {
      expect(createOrUpdateBasicRecordSpy).toBeCalledWith(
        expect.objectContaining({
          id: MiscRecordId.APP_BIOMETRY,
          content: {
            enabled: true,
          },
        })
      );
    });

    await waitFor(() =>
      expect(setKeyStoreSpy).toBeCalledWith(KeyStoreKeys.APP_PASSCODE, "111111")
    );
    expect(createOrUpdateBasicRecordSpy).toBeCalledWith(
      expect.objectContaining({
        id: MiscRecordId.APP_ALREADY_INIT,
        content: {
          initialized: true,
        },
      })
    );
  });

  test("Setup passcode and cancel iOS biometrics", async () => {
    jest.doMock("../../hooks/useBiometricsHook", () => ({
      useBiometricAuth: jest.fn(() => ({
        biometricsIsEnabled: false,
        biometricInfo: {
          isAvailable: true,
          hasCredentials: false,
          biometryType: BiometryType.faceId,
          strongBiometryIsAvailable: true,
        },
        handleBiometricAuth: jest.fn(() =>
          Promise.resolve(new BiometryError("", BiometryErrorType.userCancel))
        ),
        setBiometricsIsEnabled: jest.fn(),
      })),
    }));

    jest.doMock("@ionic/react", () => {
      const actualIonicReact = jest.requireActual("@ionic/react");
      return {
        ...actualIonicReact,
        getPlatforms: () => ["ios"],
      };
    });
    require("@ionic/react");

    const { getByText, queryByText } = render(
      <IonReactRouter>
        <IonRouterOutlet animated={false}>
          <Provider store={store}>
            <SetPasscode />
          </Provider>
        </IonRouterOutlet>
      </IonReactRouter>
    );

    clickButtonRepeatedly(getByText, "1", 6);

    expect(
      getByText(EN_TRANSLATIONS.setpasscode.reenterpasscode.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.setpasscode.startover.label)
    ).toBeInTheDocument();

    clickButtonRepeatedly(getByText, "1", 6);

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.biometry.setupandroidbiometrycancel)
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
