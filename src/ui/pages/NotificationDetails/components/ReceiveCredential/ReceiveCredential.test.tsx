import { mockIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react";
import { KeyStoreKeys } from "../../../../../core/storage";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../routes/paths";
import { connectionsForNotifications } from "../../../../__fixtures__/connectionsFix";
import { filteredIdentifierFix } from "../../../../__fixtures__/filteredIdentifierFix";
import { notificationsFix } from "../../../../__fixtures__/notificationsFix";
import { passcodeFiller } from "../../../../utils/passcodeFiller";
import { ReceiveCredential } from "./ReceiveCredential";
import { credsFixAcdc } from "../../../../__fixtures__/credsFix";
import { IdentifierType } from "../../../../../core/agent/services/identifier.types";
import { identifierFix } from "../../../../__fixtures__/identifierFix";

mockIonicReact();
jest.useFakeTimers();

const mockGet = jest.fn((arg: unknown) => Promise.resolve("111111"));

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: (key: string) => mockGet(key),
    set: jest.fn(),
  },
}));

const deleteNotificationMock = jest.fn((id: string) => Promise.resolve(id));
const acceptAcdcMock = jest.fn(
  (id: string) =>
    new Promise((res) => {
      setTimeout(() => {
        res({
          id,
        });
      }, 700);
    })
);
const getLinkedGroupFromIpexGrantMock = jest.fn();
const getAcdcFromIpexGrantMock = jest.fn();
jest.mock("../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      keriaNotifications: {
        deleteNotificationRecordById: (id: string) =>
          deleteNotificationMock(id),
      },
      ipexCommunications: {
        acceptAcdc: (id: string) => acceptAcdcMock(id),
        getAcdcFromIpexGrant: () => getAcdcFromIpexGrantMock(),
        getLinkedGroupFromIpexGrant: () => getLinkedGroupFromIpexGrantMock(),
      },
      identifiers: {
        getIdentifier: jest.fn(() => Promise.resolve(identifierFix[0])),
      },
    },
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();

const initialState = {
  stateCache: {
    routes: [TabsRoutePath.NOTIFICATIONS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
  credsCache: {
    creds: [],
  },
  connectionsCache: {
    connections: connectionsForNotifications,
  },
  notificationsCache: {
    notifications: notificationsFix,
  },
  identifiersCache: {
    identifiers: filteredIdentifierFix,
  },
};

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  isPlatform: () => true,
  IonModal: ({ children, isOpen, ...props }: any) =>
    isOpen ? <div {...props}>{children}</div> : null,
}));

describe("Credential request", () => {
  beforeEach(() => {
    getAcdcFromIpexGrantMock.mockImplementation(() =>
      Promise.resolve({
        ...credsFixAcdc[0],
        status: "peding",
      })
    );
  });

  test("Render and decline", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getAllByText, getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <ReceiveCredential
          pageId="creadential-request"
          activeStatus
          handleBack={jest.fn()}
          notificationDetails={notificationsFix[0]}
        />
      </Provider>
    );

    expect(
      getAllByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.receive.title
      )[0]
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("secondary-button-creadential-request"));
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.identifier.alert
            .textdecline
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByTestId("multisig-request-alert-decline-confirm-button")
      );
    });

    await waitFor(() => {
      expect(deleteNotificationMock).toBeCalled();
    });
  });

  test("Accept", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const backMock = jest.fn();
    const { getAllByText, getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <ReceiveCredential
          pageId="creadential-request"
          activeStatus
          handleBack={backMock}
          notificationDetails={notificationsFix[0]}
        />
      </Provider>
    );

    expect(
      getAllByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.receive.title
      )[0]
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("primary-button-creadential-request"));
    });

    await waitFor(() => {
      expect(getByTestId("verify-passcode")).toBeVisible();
    });

    await waitFor(() => {
      expect(getByTestId("passcode-button-1")).toBeVisible();
    });

    act(() => {
      passcodeFiller(getByText, getByTestId, "1", 6);
    });

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(KeyStoreKeys.APP_PASSCODE);
    });

    await waitFor(() => {
      expect(acceptAcdcMock).toBeCalledWith(notificationsFix[0].id);
    });
  }, 10000);

  test("Open cred detail", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const backMock = jest.fn();
    const { getAllByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <ReceiveCredential
          pageId="creadential-request"
          activeStatus
          handleBack={backMock}
          notificationDetails={notificationsFix[0]}
        />
      </Provider>
    );

    expect(
      getAllByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.receive.title
      )[0]
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("cred-detail-btn"));
    });

    await waitFor(() => {
      expect(getByTestId("receive-credential-detail-modal")).toBeVisible();
    });
  }, 10000);
});

describe("Credential request: Multisig", () => {
  const initialState = {
    stateCache: {
      routes: [TabsRoutePath.NOTIFICATIONS],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
      },
      isOnline: true,
    },
    credsCache: {
      creds: [],
    },
    connectionsCache: {
      connections: connectionsForNotifications,
      multisigConnections: {
        "member-1": {
          label: "Member 1",
        },
        "member-2": {
          label: "Member 2",
        },
      },
    },
    notificationsCache: {
      notifications: notificationsFix,
    },
    identifiersCache: {
      identifiers: filteredIdentifierFix,
    },
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("Multisig credential request", async () => {
    const backMock = jest.fn();

    getAcdcFromIpexGrantMock.mockImplementation(() =>
      Promise.resolve({
        ...credsFixAcdc[0],
        identifierType: IdentifierType.Group,
        identifierId: filteredIdentifierFix[2].id,
      })
    );

    getLinkedGroupFromIpexGrantMock.mockImplementation(() =>
      Promise.resolve({
        threshold: "2",
        accepted: false,
        membersJoined: [],
        members: ["member-1", "member-2"],
      })
    );

    const { getByText } = render(
      <Provider store={storeMocked}>
        <ReceiveCredential
          pageId="creadential-request"
          activeStatus
          handleBack={backMock}
          notificationDetails={notificationsFix[0]}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.receive.members
        )
      ).toBeVisible();

      expect(getByText("Member 1")).toBeVisible();

      expect(getByText("Member 2")).toBeVisible();
    });
  });

  test("Multisig credential request: max thresh hold", async () => {
    const backMock = jest.fn();

    getAcdcFromIpexGrantMock.mockImplementation(() =>
      Promise.resolve({
        ...credsFixAcdc[0],
        identifierType: IdentifierType.Group,
        identifierId: filteredIdentifierFix[2].id,
      })
    );

    getLinkedGroupFromIpexGrantMock.mockImplementation(() =>
      Promise.resolve({
        threshold: "2",
        accepted: false,
        membersJoined: ["member-1", "member-2"],
        members: ["member-1", "member-2"],
      })
    );

    const { getByText } = render(
      <Provider store={storeMocked}>
        <ReceiveCredential
          pageId="creadential-request"
          activeStatus
          handleBack={backMock}
          notificationDetails={notificationsFix[0]}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.tabs.notifications.details.buttons.addcred)
      ).toBeVisible();
    });
  });

  test("Multisig credential request: Accepted", async () => {
    const backMock = jest.fn();

    getAcdcFromIpexGrantMock.mockImplementation(() =>
      Promise.resolve({
        ...credsFixAcdc[0],
        identifierType: IdentifierType.Group,
        identifierId: filteredIdentifierFix[2].id,
      })
    );

    getLinkedGroupFromIpexGrantMock.mockImplementation(() =>
      Promise.resolve({
        threshold: "2",
        accepted: true,
        membersJoined: ["member-1"],
        members: ["member-1", "member-2"],
      })
    );

    const { queryByTestId } = render(
      <Provider store={storeMocked}>
        <ReceiveCredential
          pageId="creadential-request"
          activeStatus
          handleBack={backMock}
          notificationDetails={notificationsFix[0]}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(queryByTestId("primary-button-creadential-request")).toBe(null);
      expect(queryByTestId("secondary-button-creadential-request")).toBe(null);
    });
  });
});
