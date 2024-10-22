import { IonReactMemoryRouter } from "@ionic/react-router";
import { mockIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../routes/paths";
import { connectionsForNotifications } from "../../../../__fixtures__/connectionsFix";
import { notificationsFix } from "../../../../__fixtures__/notificationsFix";
import { CredentialRequest } from "./CredentialRequest";
import { credRequestFix } from "../../../../__fixtures__/credRequestFix";
import { credsFixAcdc } from "../../../../__fixtures__/credsFix";
import { filteredIdentifierFix, multisignIdentifierFix } from "../../../../__fixtures__/filteredIdentifierFix";

mockIonicReact();

const getIpexApplyDetailsMock = jest.fn(() => Promise.resolve(credRequestFix));
const getLinkedGroupFromIpexApplyMock = jest.fn();

jest.mock("../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      ipexCommunications: {
        getIpexApplyDetails: () => getIpexApplyDetailsMock(),
        getLinkedGroupFromIpexApply: () => getLinkedGroupFromIpexApplyMock(),
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
    isOnline: true,
  },
  connectionsCache: {
    connections: connectionsForNotifications,
  },
  credsCache: { creds: credsFixAcdc, favourites: [] },
  credsArchivedCache: { creds: [] },
  notificationsCache: {
    notifications: notificationsFix,
  },
  identifiersCache: {
    identifiers: filteredIdentifierFix,
  },
};

describe("Credential request", () => {
  test("Render", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();

    const { getByText, getByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter history={history}>
          <CredentialRequest
            pageId="multi-sign"
            activeStatus
            handleBack={jest.fn()}
            notificationDetails={notificationsFix[4]}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    expect(getByTestId("cre-request-spinner-container")).toBeVisible();

    await waitFor(() => {
      expect(queryByTestId("cre-request-spinner-container")).toBe(null);

      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .information.title
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-multi-sign"));
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .choosecredential.title
        )
      ).toBeVisible();
    });
  });

  test("Alert when credential is empty", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();

    getIpexApplyDetailsMock.mockImplementation(() =>
      Promise.resolve({
        ...credRequestFix,
        credentials: [],
      })
    );

    const { getByText, getByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter history={history}>
          <CredentialRequest
            pageId="notification-details"
            activeStatus
            handleBack={jest.fn()}
            notificationDetails={notificationsFix[4]}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    expect(getByTestId("cre-request-spinner-container")).toBeVisible();

    await waitFor(() => {
      expect(queryByTestId("cre-request-spinner-container")).toBe(null);

      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .information.title
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-notification-details"));
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request.alert
            .text
        )
      ).toBeVisible();
    });
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
    credsCache: { creds: credsFixAcdc, favourites: [] },
    credsArchivedCache: { creds: [] },
    notificationsCache: {
      notifications: notificationsFix,
    },
    identifiersCache: {
      identifiers: [{
        ...multisignIdentifierFix[0],
        id: "id"
      }],
      favourites: [],
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
        "member-3": {
          label: "Member 3",
        },
        "member-4": {
          label: "Member 4"
        }
      },
    },
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  beforeEach(() => {
    getLinkedGroupFromIpexApplyMock.mockImplementation(() =>
      Promise.resolve({
        threshold: "5",
        members: ["member-1", "member-2", "member-3",  "member-4"],
        offer: {
          "EKfweht5lOkjaguB5dz42BMkfejhBFIF9-ghumzCJ6nv": {
            accepted: false,
            membersJoined: ["member-1", "member-2", "member-3",  "member-4"],
          },
          "EOT8OgwrwwNnBc-FzHPUBzsFQHOGXfifKqzfT5HwOVyb": {
            accepted: false,
            membersJoined: [],
          },
        },
      })
    );
  });

  test("Render", async () => {
    getIpexApplyDetailsMock.mockImplementation(() =>
      Promise.resolve(credRequestFix)
    );

    const history = createMemoryHistory();

    const { getByText, getByTestId, queryByTestId, queryAllByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter history={history}>
          <CredentialRequest
            pageId="multi-sign"
            activeStatus
            handleBack={jest.fn()}
            notificationDetails={{
              ...notificationsFix[4],
              multisigId: "multisig-id",
            }}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    expect(getByTestId("cre-request-spinner-container")).toBeVisible();

    await waitFor(() => {
      expect(queryByTestId("cre-request-spinner-container")).toBe(null);

      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .information.title
        )
      ).toBeVisible();
    });

    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.groupmember
      )
    ).toBeVisible();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.threshold
      )
    ).toBeVisible();
    expect(getByText("4/5")).toBeVisible();
    expect(getByText("Member 1")).toBeVisible();
    expect(getByText("Member 2")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("primary-button-multi-sign"));
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .choosecredential.title
        )
      ).toBeVisible();
    });

    expect(queryAllByTestId("joined-member").length).toBeGreaterThan(0);

    fireEvent.click(queryAllByTestId("joined-member")[0])

    await waitFor(() => {
      expect(
        getByTestId("members-modal")
      ).toBeVisible();
    });
  });

  test("Reach threshold", async () => {
    const history = createMemoryHistory();

    getLinkedGroupFromIpexApplyMock.mockImplementation(() =>
      Promise.resolve({
        threshold: "1",
        members: ["member-1", "member-2"],
        offer: {
          "EKfweht5lOkjaguB5dz42BMkfejhBFIF9-ghumzCJ6nv": {
            accepted: false,
            membersJoined: ["member-1"],
          },
          "EOT8OgwrwwNnBc-FzHPUBzsFQHOGXfifKqzfT5HwOVyb": {
            accepted: false,
            membersJoined: [],
          },
        },
      })
    );

    const { getByText, getByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter history={history}>
          <CredentialRequest
            pageId="multi-sign"
            activeStatus
            handleBack={jest.fn()}
            notificationDetails={{
              ...notificationsFix[4],
              multisigId: "multisig-id",
            }}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    expect(getByTestId("cre-request-spinner-container")).toBeVisible();

    await waitFor(() => {
      expect(queryByTestId("cre-request-spinner-container")).toBe(null);

      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .information.title
        )
      ).toBeVisible();
    });

    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.credential.request
          .information.reachthreshold
      )
    ).toBeVisible();
    
  });
});
