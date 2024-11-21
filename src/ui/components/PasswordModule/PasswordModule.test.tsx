import { IonButton, IonIcon, IonInput, IonLabel } from "@ionic/react";
import { ionFireEvent } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { KeyStoreKeys } from "../../../core/storage";
import TRANSLATIONS from "../../../locales/en/en.json";
import { RoutePath } from "../../../routes";
import { OperationType } from "../../globals/types";
import { StoreMockedProps } from "../../pages/LockPage/LockPage.test";
import { CustomInputProps } from "../CustomInput/CustomInput.types";
import { PasswordModule } from "./PasswordModule";

const initialState = {
  stateCache: {
    routes: [RoutePath.TABS_MENU],
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

const createOrUpdateBasicRecordMock = jest.fn((agr: unknown) =>
  Promise.resolve(agr)
);
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
          {
            props.labelAction
          }
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

describe("Password Module", () => {
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
      ionFireEvent.ionInput(input, "pass");
      ionFireEvent.ionBlur(input);
    });

    await waitFor(() => {
      expect(getByText(TRANSLATIONS.createpassword.error.passwordlength)).toBeVisible()
      expect(getByText(TRANSLATIONS.createpassword.meter.strengthlevel.weak)).toBeVisible()
    })

    act(() => {
      ionFireEvent.ionInput(input, "passsssssss1@");
      ionFireEvent.ionBlur(input);
    });

    await waitFor(() => {
      expect(getByText(TRANSLATIONS.createpassword.error.hasNoUppercase)).toBeVisible();
      expect(getByText(TRANSLATIONS.createpassword.meter.strengthlevel.medium)).toBeVisible();
    })

    act(() => {
      ionFireEvent.ionInput(input, "PASSSSSSSSS1@");
      ionFireEvent.ionBlur(input);
    });

    await waitFor(() => {
      expect(getByText(TRANSLATIONS.createpassword.error.hasNoLowercase)).toBeVisible();
    })

    act(() => {
      ionFireEvent.ionInput(input, "Passssssssssssss@");
      ionFireEvent.ionBlur(input);
    });

    await waitFor(() => {
      expect(getByText(TRANSLATIONS.createpassword.error.hasNoNumber)).toBeVisible();
    })

    act(() => {
      ionFireEvent.ionInput(input, "Passssssssssssss1");
      ionFireEvent.ionBlur(input);
    });

    await waitFor(() => {
      expect(getByText(TRANSLATIONS.createpassword.error.hasNoSymbol)).toBeVisible();
    })

    act(() => {
      ionFireEvent.ionInput(input, "Passssssssssssss@1∞");
      ionFireEvent.ionBlur(input);
    });

    await waitFor(() => {
      expect(getByText(TRANSLATIONS.createpassword.error.hasSpecialChar)).toBeVisible();
      expect(getByText(TRANSLATIONS.createpassword.meter.strengthlevel.strong)).toBeVisible();
    })
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
      expect(getByText(TRANSLATIONS.createpassword.error.hasNoMatch)).toBeVisible();
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
      expect(getByText(TRANSLATIONS.createpassword.error.hintSameAsPassword)).toBeVisible();
    });
  });

  test("Skip password", async () => {
    const { getByTestId, getByText, findByText, unmount, queryByText } = render(
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

    fireEvent.click(getByTestId("tertiary-button-password-module"));

    const alertTitle = await findByText(TRANSLATIONS.createpassword.alert.text);

    await waitFor(() => {
      expect(alertTitle).toBeVisible();
    });
    
    const mockDate = new Date(1466424490000);
    const spy = jest
      .spyOn(global, "Date")
      .mockImplementation((() => mockDate) as never);

    act(() => {
      fireEvent.click(
        getByText(TRANSLATIONS.createpassword.alert.button.confirm)
      );
    });

    await waitFor(() => {
      expect(queryByText(TRANSLATIONS.createpassword.alert.text)).toBeNull();
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
    unmount();
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
        routes: [RoutePath.TABS_MENU],
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

    const { getByTestId, queryByText, unmount, findByText } = render(
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

    expect(queryByText(TRANSLATIONS.createpassword.button.skip)).toBe(null);

    const input = getByTestId("create-password-input");
    const confirmInput = getByTestId("confirm-password-input");
    const hintInput = getByTestId("create-hint-input");

    act(() => {
      ionFireEvent.ionInput(input, "Passssssss1@");
      ionFireEvent.ionInput(confirmInput, "Passssssss1@");
      ionFireEvent.ionInput(hintInput, "hint");
    });

    fireEvent.click(getByTestId("primary-button-password-module"));

    const alertTitle = await findByText(TRANSLATIONS.tabs.menu.tab.settings.sections.security.managepassword
      .page.alert.existingpassword)

    await waitFor(() => {
      expect(alertTitle).toBeVisible();
    });

    fireEvent.click(
      getByTestId("manage-password-alert-existing-confirm-button")
    );

    await waitFor(() => {
      expect(queryByText(TRANSLATIONS.tabs.menu.tab.settings.sections.security.managepassword.page.alert.existingpassword)).toBeNull()
    })

    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe("");
      expect((confirmInput as HTMLInputElement).value).toBe("");
      expect((hintInput as HTMLInputElement).value).toBe("");
    });

    unmount();
  });

  test("Open symbol modal", async () => {
    const initialState = {
      stateCache: {
        routes: [RoutePath.TABS_MENU],
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

    const { getByTestId, getByText, queryByText } = render(
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
    
    act(() => {
      ionFireEvent.click(
        getByTestId("open-symbol-modal")
      );
    });

    await waitFor(() => {
      expect(getByTestId("symbol-modal")).toBeVisible();
      expect(getByText(TRANSLATIONS.createpassword.symbolmodal.done)).toBeVisible();
    });
  });
});
