import { BiometryType } from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import {
  RenderResult,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { act } from "react-dom/test-utils";
import EN_TRANSLATIONS from "../../../../../../../locales/en/en.json";
import { store } from "../../../../../../../store";
import { KeyStoreKeys, SecureStorage } from "../../../../../../../core/storage";
import { ChangePin } from "./ChangePin";
import { passcodeFiller } from "../../../../../../utils/passcodeFiller";

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

const useBiometricAuthMock = jest.fn();

jest.mock("../../../../../../hooks/useBiometricsHook", () => ({
  useBiometricAuth: () => useBiometricAuthMock(),
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: any }) => children,
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
    useBiometricAuthMock.mockImplementation(() => ({
      biometricsIsEnabled: false,
      biometricInfo: {
        isAvailable: true,
        hasCredentials: false,
        biometryType: BiometryType.fingerprintAuthentication,
        strongBiometryIsAvailable: false,
      },
      handleBiometricAuth: jest.fn(() => Promise.resolve(true)),
      setBiometricsIsEnabled: jest.fn(),
    }));
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

  test("Renders Re-enter Passcode when first time passcode is set", async () => {
    require("@ionic/react");
    const { getByText, queryByText, getByTestId } = render(
      <Provider store={store}>
        <ChangePin
          isOpen={true}
          setIsOpen={mockSetIsOpen}
        />
      </Provider>
    );
    await waitForIonicReact();

    passcodeFiller(getByText, getByTestId, "1", 6);

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

  test("Set passcode and close modal when second passcode is entered correctly", async () => {
    require("@ionic/react");

    useBiometricAuthMock.mockImplementation(() => ({
      biometricsIsEnabled: false,
      biometricInfo: {
        isAvailable: true,
        hasCredentials: false,
        biometryType: BiometryType.fingerprintAuthentication,
        strongBiometryIsAvailable: false,
      },
      handleBiometricAuth: jest.fn(() => Promise.resolve(true)),
      setBiometricsIsEnabled: jest.fn(),
    }));

    const { getByText, queryByText, getByTestId } = render(
      <Provider store={store}>
        <ChangePin
          isOpen={true}
          setIsOpen={mockSetIsOpen}
        />
      </Provider>
    );
    await waitForIonicReact();

    passcodeFiller(getByText, getByTestId, "1", 6);

    await waitFor(() =>
      expect(
        queryByText(
          EN_TRANSLATIONS.settings.sections.security.changepin.reenterpasscode
        )
      ).toBeInTheDocument()
    );

    passcodeFiller(getByText, getByTestId, "1", 6);

    await waitFor(() =>
      expect(setKeyStoreSpy).toBeCalledWith(KeyStoreKeys.APP_PASSCODE, "111111")
    );
  });

  test("Cancel change pin", async () => {
    const { getByText } = render(
      <Provider store={store}>
        <ChangePin
          isOpen={true}
          setIsOpen={mockSetIsOpen}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.settings.sections.security.changepin.cancel)
      );
    });

    await waitFor(() => {
      expect(mockSetIsOpen).toBeCalledWith(false);
    });
  });
});
