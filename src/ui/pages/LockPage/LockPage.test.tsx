import { MemoryRouter, Route } from "react-router-dom";
import {
  act,
  fireEvent,
  render,
  RenderResult,
  waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { IonReactRouter } from "@ionic/react-router";
import {
  BiometryError,
  BiometryType,
} from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { BiometryErrorType } from "@aparajita/capacitor-biometric-auth";
import { waitForIonicReact } from "@ionic/react-test-utils";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { RoutePath } from "../../../routes";
import { OperationType } from "../../globals/types";
import { SetPasscode } from "../SetPasscode";
import { LockPage } from "./LockPage";

const incrementLoginAttemptMock = jest.fn();
const resetLoginAttemptsMock = jest.fn();

jest.mock("../../../core/storage", () => ({
  ...jest.requireActual("../../../core/storage"),
  SecureStorage: {
    get: () => "111111",
  },
}));

jest.mock("../../../core/agent/agent", () => ({
  ...jest.requireActual("../../../core/agent/agent"),
  Agent: {
    agent: {
      auth: {
        incrementLoginAttempts: () => incrementLoginAttemptMock(),
        resetLoginAttempts: () => resetLoginAttemptsMock(),
      },
    },
  },
}));

jest.mock("../../hooks/useBiometricsHook", () => ({
  useBiometricAuth: jest.fn(() => ({
    biometricsIsEnabled: true,
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

interface StoreMockedProps {
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
    seedPhrase: string;
    bran: string;
  };
  cryptoAccountsCache: {
    cryptoAccounts: never[];
  };
  biometricsCache: {
    enabled: boolean;
  };
}

const mockStore = configureStore();
const dispatchMock = jest.fn();
const storeMocked = (initialState: StoreMockedProps) => {
  return {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };
};

const initialState = {
  stateCache: {
    routes: [RoutePath.GENERATE_SEED_PHRASE],
    authentication: {
      loggedIn: false,
      time: Date.now(),
      passcodeIsSet: true,
      seedPhraseIsSet: false,
      loginAttempt: {
        attempts: 0,
        lockedUntil: Date.now(),
      },
    },
    currentOperation: OperationType.IDLE,
  },
  seedPhraseCache: {
    seedPhrase: "",
    bran: "",
  },
  cryptoAccountsCache: {
    cryptoAccounts: [],
  },
  biometricsCache: {
    enabled: true,
  },
};

describe("Lock Page", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock("@ionic/react", () => {
      const actualIonicReact = jest.requireActual("@ionic/react");
      return {
        ...actualIonicReact,
        getPlatforms: () => ["ios"],
      };
    });
  });

  test("Renders Lock modal with title and description", () => {
    const { getByText } = render(
      <Provider store={storeMocked(initialState)}>
        <LockPage />
      </Provider>
    );
    expect(getByText(EN_TRANSLATIONS.lockpage.title)).toBeInTheDocument();
    expect(getByText(EN_TRANSLATIONS.lockpage.description)).toBeInTheDocument();
  });

  test("The user can add and remove digits from the passcode", () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked(initialState)}>
        <LockPage />
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

  test("I click on I forgot my passcode, I can start over", async () => {
    const { getByText, findByText } = render(
      <Provider store={storeMocked(initialState)}>
        <MemoryRouter initialEntries={[RoutePath.ROOT]}>
          <IonReactRouter>
            <LockPage />
            <Route
              path={RoutePath.SET_PASSCODE}
              component={SetPasscode}
            />
          </IonReactRouter>
        </MemoryRouter>
      </Provider>
    );
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/2/));
    fireEvent.click(getByText(/3/));
    fireEvent.click(getByText(/4/));
    fireEvent.click(getByText(/5/));
    fireEvent.click(getByText(/6/));
    expect(await findByText(EN_TRANSLATIONS.lockpage.error)).toBeVisible();
    fireEvent.click(getByText(EN_TRANSLATIONS.lockpage.forgotten.button));
    expect(
      await findByText(EN_TRANSLATIONS.lockpage.alert.text.verify)
    ).toBeVisible();
    fireEvent.click(getByText(EN_TRANSLATIONS.lockpage.alert.button.verify));
    await waitForIonicReact();
    expect(
      await findByText(EN_TRANSLATIONS.forgotauth.passcode.title)
    ).toBeVisible();
  });

  test("Verifies passcode and hides page upon correct input", async () => {
    jest.doMock("../../hooks/useBiometricsHook", () => ({
      useBiometricAuth: jest.fn(() => ({
        biometricsIsEnabled: false,
        biometricInfo: {
          isAvailable: false,
          hasCredentials: false,
          biometryType: BiometryType.none,
          strongBiometryIsAvailable: false,
        },
        handleBiometricAuth: jest.fn(() =>
          Promise.resolve(
            new BiometryError("", BiometryErrorType.biometryNotAvailable)
          )
        ),
        setBiometricsIsEnabled: jest.fn(),
      })),
    }));
    const correctPasscode = "111111";
    jest.spyOn(SecureStorage, "get").mockResolvedValue(correctPasscode);

    const { getByText, queryByTestId } = render(
      <Provider store={storeMocked(initialState)}>
        <LockPage />
      </Provider>
    );

    Array.from(correctPasscode).forEach((digit) => {
      fireEvent.click(getByText(new RegExp(`^${digit}$`, "i")));
    });

    await waitFor(() => {
      expect(SecureStorage.get).toHaveBeenCalledWith(KeyStoreKeys.APP_PASSCODE);
    });

    await waitFor(() => {
      expect(queryByTestId("lock-page")).not.toBeInTheDocument();
    });
  });
  test("Login using biometrics", async () => {
    jest.doMock("../../hooks/useBiometricsHook", () => ({
      useBiometricAuth: jest.fn(() => ({
        biometricsIsEnabled: true,
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

    const { queryByTestId } = render(
      <Provider store={storeMocked(initialState)}>
        <LockPage />
      </Provider>
    );

    await waitFor(() => {
      expect(SecureStorage.get).not.toHaveBeenCalledWith(
        KeyStoreKeys.APP_PASSCODE
      );
    });

    await waitFor(() => {
      expect(queryByTestId("lock-page")).not.toBeInTheDocument();
    });
  });

  test("Cancel login using biometrics and re-enabling", async () => {
    jest.doMock("../../hooks/useBiometricsHook", () => ({
      useBiometricAuth: jest.fn(() => ({
        biometricsIsEnabled: true,
        biometricInfo: {
          isAvailable: true,
          hasCredentials: false,
          biometryType: BiometryType.fingerprintAuthentication,
          strongBiometryIsAvailable: true,
        },
        handleBiometricAuth: jest.fn(() =>
          Promise.resolve(new BiometryError("", BiometryErrorType.userCancel))
        ),
        setBiometricsIsEnabled: jest.fn(),
      })),
    }));

    const { queryByTestId, getByTestId } = render(
      <Provider store={storeMocked(initialState)}>
        <LockPage />
      </Provider>
    );

    await waitFor(() => {
      expect(queryByTestId("passcode-button-#")).toBeInTheDocument();
    });

    jest.doMock("../../hooks/useBiometricsHook", () => ({
      useBiometricAuth: jest.fn(() => ({
        biometricsIsEnabled: true,
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

    act(() => {
      fireEvent.click(getByTestId("passcode-button-#"));
    });

    await waitFor(() => {
      expect(SecureStorage.get).not.toHaveBeenCalledWith(
        KeyStoreKeys.APP_PASSCODE
      );
    });

    await waitFor(() => {
      expect(queryByTestId("lock-page")).not.toBeInTheDocument();
    });
  });
});

describe("Lock Page: Max login attempt", () => {
  const initialState = {
    stateCache: {
      routes: [RoutePath.GENERATE_SEED_PHRASE],
      authentication: {
        loggedIn: false,
        time: Date.now(),
        passcodeIsSet: true,
        seedPhraseIsSet: false,
        loginAttempt: {
          attempts: 0,
          lockedUntil: Date.now(),
        },
      },
      currentOperation: OperationType.IDLE,
    },
    seedPhraseCache: {
      seedPhrase: "",
      bran: "",
    },
    cryptoAccountsCache: {
      cryptoAccounts: [],
    },
    biometricsCache: {
      enabled: true,
    },
  };

  test("Show remain login error", async () => {
    initialState.stateCache.authentication.loginAttempt.attempts = 2;

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <LockPage />
      </Provider>
    );

    expect(getByText(EN_TRANSLATIONS.lockpage.title)).toBeInTheDocument();
    expect(getByText(EN_TRANSLATIONS.lockpage.description)).toBeInTheDocument();

    act(() => {
      clickButtonRepeatedly(getByText, getByTestId, "2", 6);
    });
    await waitFor(() => {
      expect(getByText("3 attempt remaining")).toBeInTheDocument();
      expect(incrementLoginAttemptMock).toBeCalled();
    });
  });

  test("Show max login attemp alert", async () => {
    initialState.stateCache.authentication.loginAttempt.attempts = 5;

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByText } = render(
      <Provider store={storeMocked}>
        <LockPage />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.lockpage.attemptalert.title)
    ).toBeInTheDocument();
  });

  test("Reset login attempt", async () => {
    initialState.stateCache.authentication.loginAttempt.attempts = 2;

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <LockPage />
      </Provider>
    );

    expect(getByText(EN_TRANSLATIONS.lockpage.title)).toBeInTheDocument();
    expect(getByText(EN_TRANSLATIONS.lockpage.description)).toBeInTheDocument();

    act(() => {
      clickButtonRepeatedly(getByText, getByTestId, "1", 6);
    });
    await waitFor(() => {
      expect(resetLoginAttemptsMock).toBeCalled();
    });
  });
});

const clickButtonRepeatedly = async (
  getByText: RenderResult["getByText"],
  getByTestId: RenderResult["getByTestId"],
  buttonLabel: string,
  times: number
) => {
  for (let i = 0; i < times; i++) {
    fireEvent.click(getByText(buttonLabel));

    await waitFor(() => {
      expect(
        getByTestId("circle-" + i).classList.contains(
          "passcode-module-circle-fill"
        )
      ).toBe(true);
    });
  }
};

export type { StoreMockedProps };
