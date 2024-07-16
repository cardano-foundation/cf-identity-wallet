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
import { waitForIonicReact } from "@ionic/react-test-utils";
import EN_TRANSLATIONS from "../../../../../../../locales/en/en.json";
import { RoutePath } from "../../../../../../../routes";
import { store } from "../../../../../../../store";
// import { GenerateSeedPhrase } from "../GenerateSeedPhrase";
// import { SetPasscode } from "./SetPasscode";
import { KeyStoreKeys, SecureStorage } from "../../../../../../../core/storage";
import { ChangePin } from "./ChangePin";

const setKeyStoreSpy = jest.spyOn(SecureStorage, "set").mockResolvedValue();
const mockSetIsOpen = jest.fn();

jest.mock("../../../../../../../core/agent/agent", () => ({
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

jest.mock("../../../../../../hooks/useBiometricsHook", () => ({
  useBiometricAuth: jest.fn(() => ({
    biometricsIsEnabled: false,
    biometricInfo: {
      isAvailable: false,
      hasCredentials: false,
      biometryType: BiometryType.fingerprintAuthentication,
      strongBiometryIsAvailable: true,
    },
    handleBiometricAuth: jest.fn(() => Promise.resolve(false)),
    setBiometricsIsEnabled: jest.fn(),
  })),
}));

describe("ChangePin Modal", () => {
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

  test("Renders ChangePin Modal and initial UI components", async () => {
    require("@ionic/react");
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <ChangePin
          isOpen={true}
          setIsOpen={mockSetIsOpen}
        />
      </Provider>
    );
    await waitForIonicReact();

    expect(getByTestId("change-pin-modal")).toBeInTheDocument();
    expect(getByTestId("close-button")).toBeInTheDocument();
    expect(
      getByText(
        EN_TRANSLATIONS.settings.sections.security.changepin.createpasscode
      )
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.security.changepin.cancel)
    ).toBeInTheDocument();
    expect(
      getByText(
        EN_TRANSLATIONS.settings.sections.security.changepin.description
      )
    ).toBeInTheDocument();
    expect(getByTestId("passcode-module-container")).toBeInTheDocument();
    expect(getByTestId("forgot-your-passcode-placeholder")).toBeInTheDocument();
  });

  test.skip("Renders Re-enter Passcode when first time passcode is set", async () => {
    require("@ionic/react");
    const { getByText, queryByText } = render(
      <Provider store={store}>
        <ChangePin
          isOpen={true}
          setIsOpen={mockSetIsOpen}
        />
      </Provider>
    );
    await waitForIonicReact();

    clickButtonRepeatedly(getByText, "1", 6);

    await waitFor(() =>
      expect(
        queryByText(
          EN_TRANSLATIONS.settings.sections.security.changepin.reenterpasscode
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.settings.sections.security.changepin.back)
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.createpasscodemodule.cantremember)
      ).toBeInTheDocument()
    );
  });

  test.skip("Back to enter passcode screen from re-enter passcode screen", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <ChangePin
          isOpen={true}
          setIsOpen={mockSetIsOpen}
        />
      </Provider>
    );
    await waitForIonicReact();

    clickButtonRepeatedly(getByText, "1", 6);

    expect(
      EN_TRANSLATIONS.settings.sections.security.changepin.reenterpasscode
    ).toBeInTheDocument();

    fireEvent.click(getByTestId("close-button"));

    expect(
      EN_TRANSLATIONS.settings.sections.security.changepin.createpasscode
    ).toBeInTheDocument();
  });

  test.skip("Set passcode and close modal when second passcode is entered correctly", async () => {
    require("@ionic/react");
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <ChangePin
          isOpen={true}
          setIsOpen={mockSetIsOpen}
        />
      </Provider>
    );
    await waitForIonicReact();

    expect(getByTestId("change-pin-modal")).toHaveAttribute("isOpen", "true");

    clickButtonRepeatedly(getByText, "1", 6);

    expect(
      EN_TRANSLATIONS.settings.sections.security.changepin.reenterpasscode
    ).toBeInTheDocument();

    clickButtonRepeatedly(getByText, "1", 6);

    await waitFor(() =>
      expect(setKeyStoreSpy).toBeCalledWith(KeyStoreKeys.APP_PASSCODE, "111111")
    );

    await waitFor(() =>
      expect(getByTestId("change-pin-modal")).toHaveAttribute("isOpen", "false")
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
