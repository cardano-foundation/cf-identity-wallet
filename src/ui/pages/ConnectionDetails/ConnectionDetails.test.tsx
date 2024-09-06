import {
  act,
  getDefaultNormalizer,
  render,
  waitFor,
} from "@testing-library/react";
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
import { passcodeFiller } from "../../utils/passcodeFiller";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen, ...props }: any) =>
    isOpen ? <div data-testid={props["data-testid"]}>{children}</div> : null,
}));

const deleteStaleLocalConnectionByIdMock = jest.fn();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    MISSING_DATA_ON_KERIA:
      "Attempted to fetch data by ID on KERIA, but was not found. May indicate stale data records in the local database.",
    agent: {
      connections: {
        getConnectionById: jest.fn(),
        getConnectionHistoryById: jest.fn(),
        deleteStaleLocalConnectionById: () =>
          deleteStaleLocalConnectionByIdMock(),
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

const getMock = jest.fn();

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: () => getMock(),
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

  test("Get all connection history items", async () => {
    const connectionDetails = {
      ...connectionsFix[6],
      serviceEndpoints: [
        "http://keria:3902/oobi/EBvcao4Ub-Q7Wwkm0zJzwigvPTrthP4uH5mQ4efRv9aU/agent/EBJBjEDV_ysVyJHg7fDdqB332gCVhpgb6a3a00BtmWdg?name=The%20Pentagon",
      ],
      notes: [],
    };
    const historyEvents = [
      {
        type: 3,
        timestamp: "2024-08-07T15:33:18.204Z",
        credentialType: "Rare EVO 2024 Attendee",
      },
      {
        type: 2,
        timestamp: "2024-08-07T15:32:26.006Z",
        credentialType: "Rare EVO 2024 Attendee",
      },
      {
        type: 1,
        timestamp: "2024-08-07T15:32:13.597Z",
        credentialType: "Rare EVO 2024 Attendee",
      },
      {
        type: 0,
        timestamp: "2024-08-07T15:31:17.382Z",
        credentialType: "Rare EVO 2024 Attendee",
      },
    ];
    jest
      .spyOn(Agent.agent.connections, "getConnectionById")
      .mockResolvedValue(connectionDetails);

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

    expect(getByText(connectionDetails.label)).toBeVisible();

    act(() => {
      fireEvent.click(getByText(connectionDetails.label));
    });

    await waitFor(() => {
      expect(
        getByText(
          `${EN_TRANSLATIONS.connections.details.connectedwith.replace(
            "{{ issuer }}",
            connectionDetails.label
          )}`
        )
      ).toBeVisible();
      expect(
        getByText(
          `${formatShortDate(
            connectionDetails.connectionDate
          )} - ${formatTimeToSec(connectionDetails.connectionDate)}`
        )
      ).toBeVisible();
    });
    await waitFor(() => {
      expect(
        getByText(
          `${EN_TRANSLATIONS.connections.details.issuance.replace(
            "{{ credential }}",
            historyEvents[0].credentialType
              ?.replace(/([A-Z][a-z])/g, " $1")
              .replace(/^ /, "")
              .replace(/(\d)/g, "$1")
              .replace(/ {2,}/g, " ")
          )}`
        )
      ).toBeVisible();
      expect(
        getByText(
          `${formatShortDate(historyEvents[0].timestamp)} - ${formatTimeToSec(
            historyEvents[0].timestamp
          )}`
        )
      ).toBeVisible();
    });
    await waitFor(() => {
      expect(
        getByText(
          `${EN_TRANSLATIONS.connections.details.present.replace(
            "{{ issuer }}",
            connectionDetails.label
          )}`
        )
      ).toBeVisible();
      expect(
        getByText(
          `${formatShortDate(historyEvents[1].timestamp)} - ${formatTimeToSec(
            historyEvents[1].timestamp
          )}`
        )
      ).toBeVisible();
    });
    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.connections.details.agree)
      ).toBeVisible();
      expect(
        getByText(
          `${formatShortDate(historyEvents[2].timestamp)} - ${formatTimeToSec(
            historyEvents[2].timestamp
          )}`
        )
      ).toBeVisible();
    });
    await waitFor(() => {
      expect(
        getByText(
          `${EN_TRANSLATIONS.connections.details.update.replace(
            "{{ credential }}",
            historyEvents[1].credentialType
              ?.replace(/([A-Z][a-z])/g, " $1")
              .replace(/^ /, "")
              .replace(/(\d)/g, "$1")
              .replace(/ {2,}/g, " ")
          )}`
        )
      ).toBeVisible();
      expect(
        getByText(
          `${formatShortDate(historyEvents[3].timestamp)} - ${formatTimeToSec(
            historyEvents[3].timestamp
          )}`
        )
      ).toBeVisible();
    });
  });
});

describe("Checking the Connection Details Page when connection is missing from the cloud", () => {
  beforeEach(() => {
    jest
      .spyOn(Agent.agent.connections, "getConnectionById")
      .mockImplementation(() => {
        throw new Error(`${Agent.MISSING_DATA_ON_KERIA}: id`);
      });
  });

  test("Connection exists in the database but not on Signify", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();
    history.push(RoutePath.CONNECTION_DETAILS, {
      ...connectionsFix[0],
    });

    getMock.mockImplementation(() => Promise.resolve("111111"));

    const { getByTestId, getByText } = render(
      <IonReactMemoryRouter
        history={history}
        initialEntries={[RoutePath.CONNECTION_DETAILS]}
      >
        <Provider store={storeMocked}>
          <Route
            path={RoutePath.CONNECTION_DETAILS}
            component={ConnectionDetails}
          />
        </Provider>
      </IonReactMemoryRouter>
    );

    await waitForIonicReact();

    await waitFor(() => {
      expect(getByTestId("connection-details-cloud-error-page")).toBeVisible();
      expect(
        getByText(EN_TRANSLATIONS.connections.details.clouderror, {
          normalizer: getDefaultNormalizer({ collapseWhitespace: false }),
        })
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("delete-button-connection-details"));
    });

    await waitFor(() => {
      expect(getByTestId("alert-confirm-delete-connection")).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByTestId("alert-confirm-delete-connection-confirm-button")
      );
    });

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.verifypasscode.title)).toBeVisible();
    });

    act(() => {
      passcodeFiller(getByText, getByTestId, "1", 6);
    });

    await waitFor(() => {
      expect(deleteStaleLocalConnectionByIdMock).toBeCalled();
    });
  });
});
