import { BiometryType } from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { setSeedPhraseCache } from "../../../store/reducers/seedPhraseCache";
import { ForgotAuthInfo } from "./ForgotAuthInfo";
import { ForgotType } from "./ForgotAuthInfo.types";
import { KeyStoreKeys } from "../../../core/storage";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";

const SEED_PHRASE_LENGTH = 18;

const secureStorageGetFunc = jest.fn();
const secureStorageSetFunc = jest.fn();
const secureStorageDeleteFunc = jest.fn();
const verifySeedPhraseFnc = jest.fn();

const createOrUpdateBasicStore = jest.fn((arg: any) => Promise.resolve());
jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      isMnemonicValid: () => verifySeedPhraseFnc(),
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        createOrUpdateBasicRecord: (arg: any) => createOrUpdateBasicStore(arg),
      },
    },
  },
}));

jest.mock("../../../core/storage", () => ({
  ...jest.requireActual("../../../core/storage"),
  SecureStorage: {
    get: (...args: any) => secureStorageGetFunc(...args),
    set: (...args: any) => secureStorageSetFunc(...args),
    delete: (...args: any) => secureStorageDeleteFunc(...args),
  },
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonInput: (props: any) => {
    return (
      <input
        {...props}
        data-testid={props["data-testid"]}
        onBlur={(e) => props.onIonBlur(e)}
        onFocus={(e) => props.onIonFocus(e)}
        onChange={(e) => props.onIonInput?.(e)}
      />
    );
  },
  IonModal: ({ children }: { children: any }) => children,
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

describe("Forgot Passcode Page", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const initialState = {
    stateCache: {
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        recoveryWalletProgress: true,
      },
    },
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("Render", async () => {
    verifySeedPhraseFnc.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const onCloseMock = jest.fn();

    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <ForgotAuthInfo
          isOpen
          onClose={onCloseMock}
          type={ForgotType.Passcode}
        />
      </Provider>
    );

    await waitForIonicReact();

    expect(getByText(EN_TRANSLATIONS.forgotauth.passcode.title)).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.forgotauth.passcode.description)
    ).toBeVisible();

    for (let i = 0; i < SEED_PHRASE_LENGTH; i++) {
      act(() => {
        const input = getByTestId(`word-input-${i}`);
        fireEvent.focus(input);
        fireEvent.change(input, {
          target: { value: "a" },
        });
      });

      await waitFor(() => {
        expect(getByText("abandon")).toBeVisible();
      });

      act(() => {
        fireEvent.click(getByText("abandon"));
      });

      if (i < SEED_PHRASE_LENGTH - 1) {
        await waitFor(() => {
          expect(getByTestId(`word-input-${i}`)).toBeVisible();
        });
      }
    }

    expect(
      getByText(
        EN_TRANSLATIONS.verifyrecoveryseedphrase.button.continue
      ).getAttribute("disabled")
    ).toBe("false");

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.verifyrecoveryseedphrase.button.continue)
      );
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setSeedPhraseCache({
          seedPhrase:
            "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon",
          bran: "",
        })
      );
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.forgotauth.newpasscode.title)
      ).toBeVisible();
      expect(
        getByText(EN_TRANSLATIONS.forgotauth.newpasscode.description)
      ).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-0")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-1")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-2")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-3")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-4")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-5")).toBeVisible();
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.forgotauth.newpasscode.reenterpasscode)
      ).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-0")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-1")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-2")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-3")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-4")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-5")).toBeVisible();
    });

    await waitFor(() => {
      expect(onCloseMock).toBeCalled();
    });
  });
});

describe("Forgot Password Page", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const initialState = {
    stateCache: {
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        recoveryWalletProgress: true,
      },
    },
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("Render", async () => {
    verifySeedPhraseFnc.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const onCloseMock = jest.fn();

    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <ForgotAuthInfo
          isOpen
          onClose={onCloseMock}
          type={ForgotType.Password}
        />
      </Provider>
    );

    await waitForIonicReact();

    expect(getByText(EN_TRANSLATIONS.forgotauth.password.title)).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.forgotauth.password.description)
    ).toBeVisible();

    for (let i = 0; i < SEED_PHRASE_LENGTH; i++) {
      act(() => {
        const input = getByTestId(`word-input-${i}`);
        fireEvent.focus(input);
        fireEvent.change(input, {
          target: { value: "a" },
        });
      });

      await waitFor(() => {
        expect(getByText("abandon")).toBeVisible();
      });

      act(() => {
        fireEvent.click(getByText("abandon"));
      });

      if (i < SEED_PHRASE_LENGTH - 1) {
        await waitFor(() => {
          expect(getByTestId(`word-input-${i}`)).toBeVisible();
        });
      }
    }

    expect(
      getByText(
        EN_TRANSLATIONS.verifyrecoveryseedphrase.button.continue
      ).getAttribute("disabled")
    ).toBe("false");

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.verifyrecoveryseedphrase.button.continue)
      );
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setSeedPhraseCache({
          seedPhrase:
            "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon",
          bran: "",
        })
      );
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.forgotauth.newpassword.title)
      ).toBeVisible();
      expect(
        getByText(EN_TRANSLATIONS.forgotauth.newpassword.description)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("tertiary-button-forgot-auth-info-modal"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.createpassword.alert.text)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.createpassword.alert.button.confirm)
      );
    });

    await waitFor(() => {
      expect(createOrUpdateBasicStore).toBeCalled();
      expect(onCloseMock).toBeCalled();
    });
  });
});
