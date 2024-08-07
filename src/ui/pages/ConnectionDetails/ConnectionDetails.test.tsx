import { act, render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import {
  ionFireEvent as fireEvent,
  waitForIonicReact,
} from "@ionic/react-test-utils";
import { MemoryRouter, Route } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { IonReactMemoryRouter } from "@ionic/react-router";
import { ConnectionStatus } from "../../../core/agent/agent.types";
import { RoutePath } from "../../../routes";
import { TabsRoutePath } from "../../../routes/paths";
import { filteredCredsFix } from "../../__fixtures__/filteredCredsFix";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { Credentials } from "../Credentials";
import { ConnectionDetails } from "./ConnectionDetails";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { Agent } from "../../../core/agent/agent";
import { formatShortDate, formatTimeToSec } from "../../utils/formatters";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        getConnectionById: jest.fn(),
        getConnectionHistoryById: jest.fn(),
      },
      credentials: {
        getCredentialDetailsById: jest.fn(),
      },
      basicStorage: {
        deleteById: jest.fn(() => Promise.resolve()),
      },
    },
  },
}));

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: jest.fn(),
    remove: jest.fn(),
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();
const initialStateFull = {
  stateCache: {
    routes: [TabsRoutePath.CREDENTIALS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
    isOnline: true,
  },
  seedPhraseCache: {},
  credsCache: {
    creds: filteredCredsFix,
  },
  credsArchivedCache: {
    creds: filteredCredsFix,
  },
  connectionsCache: {
    connections: connectionsFix,
  },
  biometricsCache: {
    enabled: false,
  },
  identifiersCache: {
    identifiers: filteredIdentifierFix,
  },
};

describe("ConnectionDetails Page", () => {
  beforeEach(() => {
    jest.spyOn(Agent.agent.connections, "getConnectionById").mockImplementation(
      (): Promise<MockConnectionDetails> =>
        Promise.resolve({
          id: "ebfeb1ebc6f1c276ef71212ec20",
          label: "Cambridge University",
          connectionDate: "2017-08-14T19:23:24Z",
          logo: ".png",
          status: ConnectionStatus.ACCEPTED,
          notes: [
            {
              id: "ebfeb1ebc6f1c276ef71212ec20",
              title: "Title",
              message: "Message",
            },
          ],
        })
    );
  });

  test("Open and close ConnectionDetails", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const history = createMemoryHistory();
    history.push(TabsRoutePath.CREDENTIALS);
    const { getByTestId, queryByTestId, getByText } = render(
      <IonReactMemoryRouter
        history={history}
        initialEntries={[TabsRoutePath.CREDENTIALS]}
      >
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDENTIALS}
            component={Credentials}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </IonReactMemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    await waitFor(() => {
      expect(queryByTestId("connection-item-0")).toBeNull();
    });

    expect(getByText(connectionsFix[1].label)).toBeVisible();

    act(() => {
      fireEvent.click(getByText(connectionsFix[1].label));
    });

    await waitFor(() =>
      expect(queryByTestId("connection-details-page")).toBeVisible()
    );

    act(() => {
      fireEvent.click(getByTestId("close-button"));
    });

    await waitFor(() => {
      expect(getByText(connectionsFix[1].label)).toBeVisible();
    });
  });

  test("Open and Close ConnectionOptions", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDENTIALS}
            component={Credentials}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    act(() => {
      fireEvent.click(getByText(connectionsFix[1].label));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.connections.details.label)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("action-button"));
    });

    await waitFor(() =>
      expect(getByTestId("delete-button-connection-details")).toBeVisible()
    );
  });

  test("Delete button in the footer triggers a confirmation alert", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText, findByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDENTIALS}
            component={Credentials}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    act(() => {
      fireEvent.click(getByText(connectionsFix[1].label));
    });

    const alertDeleteConnection = await findByTestId(
      "alert-confirm-delete-connection-container"
    );
    expect(alertDeleteConnection).toHaveClass("alert-invisible");
    const deleteButton = await findByTestId("delete-button-connection-details");

    await waitForIonicReact();

    act(() => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() =>
      expect(alertDeleteConnection).toHaveClass("alert-visible")
    );

    act(() => {
      fireEvent.click(
        getByTestId("alert-confirm-delete-connection-confirm-button")
      );
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(getByTestId("verify-passcode")).toBeVisible();
      expect(getByTestId("verify-passcode")).toHaveAttribute("is-open", "true");
    });
  });

  test("Show loading spin when load data", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDENTIALS}
            component={Credentials}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    act(() => {
      fireEvent.click(getByText(connectionsFix[1].label));
    });

    expect(getByTestId("connection-detail-spinner-container")).toBeVisible();
  });

  test("Hide loading spin after load data", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText, queryByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDENTIALS}
            component={Credentials}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    act(() => {
      fireEvent.click(getByText(connectionsFix[1].label));
    });

    expect(getByTestId("connection-detail-spinner-container")).toBeVisible();

    await waitFor(() => {
      expect(queryByTestId("connection-detail-spinner-container")).toBe(null);
    });
  });

  test.skip("Delete button in the ConnectionOptions modal triggers a confirmation alert", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText, getAllByTestId, queryByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDENTIALS}
            component={Credentials}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    act(() => {
      fireEvent.click(getByText(connectionsFix[1].label));
    });

    await waitFor(() => {
      expect(queryByTestId("connection-detail-spinner-container")).toBe(null);
    });

    act(() => {
      fireEvent.click(getByTestId("action-button"));
    });

    await waitFor(() => {
      expect(getAllByTestId("connection-options-modal")[0]).toBeVisible();
      expect(getByTestId("delete-button-connection-options")).toBeVisible();
    });

    const button = getByTestId("delete-button-connection-options");

    act(() => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(getByTestId("alert-confirm-delete-connection")).toHaveClass(
        "custom-alert"
      );
    });
  });

  test.skip("Open Manage Connection notes modal", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText, queryByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDENTIALS}
            component={Credentials}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    act(() => {
      fireEvent.click(getByText(connectionsFix[1].label));
    });

    await waitFor(() => {
      expect(queryByTestId("connection-detail-spinner-container")).toBe(null);
    });

    act(() => {
      fireEvent.click(getByTestId("action-button"));
    });

    await waitFor(() =>
      expect(getByTestId("connection-options-manage-button")).toBeVisible()
    );

    act(() => {
      fireEvent.click(getByTestId("connection-options-manage-button"));
    });

    await waitForIonicReact();

    await waitFor(() =>
      expect(getByTestId("edit-connections-modal")).toHaveAttribute(
        "is-open",
        "true"
      )
    );
  });

  test("We can switch between tabs", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, queryByTestId, getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDENTIALS}
            component={Credentials}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    await waitFor(() => {
      expect(queryByTestId("connection-item-0")).toBeNull();
    });

    expect(getByText(connectionsFix[1].label)).toBeVisible();

    act(() => {
      fireEvent.click(getByText(connectionsFix[1].label));
    });

    await waitFor(() => {
      expect(getByTestId("connection-details-segment")).toBeVisible();
    });

    await waitFor(() =>
      expect(getByTestId("connection-details-tab")).toBeVisible()
    );

    const segment = getByTestId("connection-details-segment");
    act(() => {
      fireEvent.ionChange(segment, "notes");
    });

    await waitFor(() =>
      expect(queryByTestId("connection-details-tab")).toBeNull()
    );

    await waitFor(() =>
      expect(getByTestId("connection-notes-tab")).toBeVisible()
    );

    act(() => {
      fireEvent.ionChange(segment, "details");
    });

    await waitFor(() =>
      expect(queryByTestId("connection-notes-tab")).toBeNull()
    );

    await waitFor(() =>
      expect(getByTestId("connection-details-tab")).toBeVisible()
    );
  });
});

interface MockConnectionDetails {
  id: string;
  label: string;
  connectionDate: string;
  logo: string;
  status: ConnectionStatus;
  notes: any[];
}

describe("Checking the Connection Details Page when no notes are available", () => {
  beforeEach(() => {
    jest.spyOn(Agent.agent.connections, "getConnectionById").mockImplementation(
      (): Promise<MockConnectionDetails> =>
        Promise.resolve({
          id: "ebfeb1ebc6f1c276ef71212ec20",
          label: "Cambridge University",
          connectionDate: "2017-08-14T19:23:24Z",
          logo: ".png",
          status: "pending" as ConnectionStatus,
          notes: [],
        })
    );
  });

  test("We can see the connection notes placeholder", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, queryByTestId, getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDENTIALS}
            component={Credentials}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    await waitFor(() => {
      expect(queryByTestId("connection-item-0")).toBeNull();
    });

    expect(getByText(connectionsFix[1].label)).toBeVisible();

    act(() => {
      fireEvent.click(getByText(connectionsFix[1].label));
    });

    await waitFor(() => {
      expect(getByTestId("connection-details-segment")).toBeVisible();
    });

    await waitFor(() =>
      expect(getByTestId("connection-details-tab")).toBeVisible()
    );

    const segment = getByTestId("connection-details-segment");
    act(() => {
      fireEvent.ionChange(segment, "notes");
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.connections.details.nocurrentnotesext)
      ).toBeVisible();
    });
  });
});

describe("Checking the Connection Details Page when notes are available", () => {
  beforeEach(() => {
    jest.spyOn(Agent.agent.connections, "getConnectionById").mockImplementation(
      (): Promise<MockConnectionDetails> =>
        Promise.resolve({
          id: "ebfeb1ebc6f1c276ef71212ec20",
          label: "Cambridge University",
          connectionDate: "2017-08-14T19:23:24Z",
          logo: ".png",
          status: "pending" as ConnectionStatus,
          notes: [
            {
              id: "ebfeb1ebc6f1c276ef71212ec20",
              title: "Title",
              message: "Message",
            },
          ],
        })
    );
  });

  test("We can see the connection notes being displayed", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId, queryByTestId, getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDENTIALS}
            component={Credentials}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    await waitFor(() => {
      expect(queryByTestId("connection-item-0")).toBeNull();
    });

    expect(getByText(connectionsFix[1].label)).toBeVisible();

    act(() => {
      fireEvent.click(getByText(connectionsFix[1].label));
    });

    await waitFor(() => {
      expect(getByTestId("connection-details-segment")).toBeVisible();
    });

    await waitFor(() =>
      expect(getByTestId("connection-details-tab")).toBeVisible()
    );

    const segment = getByTestId("connection-details-segment");
    act(() => {
      fireEvent.ionChange(segment, "notes");
    });

    await waitFor(() => expect(getByText("Title")).toBeVisible());

    await waitFor(() => expect(getByText("Message")).toBeVisible());
  });

  test("Get multiple connection history items", async () => {
    const historyEvents = [
      {
        type: 0,
        timestamp: "2024-02-13T10:16:08.756Z",
        credentialType: "UniversityDegreeCredential",
      },
      {
        type: 0,
        timestamp: "2024-02-14T10:16:26.919Z",
        credentialType: "PermanentResidentCard",
      },
      {
        type: 0,
        timestamp: "2024-02-15T10:16:08.756Z",
        credentialType: "AccessPassCredential",
      },
      {
        type: 0,
        timestamp: "2024-02-16T11:39:22.919Z",
        credentialType: "Qualified vLEI Issuer Credential",
      },
    ];
    jest
      .spyOn(Agent.agent.connections, "getConnectionById")
      .mockResolvedValue(connectionsFix[1]);

    jest
      .spyOn(Agent.agent.connections, "getConnectionHistoryById")
      .mockResolvedValue(historyEvents);

    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };

    const { getByTestId, queryByTestId, getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDENTIALS}
            component={Credentials}
          />

          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    await waitFor(() => {
      expect(queryByTestId("connection-item-0")).toBeNull();
    });

    expect(getByText(connectionsFix[1].label)).toBeVisible();

    act(() => {
      fireEvent.click(getByText(connectionsFix[1].label));
    });

    await waitFor(() =>
      expect(getByText("Received \"University Degree Credential\"")).toBeVisible()
    );

    await waitFor(() =>
      expect(
        getByText(
          `${formatShortDate(historyEvents[0].timestamp)} - ${formatTimeToSec(
            historyEvents[0].timestamp
          )}`
        )
      ).toBeVisible()
    );

    await waitFor(() =>
      expect(getByText("Received \"Permanent Resident Card\"")).toBeVisible()
    );

    await waitFor(() =>
      expect(
        getByText(
          `${formatShortDate(historyEvents[1].timestamp)} - ${formatTimeToSec(
            historyEvents[1].timestamp
          )}`
        )
      ).toBeVisible()
    );

    await waitFor(() =>
      expect(getByText("Received \"Access Pass Credential\"")).toBeVisible()
    );

    await waitFor(() =>
      expect(
        getByText(
          `${formatShortDate(historyEvents[2].timestamp)} - ${formatTimeToSec(
            historyEvents[2].timestamp
          )}`
        )
      ).toBeVisible()
    );

    await waitFor(() =>
      expect(
        getByText("Received \"Qualified vLEI Issuer Credential\"")
      ).toBeVisible()
    );

    await waitFor(() =>
      expect(
        getByText(
          `${formatShortDate(historyEvents[3].timestamp)} - ${formatTimeToSec(
            historyEvents[3].timestamp
          )}`
        )
      ).toBeVisible()
    );

    await waitFor(() =>
      expect(getByText("Connected with \"Passport Office\"")).toBeVisible()
    );
  });
});
