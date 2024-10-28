import {
  ionFireEvent as fireEvent,
  waitForIonicReact,
} from "@ionic/react-test-utils";
import { getDefaultNormalizer, render, waitFor } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Agent } from "../../../core/agent/agent";
import { ConnectionStatus } from "../../../core/agent/agent.types";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { TabsRoutePath } from "../../../routes/paths";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { filteredCredsFix } from "../../__fixtures__/filteredCredsFix";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { formatShortDate, formatTimeToSec } from "../../utils/formatters";
import { passcodeFiller } from "../../utils/passcodeFiller";
import { ConnectionDetails } from "./ConnectionDetails";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen, ...props }: any) =>
    isOpen ? <div data-testid={props["data-testid"]}>{children}</div> : null,
}));

const deleteStaleLocalConnectionByIdMock = jest.fn();
const deleteConnection = jest.fn();
const markConnectionPendingDeleteMock = jest.fn()

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
        deleteConnectionById: () => deleteConnection(),
        markConnectionPendingDelete: () => markConnectionPendingDeleteMock()
      },
      credentials: {
        getCredentialDetailsById: jest.fn(),
        getCredentials: jest.fn(() => Promise.resolve([])),
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

  test("Open and Close ConnectionOptions", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };

    const setConnectionShortDetails = jest.fn();
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <ConnectionDetails
          connectionShortDetails={connectionsFix[0]}
          setConnectionShortDetails={setConnectionShortDetails}
        />
      </Provider>
    );

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
    getMock.mockImplementation(() => Promise.resolve("111111"));

    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };

    const setConnectionShortDetails = jest.fn();
    const { getByTestId, getByText, findByTestId } = render(
      <Provider store={storeMocked}>
        <ConnectionDetails
          connectionShortDetails={connectionsFix[0]}
          setConnectionShortDetails={setConnectionShortDetails}
        />
      </Provider>
    );

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

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.verifypasscode.title)).toBeVisible();
    });

    act(() => {
      passcodeFiller(getByText, getByTestId, "1", 6);
    });

    await waitFor(() => {
      expect(markConnectionPendingDeleteMock).toBeCalled();
    });
  });

  test("Show loading spin when load data", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };

    const setConnectionShortDetails = jest.fn();
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <ConnectionDetails
          connectionShortDetails={connectionsFix[0]}
          setConnectionShortDetails={setConnectionShortDetails}
        />
      </Provider>
    );

    expect(getByTestId("connection-detail-spinner-container")).toBeVisible();
  });

  test("Hide loading spin after load data", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const setConnectionShortDetails = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <ConnectionDetails
          connectionShortDetails={connectionsFix[0]}
          setConnectionShortDetails={setConnectionShortDetails}
        />
      </Provider>
    );

    expect(getByTestId("connection-detail-spinner-container")).toBeVisible();

    await waitFor(() => {
      expect(queryByTestId("connection-detail-spinner-container")).toBe(null);
    });
  });

  test("Delete button in the ConnectionOptions modal triggers a confirmation alert", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };

    const setConnectionShortDetails = jest.fn();
    const { getByTestId, getAllByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <ConnectionDetails
          connectionShortDetails={connectionsFix[0]}
          setConnectionShortDetails={setConnectionShortDetails}
        />
      </Provider>
    );

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

    act(() => {
      fireEvent.click(
        getByTestId("alert-confirm-delete-connection-cancel-button")
      );
    });

    await waitFor(() => {
      expect(
        queryByTestId("alert-confirm-delete-connection")
      ).not.toBeVisible();
    });
  });

  test("Open Manage Connection notes modal", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };

    const setConnectionShortDetails = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <ConnectionDetails
          connectionShortDetails={connectionsFix[0]}
          setConnectionShortDetails={setConnectionShortDetails}
        />
      </Provider>
    );

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
      expect(getByTestId("edit-connections-modal")).toBeVisible()
    );
  });

  test("We can switch between tabs", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };

    const setConnectionShortDetails = jest.fn();
    const { queryByTestId, getByTestId } = render(
      <Provider store={storeMocked}>
        <ConnectionDetails
          connectionShortDetails={connectionsFix[1]}
          setConnectionShortDetails={setConnectionShortDetails}
        />
      </Provider>
    );

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

    const setConnectionShortDetails = jest.fn();
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <ConnectionDetails
          connectionShortDetails={connectionsFix[0]}
          setConnectionShortDetails={setConnectionShortDetails}
        />
      </Provider>
    );

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

    const setConnectionShortDetails = jest.fn();
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <ConnectionDetails
          connectionShortDetails={connectionsFix[0]}
          setConnectionShortDetails={setConnectionShortDetails}
        />
      </Provider>
    );

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

    const setConnectionShortDetails = jest.fn();
    const { getByText, getAllByText } = render(
      <Provider store={storeMocked}>
        <ConnectionDetails
          connectionShortDetails={connectionDetails}
          setConnectionShortDetails={setConnectionShortDetails}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getAllByText(connectionDetails.label)[0]).toBeVisible();
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

    const setConnectionShortDetails = jest.fn();
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <ConnectionDetails
          connectionShortDetails={connectionsFix[0]}
          setConnectionShortDetails={setConnectionShortDetails}
        />
      </Provider>
    );

    getMock.mockImplementation(() => Promise.resolve("111111"));

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
