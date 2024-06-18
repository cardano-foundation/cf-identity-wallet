import { BiometryErrorType } from "@aparajita/capacitor-biometric-auth";
import {
  BiometryError,
  BiometryType,
} from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  RenderResult,
  act,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { RoutePath } from "../../../routes";
import { store } from "../../../store";
import { GenerateSeedPhrase } from "../../pages/GenerateSeedPhrase";
import { CreatePasscodeModule } from "./CreatePasscodeModule";

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

  test("Renders Create Passcode page with title and description", () => {
    require("@ionic/react");
    const { getByText } = render(
      <Provider store={store}>
        <CreatePasscodeModule
          title={EN_TRANSLATIONS.setpasscode.enterpasscode.title}
          description={EN_TRANSLATIONS.setpasscode.enterpasscode.description}
          testId="set-passcode"
          onCreateSuccess={jest.fn()}
        />
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
        <CreatePasscodeModule
          title={EN_TRANSLATIONS.setpasscode.enterpasscode.title}
          description={EN_TRANSLATIONS.setpasscode.enterpasscode.description}
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

  test("Entering a wrong passcode at the passcode confirmation returns an error", () => {
    require("@ionic/react");
    const { getByText } = render(
      <Provider store={store}>
        <CreatePasscodeModule
          title={EN_TRANSLATIONS.setpasscode.reenterpasscode.title}
          description={EN_TRANSLATIONS.setpasscode.enterpasscode.description}
          testId="set-passcode"
          onCreateSuccess={jest.fn()}
        />
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
            <CreatePasscodeModule
              title={EN_TRANSLATIONS.setpasscode.reenterpasscode.title}
              description={
                EN_TRANSLATIONS.setpasscode.enterpasscode.description
              }
              testId="set-passcode"
              onCreateSuccess={jest.fn()}
            />
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
      expect(Agent.agent.basicStorage.createOrUpdateBasicRecord).toBeCalledWith(
        expect.objectContaining({
          id: MiscRecordId.APP_BIOMETRY,
          content: {
            enabled: true,
          },
        })
      );
    });

    expect(setKeyStoreSpy).toBeCalledWith(KeyStoreKeys.APP_PASSCODE, "111111");
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
              title={EN_TRANSLATIONS.setpasscode.reenterpasscode.title}
              description={
                EN_TRANSLATIONS.setpasscode.enterpasscode.description
              }
              testId="set-passcode"
              onCreateSuccess={jest.fn()}
            />
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
            <CreatePasscodeModule
              title={EN_TRANSLATIONS.setpasscode.reenterpasscode.title}
              description={
                EN_TRANSLATIONS.setpasscode.enterpasscode.description
              }
              testId="set-passcode"
              onCreateSuccess={jest.fn()}
            />
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
      expect(setKeyStoreSpy).toBeCalledWith(KeyStoreKeys.APP_PASSCODE, "111111")
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
            <CreatePasscodeModule
              title={EN_TRANSLATIONS.setpasscode.reenterpasscode.title}
              description={
                EN_TRANSLATIONS.setpasscode.enterpasscode.description
              }
              testId="set-passcode"
              onCreateSuccess={jest.fn()}
            />
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
