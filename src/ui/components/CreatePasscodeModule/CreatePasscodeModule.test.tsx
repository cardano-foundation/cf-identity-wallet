import { BiometryErrorType } from "@aparajita/capacitor-biometric-auth";
import {
  BiometryError,
  BiometryType,
} from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { act } from "react";
import {
  cleanup,
  fireEvent,
  render,
  waitFor
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { KeyStoreKeys } from "../../../core/storage";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { store } from "../../../store";
import { passcodeFiller } from "../../utils/passcodeFiller";
import { CreatePasscodeModule } from "./CreatePasscodeModule";

const setMock = jest.fn();

jest.mock("../../../core/storage", () => ({
  ...jest.requireActual("../../../core/storage"),
  SecureStorage: {
    get: jest.fn(),
    set: (...arg: unknown[]) => setMock(...arg)
  },
}));

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

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: (key: string) => {
      return "121345";
    },
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();
const initialState = {
  stateCache: {
    routes: ["/"],
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

describe("SetPasscode Page", () => {
  afterEach(() => {
    cleanup();
  })
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
        <CreatePasscodeModule
          title={EN_TRANSLATIONS.setpasscode.enterpasscode}
          description={EN_TRANSLATIONS.setpasscode.description}
          testId="set-passcode"
          onCreateSuccess={jest.fn()}
        />
      </Provider>
    );
    expect(
      getByText(EN_TRANSLATIONS.setpasscode.enterpasscode)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.setpasscode.description)
    ).toBeInTheDocument();
  });

  test("The user can add and remove digits from the passcode", () => {
    require("@ionic/react");
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <CreatePasscodeModule
          title={EN_TRANSLATIONS.setpasscode.enterpasscode}
          description={EN_TRANSLATIONS.setpasscode.description}
          testId="set-passcode"
          onCreateSuccess={jest.fn()}
        />
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

  test("Entering a wrong passcode at the passcode confirmation returns an error", async () => {
    require("@ionic/react");
    const { getByText, queryByText, getByTestId } = render(
      <Provider store={store}>
        <CreatePasscodeModule
          title={EN_TRANSLATIONS.setpasscode.reenterpasscode}
          description={EN_TRANSLATIONS.setpasscode.description}
          testId="set-passcode"
          onCreateSuccess={jest.fn()}
        />
      </Provider>
    );

    await passcodeFiller(getByText, getByTestId, "2", 6);

    await waitFor(() => {
      const labelElement = getByText(EN_TRANSLATIONS.setpasscode.reenterpasscode);
      expect(labelElement).toBeInTheDocument();
    })

    await passcodeFiller(getByText, getByTestId, "3", 6);

    await waitFor(
      () =>
        expect(queryByText(EN_TRANSLATIONS.createpasscodemodule.errornomatch))
          .toBeVisible
    );
  });

  test("Entering an existing passcode returns an error", async () => {
    require("@ionic/react");
    const { getByText, queryByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <CreatePasscodeModule
          title={EN_TRANSLATIONS.setpasscode.reenterpasscode}
          description={EN_TRANSLATIONS.setpasscode.description}
          testId="set-passcode"
          onCreateSuccess={jest.fn()}
        />
      </Provider>
    );

    await passcodeFiller(getByText, getByTestId, "2", 6);

    await waitFor(
      () =>
        expect(queryByText(EN_TRANSLATIONS.createpasscodemodule.errornomatch))
          .toBeVisible
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

    const { getByText, queryByText, getByTestId } = render(
      <IonReactRouter>
        <IonRouterOutlet animated={false}>
          <Provider store={store}>
            <CreatePasscodeModule
              title={EN_TRANSLATIONS.setpasscode.reenterpasscode}
              description={EN_TRANSLATIONS.setpasscode.description}
              testId="set-passcode"
              onCreateSuccess={jest.fn()}
            />
          </Provider>
        </IonRouterOutlet>
      </IonReactRouter>
    );

    expect(
      getByText(EN_TRANSLATIONS.setpasscode.reenterpasscode)
    ).toBeInTheDocument();

    await passcodeFiller(getByText, getByTestId, "1", 6);

    await waitFor(() =>
      expect(
        getByText(EN_TRANSLATIONS.createpasscodemodule.cantremember)
      ).toBeInTheDocument()
    );

    await passcodeFiller(getByText, getByTestId, "1", 6);

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.biometry.setupandroidbiometryheader)
      ).toBeInTheDocument()
    );

    fireEvent.click(
      getByTestId("alert-setup-android-biometry-confirm-button")
    );

    await waitFor(() => {
      expect(Agent.agent.basicStorage.createOrUpdateBasicRecord).toBeCalledWith(
        expect.objectContaining({
          id: MiscRecordId.APP_BIOMETRY,
          content: {
            enabled: true,
          },
        })
      );
    });

    await waitFor(() => {
      expect(setMock).toBeCalledWith(
        KeyStoreKeys.APP_PASSCODE,
        "111111"
      );
    });
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
            <CreatePasscodeModule
              title={EN_TRANSLATIONS.setpasscode.reenterpasscode}
              description={EN_TRANSLATIONS.setpasscode.description}
              testId="set-passcode"
              onCreateSuccess={jest.fn()}
            />
          </Provider>
        </IonRouterOutlet>
      </IonReactRouter>
    );

    passcodeFiller(getByText, getByTestId, "1", 6);

    expect(
      getByText(EN_TRANSLATIONS.setpasscode.reenterpasscode)
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(
        getByText(EN_TRANSLATIONS.createpasscodemodule.cantremember)
      ).toBeInTheDocument()
    );

    passcodeFiller(getByText, getByTestId, "1", 6);

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

    const { getByText, getByTestId } = render(
      <IonReactRouter>
        <IonRouterOutlet animated={false}>
          <Provider store={store}>
            <CreatePasscodeModule
              title={EN_TRANSLATIONS.setpasscode.reenterpasscode}
              description={EN_TRANSLATIONS.setpasscode.description}
              testId="set-passcode"
              onCreateSuccess={jest.fn()}
            />
          </Provider>
        </IonRouterOutlet>
      </IonReactRouter>
    );

    passcodeFiller(getByText, getByTestId, "1", 6);

    expect(
      getByText(EN_TRANSLATIONS.setpasscode.reenterpasscode)
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(
        getByText(EN_TRANSLATIONS.createpasscodemodule.cantremember)
      ).toBeInTheDocument()
    );

    passcodeFiller(getByText, getByTestId, "1", 6);

    await waitFor(() => {
      expect(Agent.agent.basicStorage.createOrUpdateBasicRecord).toBeCalledWith(
        expect.objectContaining({
          id: MiscRecordId.APP_BIOMETRY,
          content: {
            enabled: true,
          },
        })
      );
    });

    await waitFor(() =>
      expect(setMock).toBeCalledWith(KeyStoreKeys.APP_PASSCODE, "111111")
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

    const { getByText, queryByText, getByTestId } = render(
      <IonReactRouter>
        <IonRouterOutlet animated={false}>
          <Provider store={store}>
            <CreatePasscodeModule
              title={EN_TRANSLATIONS.setpasscode.reenterpasscode}
              description={EN_TRANSLATIONS.setpasscode.description}
              testId="set-passcode"
              onCreateSuccess={jest.fn()}
            />
          </Provider>
        </IonRouterOutlet>
      </IonReactRouter>
    );

    passcodeFiller(getByText, getByTestId, "1", 6);

    expect(
      getByText(EN_TRANSLATIONS.setpasscode.reenterpasscode)
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(
        getByText(EN_TRANSLATIONS.createpasscodemodule.cantremember)
      ).toBeInTheDocument()
    );

    passcodeFiller(getByText, getByTestId, "1", 6);

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.biometry.setupandroidbiometrycancel)
      ).toBeInTheDocument()
    );
  });
});
