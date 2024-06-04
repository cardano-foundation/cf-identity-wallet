import { act, fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { ionFireEvent, waitForIonicReact } from "@ionic/react-test-utils";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { IonInput } from "@ionic/react";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { credsFixAcdc } from "../../__fixtures__/credsFix";
import { CredentialDetails } from "../../pages/CredentialDetails";
import { Agent } from "../../../core/agent/agent";
import { VerifyPassword } from "./VerifyPassword";
import { CustomInputProps } from "../CustomInput/CustomInput.types";
import { SecureStorage } from "../../../core/storage";

const path = TabsRoutePath.CREDENTIALS + "/" + credsFixAcdc[0].id;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: credsFixAcdc[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
}));

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      credentials: {
        getCredentialDetailsById: jest.fn(),
      },
      basicStorage: {
        findById: jest.fn(),
      },
    },
  },
}));

jest.mock("../../../core/storage", () => ({
  ...jest.requireActual("../../../core/storage"),
  SecureStorage: {
    get: () => jest.fn(),
  },
}));

const initialStateNoPassword = {
  stateCache: {
    routes: [TabsRoutePath.CREDENTIALS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
      passwordIsSet: false,
      passwordIsSkipped: true,
    },
  },
  seedPhraseCache: {
    seedPhrase:
      "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
    bran: "bran",
  },
  credsCache: { creds: credsFixAcdc },
  credsArchived: { creds: credsFixAcdc },
};

const initialStateWithPassword = {
  stateCache: {
    routes: [TabsRoutePath.CREDENTIALS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
      passwordIsSet: true,
      passwordIsSkipped: false,
    },
  },
  seedPhraseCache: {
    seedPhrase:
      "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
    bran: "bran",
  },
  credsCache: { creds: credsFixAcdc },
  credsArchived: { creds: credsFixAcdc },
};

describe("Verify Password on Cards Details page", () => {
  let storeMocked: Store<unknown, AnyAction>;
  beforeEach(() => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateNoPassword),
      dispatch: dispatchMock,
    };
  });

  test.skip("It renders verify password when clicking on the big archive button", async () => {
    jest
      .spyOn(Agent.agent.credentials, "getCredentialDetailsById")
      .mockResolvedValue(credsFixAcdc[0]);
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateWithPassword),
      dispatch: dispatchMock,
    };
    const { findByTestId, getAllByText, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredentialDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    const archiveButton = await findByTestId(
      "archive-button-credential-card-details"
    );

    act(() => {
      fireEvent.click(archiveButton);
    });

    await waitFor(() => {
      expect(
        getAllByText(EN_TRANSLATIONS.credentials.details.alert.archive.title)[1]
      ).toBeVisible();
    });

    await waitFor(() => {
      expect(getAllByTestId("verify-password")[1]).toHaveAttribute(
        "is-open",
        "false"
      );
    });

    act(() => {
      fireEvent.click(
        getAllByText(
          EN_TRANSLATIONS.credentials.details.alert.archive.confirm
        )[0]
      );
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(getAllByTestId("verify-password")[1]).toHaveAttribute(
        "is-open",
        "true"
      );
    });
  });

  test.skip("It asks to verify the password when users try to archive the cred using the button in the modal", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateWithPassword),
      dispatch: dispatchMock,
    };
    const { getByTestId, getAllByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredentialDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(getAllByTestId("verify-password")[1].getAttribute("is-open")).toBe(
      "false"
    );

    act(() => {
      fireEvent.click(getByTestId("options-button"));
    });

    await waitFor(() => {
      expect(getByTestId("creds-options-archive-button")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId("creds-options-archive-button"));
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(getAllByTestId("verify-password")[1]).toHaveAttribute(
        "is-open",
        "true"
      );
    });
  });
});

jest.mock("../CustomInput", () => ({
  CustomInput: (props: CustomInputProps) => {
    return (
      <IonInput
        data-testid={props.dataTestId}
        onIonInput={(e) => {
          props.onChangeInput(e.detail.value as string);
        }}
      />
    );
  },
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: any }) => children,
}));

describe("Verify Password", () => {
  let storeMocked: Store<unknown, AnyAction>;
  beforeEach(() => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateNoPassword),
      dispatch: dispatchMock,
    };
  });

  test("Verify failed", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateWithPassword),
      dispatch: dispatchMock,
    };

    const setIsOpenMock = jest.fn();
    const onVerifyMock = jest.fn();

    const { findByTestId, getByTestId } = render(
      <Provider store={storeMocked}>
        <VerifyPassword
          isOpen={true}
          setIsOpen={setIsOpenMock}
          onVerify={onVerifyMock}
        />
      </Provider>
    );

    await waitForIonicReact();

    const passwordInput = await findByTestId("verify-password-value");

    const confirmButton = await findByTestId("action-button");

    act(() => {
      ionFireEvent.ionInput(passwordInput, "1111");
    });

    await waitFor(() => {
      expect(confirmButton.getAttribute("disabled")).toBe("false");
    });

    act(() => {
      ionFireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(getByTestId("error-message")).toBeVisible();
    });
  });

  test("Verify success", async () => {
    jest.spyOn(SecureStorage, "get").mockResolvedValue("1111");

    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateWithPassword),
      dispatch: dispatchMock,
    };

    const setIsOpenMock = jest.fn();
    const onVerifyMock = jest.fn();

    const { findByTestId } = render(
      <Provider store={storeMocked}>
        <VerifyPassword
          isOpen={true}
          setIsOpen={setIsOpenMock}
          onVerify={onVerifyMock}
        />
      </Provider>
    );

    await waitForIonicReact();

    const passwordInput = await findByTestId("verify-password-value");

    const confirmButton = await findByTestId("action-button");

    act(() => {
      ionFireEvent.ionInput(passwordInput, "1111");
    });

    await waitFor(() => {
      expect(confirmButton.getAttribute("disabled")).toBe("false");
    });

    act(() => {
      ionFireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(onVerifyMock).toBeCalledTimes(1);
    });
  });

  test("Render hint button success", async () => {
    jest.spyOn(Agent.agent.basicStorage, "findById").mockResolvedValue(
      Promise.resolve({
        content: {
          value: "1111",
        },
      } as any)
    );

    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateWithPassword),
      dispatch: dispatchMock,
    };

    const setIsOpenMock = jest.fn();
    const onVerifyMock = jest.fn();

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <VerifyPassword
          isOpen={true}
          setIsOpen={setIsOpenMock}
          onVerify={onVerifyMock}
        />
      </Provider>
    );

    await waitForIonicReact();

    const forgorBtn = getByTestId("forgot-hint-btn");

    await waitFor(() => {
      expect(forgorBtn).toBeVisible();
    });
  });
});
