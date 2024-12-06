import { BiometryType } from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { setSeedPhraseCache } from "../../../store/reducers/seedPhraseCache";
import { passcodeFiller } from "../../utils/passcodeFiller";
import { ForgotAuthInfo } from "./ForgotAuthInfo";
import { ForgotType } from "./ForgotAuthInfo.types";

const SEED_PHRASE_LENGTH = 18;

const secureStorageGetFunc = jest.fn();
const secureStorageSetFunc = jest.fn();
const secureStorageDeleteFunc = jest.fn();
const verifySeedPhraseFnc = jest.fn();

const createOrUpdateBasicStore = jest.fn((arg: unknown) => Promise.resolve(arg));
jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      isMnemonicValid: () => verifySeedPhraseFnc(),
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        createOrUpdateBasicRecord: (arg: unknown) => createOrUpdateBasicStore(arg),
      },
    },
  },
}));

jest.mock("../../../core/storage", () => ({
  ...jest.requireActual("../../../core/storage"),
  SecureStorage: {
    get: (...args: unknown[]) => secureStorageGetFunc(...args),
    set: (...args: unknown[]) => secureStorageSetFunc(...args),
    delete: (...args: unknown[]) => secureStorageDeleteFunc(...args),
  },
}));

jest.mock("@ionic/react", () => {
  const { forwardRef, useImperativeHandle } = jest.requireActual("react");

  return ({
    ...jest.requireActual("@ionic/react"),
    IonInput: forwardRef((props: any, ref: any) => {
      const {onIonBlur, onIonFocus, onIonInput, value} = props;
      const testId = props["data-testid"];
  
  
      useImperativeHandle(ref, () => ({
        setFocus: jest.fn()
      }));
  
      return (
        <input
          ref={ref}
          value={value}
          data-testid={testId}
          onBlur={onIonBlur}
          onFocus={onIonFocus}
          onChange={onIonInput}
        />
      );
    }),
    IonModal: ({ children }: { children: any }) => children,
  });
});

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

    const { getByTestId, getByText, findByText } = render(
      <Provider store={storeMocked}>
        <ForgotAuthInfo
          isOpen
          onClose={onCloseMock}
          type={ForgotType.Passcode}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.forgotauth.passcode.title)).toBeVisible();
    });

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

    await passcodeFiller(getByText, getByTestId, "1", 6);

    await waitFor(() => {
      expect(getByTestId("secondary-button-forgot-auth-info-modal")).toBeVisible();
    })

    const text = await findByText(EN_TRANSLATIONS.forgotauth.newpasscode.reenterpasscode);

    await waitFor(() => {
      expect(text).toBeVisible();
    });

    await passcodeFiller(getByText, getByTestId, "1", 6);

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

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.forgotauth.password.title)).toBeVisible();
    })

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
