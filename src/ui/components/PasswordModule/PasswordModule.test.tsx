import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { IonButton, IonIcon, IonInput, IonLabel } from "@ionic/react";
import { ionFireEvent } from "@ionic/react-test-utils";
import { StoreMockedProps } from "../../pages/LockPage/LockPage.test";
import { RoutePath } from "../../../routes";
import { OperationType } from "../../globals/types";
import { PasswordModule } from "./PasswordModule";
import { CustomInputProps } from "../CustomInput/CustomInput.types";
import ENG_trans from "../../../locales/en/en.json";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { KeyStoreKeys } from "../../../core/storage";

const initialState = {
  stateCache: {
    routes: [RoutePath.GENERATE_SEED_PHRASE],
    authentication: {
      loggedIn: false,
      time: Date.now(),
      passcodeIsSet: true,
      seedPhraseIsSet: false,
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
    enabled: false,
  },
};

const createOrUpdateBasicRecordMock = jest.fn();
jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
        createOrUpdateBasicRecord: (arg: unknown) =>
          createOrUpdateBasicRecordMock(arg),
      },
    },
  },
}));

const secureStorageGetFunc = jest.fn((...arg: unknown[]) =>
  Promise.resolve("Passssssss1@")
);
const secureStorageSetFunc = jest.fn();
const secureStorageDeleteFunc = jest.fn();

jest.mock("../../../core/storage", () => ({
  ...jest.requireActual("../../../core/storage"),
  SecureStorage: {
    get: (...args: unknown[]) => secureStorageGetFunc(...args),
    set: (...args: unknown[]) => secureStorageSetFunc(...args),
    delete: (...args: unknown[]) => secureStorageDeleteFunc(...args),
  },
}));

jest.mock("../../components/CustomInput", () => ({
  CustomInput: (props: CustomInputProps) => {
    return (
      <>
        <IonLabel
          position="stacked"
          data-testid={`${props.title?.toLowerCase().replace(" ", "-")}-title`}
        >
          {props.title}
          {props.optional && (
            <span className="custom-input-optional">(optional)</span>
          )}
        </IonLabel>
        <IonInput
          data-testid={props.dataTestId}
          onIonInput={(e) => {
            props.onChangeInput(e.detail.value as string);
          }}
          onIonFocus={() => props.onChangeFocus?.(true)}
          onIonBlur={() => props.onChangeFocus?.(false)}
        />
        {props.action && props.actionIcon && (
          <IonButton
            shape="round"
            data-testid={`${props.dataTestId}-action`}
            onClick={(e) => {
              props.action?.(e);
            }}
          >
            <IonIcon
              slot="icon-only"
              icon={props.actionIcon}
              color="primary"
            />
          </IonButton>
        )}
      </>
    );
  },
}));
const mockStore = configureStore();
const dispatchMock = jest.fn();
const storeMocked = (initialState: StoreMockedProps) => {
  return {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };
};

describe("Passcode Module", () => {
  const onCreateSuccesMock = jest.fn();
  test("Render", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked(initialState)}>
        <PasswordModule
          title="Password Module"
          description="Description"
          testId="password-module"
          isOnboarding={true}
          onCreateSuccess={onCreateSuccesMock}
        />
      </Provider>
    );

    expect(getByText("Password Module")).toBeVisible();
    expect(getByText("Description")).toBeVisible();

    expect(getByTestId("create-password-input")).toBeVisible();
    expect(getByTestId("confirm-password-input")).toBeVisible();
    expect(getByTestId("create-hint-input")).toBeVisible();

    expect(getByTestId("primary-button-password-module")).toBeVisible();
    expect(getByTestId("tertiary-button-password-module")).toBeVisible();
  });

  test("Validate password", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked(initialState)}>
        <PasswordModule
          title="Password Module"
          description="Description"
          testId="password-module"
          isOnboarding={true}
          onCreateSuccess={onCreateSuccesMock}
        />
      </Provider>
    );

    const input = getByTestId("create-password-input");

    act(() => {
      ionFireEvent.ionInput(input, "Pass1@");
    });

    await waitFor(() => {
      expect(getByText(ENG_trans.createpassword.error.isTooShort));
      expect(
        getByTestId("password-validation-length-icon").classList.contains(
          "fails"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-uppercase-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-lowercase-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-number-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-symbol-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
    });

    act(() => {
      ionFireEvent.ionInput(input, "passsssssss1@");
    });

    await waitFor(() => {
      expect(getByText(ENG_trans.createpassword.error.hasNoUppercase));
      expect(
        getByTestId("password-validation-length-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-uppercase-icon").classList.contains(
          "fails"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-lowercase-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-number-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-symbol-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
    });

    act(() => {
      ionFireEvent.ionInput(input, "PASSSSSSSSS1@");
    });

    await waitFor(() => {
      expect(getByText(ENG_trans.createpassword.error.hasNoLowercase));
      expect(
        getByTestId("password-validation-length-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-uppercase-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-lowercase-icon").classList.contains(
          "fails"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-number-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-symbol-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
    });

    act(() => {
      ionFireEvent.ionInput(input, "Passssssssssssss@");
    });

    await waitFor(() => {
      expect(getByText(ENG_trans.createpassword.error.hasNoNumber));
      expect(
        getByTestId("password-validation-length-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-uppercase-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-lowercase-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-number-icon").classList.contains(
          "fails"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-symbol-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
    });

    act(() => {
      ionFireEvent.ionInput(input, "Passssssssssssss1");
    });

    await waitFor(() => {
      expect(getByText(ENG_trans.createpassword.error.hasNoSymbol));
      expect(
        getByTestId("password-validation-length-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-uppercase-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-lowercase-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-number-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-symbol-icon").classList.contains(
          "fails"
        )
      ).toBe(true);
    });

    act(() => {
      ionFireEvent.ionInput(input, "Passssssssssssss@1");
    });

    await waitFor(() => {
      expect(
        getByTestId("password-validation-length-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-uppercase-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-lowercase-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-number-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-symbol-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
    });
  });

  test("Confirm password not match", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked(initialState)}>
        <PasswordModule
          title="Password Module"
          description="Description"
          testId="password-module"
          isOnboarding={true}
          onCreateSuccess={onCreateSuccesMock}
        />
      </Provider>
    );

    const input = getByTestId("create-password-input");
    const confirmInput = getByTestId("confirm-password-input");

    act(() => {
      ionFireEvent.ionInput(input, "Passssssssssss1@");
      ionFireEvent.ionInput(confirmInput, "Passssssssss1@");
    });

    await waitFor(() => {
      expect(getByText(ENG_trans.createpassword.error.hasNoMatch));
    });
  });

  test("Hint match with password", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked(initialState)}>
        <PasswordModule
          title="Password Module"
          description="Description"
          testId="password-module"
          isOnboarding={true}
          onCreateSuccess={onCreateSuccesMock}
        />
      </Provider>
    );

    const input = getByTestId("create-password-input");
    const confirmInput = getByTestId("confirm-password-input");
    const hintInput = getByTestId("create-hint-input");

    act(() => {
      ionFireEvent.ionInput(input, "Passssssssss1@");
      ionFireEvent.ionInput(confirmInput, "Passssssssss1@");
      ionFireEvent.ionInput(hintInput, "Passssssssss1@");
    });

    await waitFor(() => {
      expect(getByText(ENG_trans.createpassword.error.hintSameAsPassword));
    });
  });

  test("Skip password", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked(initialState)}>
        <PasswordModule
          title="Password Module"
          description="Description"
          testId="password-module"
          isOnboarding={true}
          onCreateSuccess={onCreateSuccesMock}
        />
      </Provider>
    );

    const skipButton = getByTestId("tertiary-button-password-module");

    act(() => {
      ionFireEvent.click(skipButton);
    });

    await waitFor(() => {
      expect(getByText(ENG_trans.createpassword.alert.text)).toBeVisible();
    });

    const mockDate = new Date(1466424490000);
    const spy = jest
      .spyOn(global, "Date")
      .mockImplementation((() => mockDate) as never);
    act(() => {
      fireEvent.click(getByText(ENG_trans.createpassword.alert.button.confirm));
    });

    await waitFor(() => {
      expect(createOrUpdateBasicRecordMock).toBeCalledWith(
        new BasicRecord({
          id: MiscRecordId.APP_PASSWORD_SKIPPED,
          content: { value: true },
        })
      );
    });

    spy.mockRestore();
  });

  test("Submit password", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked(initialState)}>
        <PasswordModule
          title="Password Module"
          description="Description"
          testId="password-module"
          isOnboarding={true}
          onCreateSuccess={onCreateSuccesMock}
        />
      </Provider>
    );

    const input = getByTestId("create-password-input");
    const confirmInput = getByTestId("confirm-password-input");
    const hintInput = getByTestId("create-hint-input");

    act(() => {
      ionFireEvent.ionInput(input, "Passssssssss1@");
      ionFireEvent.ionInput(confirmInput, "Passssssssss1@");
      ionFireEvent.ionInput(hintInput, "hint");
    });

    await waitFor(() => {
      expect(
        getByTestId("password-validation-length-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-uppercase-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-lowercase-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-number-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-symbol-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
    });

    const submitButton = getByTestId("primary-button-password-module");

    const mockDate = new Date(1466424490000);
    const spy = jest
      .spyOn(global, "Date")
      .mockImplementation((() => mockDate) as never);

    act(() => {
      ionFireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(secureStorageSetFunc).toBeCalledWith(
        KeyStoreKeys.APP_OP_PASSWORD,
        "Passssssssss1@"
      );
      expect(createOrUpdateBasicRecordMock).toBeCalledWith(
        new BasicRecord({
          id: MiscRecordId.OP_PASS_HINT,
          content: { value: "hint" },
        })
      );
    });

    spy.mockRestore();
  });

  test("Submit password on manage password page", async () => {
    const initialState = {
      stateCache: {
        routes: [RoutePath.GENERATE_SEED_PHRASE],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          seedPhraseIsSet: true,
          passwordIsSet: true,
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
        enabled: false,
      },
    };

    const { getByTestId, queryByText, getByText } = render(
      <Provider store={storeMocked(initialState)}>
        <PasswordModule
          title="Password Module"
          description="Description"
          testId="password-module"
          isOnboarding={false}
          onCreateSuccess={onCreateSuccesMock}
        />
      </Provider>
    );

    expect(queryByText(ENG_trans.createpassword.button.skip)).toBe(null);

    const input = getByTestId("create-password-input");
    const confirmInput = getByTestId("confirm-password-input");
    const hintInput = getByTestId("create-hint-input");

    act(() => {
      ionFireEvent.ionInput(input, "Passssssss1@");
      ionFireEvent.ionInput(confirmInput, "Passssssss1@");
      ionFireEvent.ionInput(hintInput, "hint");
    });

    await waitFor(() => {
      expect(
        getByTestId("password-validation-length-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-uppercase-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-lowercase-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-number-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
      expect(
        getByTestId("password-validation-symbol-icon").classList.contains(
          "pass"
        )
      ).toBe(true);
    });

    const submitButton = getByTestId("primary-button-password-module");

    act(() => {
      ionFireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(
        getByText(
          ENG_trans.settings.sections.security.managepassword.page.alert
            .existingpassword
        )
      ).toBeVisible();
    });
  });
});
