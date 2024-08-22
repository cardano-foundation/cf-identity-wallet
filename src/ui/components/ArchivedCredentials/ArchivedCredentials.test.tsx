import { fireEvent, render, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { TabsRoutePath } from "../../../routes/paths";
import { ArchivedCredentialsContainer } from "./ArchivedCredentials";
import { credsFixAcdc } from "../../__fixtures__/credsFix";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { passcodeFiller } from "../../utils/passcodeFiller";

const deleteCredentialsMock = jest.fn((id: string) => Promise.resolve(true));

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      credentials: {
        restoreCredential: jest.fn((id: string) => Promise.resolve(id)),
        deleteCredential: (id: string) => deleteCredentialsMock(id),
        getCredentials: jest.fn().mockResolvedValue([]),
      },
    },
  },
}));

jest.mock("../../../core/storage", () => ({
  ...jest.requireActual("../../../core/storage"),
  SecureStorage: {
    get: (key: string) => "111111",
  },
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen }: { children: any; isOpen: boolean }) =>
    isOpen ? children : null,
}));

const initialStateEmpty = {
  stateCache: {
    routes: [TabsRoutePath.CREDENTIALS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
  seedPhraseCache: {},
  credsCache: {
    creds: [],
  },
};

let mockedStore: Store<unknown, AnyAction>;
describe("Creds Tab", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    mockedStore = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
  });

  test("Render archived credentials", async () => {
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <ArchivedCredentialsContainer
          archivedCredentialsIsOpen={true}
          archivedCreds={credsFixAcdc}
          setArchivedCredentialsIsOpen={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("action-button")).toBeVisible();
    });

    credsFixAcdc.forEach((cred) => {
      expect(getByTestId(`credential-name-${cred.id}`).innerHTML).toBe(
        cred.credentialType
          .replace(/([A-Z][a-z])/g, " $1")
          .replace(/(\d)/g, " $1")
      );
    });

    expect(getByTestId("action-button").children.item(0)?.innerHTML).toBe(
      "Select"
    );
  });

  test("Restore multiple archived credentials", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={mockedStore}>
        <ArchivedCredentialsContainer
          archivedCredentialsIsOpen={true}
          archivedCreds={credsFixAcdc}
          setArchivedCredentialsIsOpen={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("action-button")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByText("Select"));
    });

    await waitFor(() => {
      expect(getByTestId("action-button").children.item(0)?.innerHTML).toBe(
        "Cancel"
      );
    });

    await waitFor(() => {
      expect(getByText("0 Credentials Selected")).toBeVisible();
    });

    const cardItem = getByTestId(`crendential-card-item-${credsFixAcdc[0].id}`);
    fireEvent.click(cardItem);

    await waitFor(() => {
      expect(getByTestId("selected-amount-credentials").innerHTML).toBe(
        `${credsFixAcdc.length} Credential Selected`
      );
    });

    fireEvent.click(getByTestId("restore-credentials"));

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.credentials.details.alert.restore.confirm)
      ).toBeVisible();
    });

    fireEvent.click(
      getByText(EN_TRANSLATIONS.credentials.details.alert.restore.confirm)
    );

    await waitFor(() => {
      expect(dispatchMock).toBeCalledTimes(2);
    });
  });

  test("Delete multiple archived credential", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={mockedStore}>
        <ArchivedCredentialsContainer
          archivedCredentialsIsOpen={true}
          archivedCreds={credsFixAcdc}
          setArchivedCredentialsIsOpen={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("action-button")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByText("Select"));
    });

    await waitFor(() => {
      expect(getByTestId("action-button").children.item(0)?.innerHTML).toBe(
        "Cancel"
      );

      expect(getByTestId("delete-credentials")).toBeVisible();
    });

    await waitFor(() => {
      expect(getByText("0 Credentials Selected")).toBeVisible();
    });

    const cardItem = getByTestId(`crendential-card-item-${credsFixAcdc[0].id}`);

    act(() => {
      fireEvent.click(cardItem);
      fireEvent.click(getByTestId("delete-credentials"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.credentials.details.alert.delete.confirm)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("alert-delete-confirm-button"));
    });

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.verifypasscode.title)).toBeVisible();
    });

    act(() => {
      passcodeFiller(getByText, getByTestId, "1", 6);
    });

    await waitFor(() => {
      expect(deleteCredentialsMock).toBeCalled();
    });
  });
});
