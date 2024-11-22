import { BiometryType } from "@aparajita/capacitor-biometric-auth";
import { mockIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { IdentifierType } from "../../../../../core/agent/services/identifier.types";
import { KeyStoreKeys } from "../../../../../core/storage";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../routes/paths";
import { showGenericError } from "../../../../../store/reducers/stateCache";
import { connectionsForNotifications } from "../../../../__fixtures__/connectionsFix";
import { credsFixAcdc } from "../../../../__fixtures__/credsFix";
import { filteredIdentifierFix } from "../../../../__fixtures__/filteredIdentifierFix";
import { identifierFix } from "../../../../__fixtures__/identifierFix";
import { notificationsFix } from "../../../../__fixtures__/notificationsFix";
import { passcodeFillerWithAct } from "../../../../utils/passcodeFiller";
import { ReceiveCredential } from "./ReceiveCredential";

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

jest.mock("../../../../hooks/useBiometricsHook", () => ({
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
    isOpen ? <div data-testid={props["data-testid"]}>{children}</div> : null,
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

    await passcodeFillerWithAct(getByText, getByTestId, "1", 6);

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


  test("Show error when cred open", async () => {
    const storeMocked = {
      ...mockStore({
        ...initialState,
        stateCache: {
          routes: [TabsRoutePath.NOTIFICATIONS],
          authentication: {
            loggedIn: true,
            time: Date.now(),
            passcodeIsSet: true,
          },
          isOnline: true,
        },
      }),
      dispatch: dispatchMock,
    };

    getAcdcFromIpexGrantMock.mockImplementation(() => {
      return Promise.reject(new Error("Get acdc failed"));
    })

    const backMock = jest.fn();
    const {unmount} = render(
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
      expect(dispatchMock).toBeCalledWith(showGenericError(true));
      expect(backMock).toBeCalled();
    })

    unmount();
  });
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
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ...credsFixAcdc[0],
            identifierType: IdentifierType.Group,
            identifierId: filteredIdentifierFix[2].id,
          })
        }, 0)
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

    const { getByText, unmount, queryByTestId } = render(
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

    await waitFor(() => {
      expect(queryByTestId("spinner")).toBeNull();
    })

    unmount();
  });

  test("Multisig credential request: Accepted", async () => {
    const backMock = jest.fn();

    getAcdcFromIpexGrantMock.mockImplementation(() =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ...credsFixAcdc[0],
            identifierType: IdentifierType.Group,
            identifierId: filteredIdentifierFix[2].id,
          })
        }, 0)
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

    const { queryByTestId, unmount, findByText, queryByText, getByText } = render(
      <Provider store={storeMocked}>
        <ReceiveCredential
          pageId="creadential-request-1"
          activeStatus
          handleBack={backMock}
          notificationDetails={notificationsFix[0]}
        />
      </Provider>
    );

    expect(queryByTestId("primary-button-creadential-request")).toBe(null);
    expect(queryByTestId("secondary-button-creadential-request")).toBe(null);

    const memberName = queryByText("Member 1");
    expect(memberName).toBeNull();

    await waitFor(() => {
      expect(getLinkedGroupFromIpexGrantMock).toBeCalled();
    })

    await waitFor(() => {
      expect(queryByTestId("spinner")).toBeNull();
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.receive.members
        )
      ).toBeVisible();
    })

    const memberName1 = await findByText("Member 1");
    const memberName2 = await findByText("Member 2");

    await waitFor(() => {
      expect(memberName1).toBeVisible();
      expect(memberName2).toBeVisible();
    });

    unmount();
  });
});
