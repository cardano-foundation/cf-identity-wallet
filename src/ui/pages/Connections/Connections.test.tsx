import { IonReactMemoryRouter } from "@ionic/react-router";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";
import { ionFireEvent } from "@ionic/react-test-utils";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { TabsRoutePath } from "../../../routes/paths";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { filteredCredsFix } from "../../__fixtures__/filteredCredsFix";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { OperationType } from "../../globals/types";
import { formatShortDate } from "../../utils/formatters";
import { passcodeFiller } from "../../utils/passcodeFiller";
import { Credentials } from "../Credentials/Credentials";
import { Identifiers } from "../Identifiers";
import { Connections } from "./Connections";
import { setOpenConnectionDetail } from "../../../store/reducers/connectionsCache";

const combineMock = jest.fn(() => TabsRoutePath.IDENTIFIERS);

const deleteConnectionByIdMock = jest.fn();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        createMediatorInvitation: jest.fn(),
        getShortenUrl: jest.fn(),
        deleteStaleLocalConnectionById: () => deleteConnectionByIdMock(),
      },
    },
  },
}));

jest.mock("react-qrcode-logo", () => {
  return {
    ...jest.requireActual("react-qrcode-logo"),
    QRCode: () => <div></div>,
  };
});

const historyPushMock = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: (args: unknown) => {
      historyPushMock(args);
    },
    location: {
      pathname: combineMock(),
    },
  }),
}));

jest.mock("../../../core/storage", () => ({
  ...jest.requireActual("../../../core/storage"),
  SecureStorage: {
    get: () => "111111",
  },
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen, ...props }: any) =>
    isOpen ? <div {...props}>{children}</div> : null,
  IonSearchbar: (props: any) => {
    const {
      onIonInput,
      debounce,
      onIonCancel,
      showCancelButton,
      onIonFocus,
      onIonBlur,
      ...resProps
    } = props;

    return (
      <input
        {...resProps}
        data-testid="search-bar"
        onChange={onIonInput}
        onBlur={onIonBlur}
        onFocus={onIonFocus}
      />
    );
  },
}));

const mockSetShowConnections = jest.fn();

const initialStateFull = {
  stateCache: {
    routes: [TabsRoutePath.IDENTIFIERS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
  identifierViewTypeCacheCache: {
    viewType: null,
    favouriteIndex: 0,
  },
  seedPhraseCache: {},
  credsCache: {
    creds: filteredCredsFix,
    favourites: [
      {
        id: filteredCredsFix[0].id,
        time: 1,
      },
    ],
  },
  connectionsCache: {
    connections: connectionsFix,
  },
  identifiersCache: {
    identifiers: filteredIdentifierFix,
  },
};

let mockedStore: Store<unknown, AnyAction>;

describe("Connections page", () => {
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();

    mockedStore = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };

    combineMock.mockReturnValue(TabsRoutePath.IDENTIFIERS);
  });

  test("Render connections page empty (self paginated)", async () => {
    const initialStateFull = {
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
        creds: filteredCredsFix,
        favourites: [
          {
            id: filteredCredsFix[0].id,
            time: 1,
          },
        ],
      },
      connectionsCache: {
        connections: [],
      },
      identifiersCache: {
        identifiers: filteredIdentifierFix,
      },
    };
    const mockStore = configureStore();
    const dispatchMock = jest.fn();

    const mockedStore = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };

    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.IDENTIFIERS]}>
        <Provider store={mockedStore}>
          <Connections
            setShowConnections={mockSetShowConnections}
            showConnections={true}
            selfPaginated={true}
          />
        </Provider>
      </MemoryRouter>
    );

    expect(getByTestId("connections-tab-cards-placeholder")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("primary-button-connections-tab"));
    });

    await waitFor(() => {
      expect(getByTestId("add-a-connection-title")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("add-connection-modal-provide-qr-code"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.connections.tab.indentifierselector.title)
      ).toBeVisible();
    });
  });

  test("Render connections page empty (no self pagination)", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.MENU],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      credsCache: {
        creds: [],
        favourites: [],
      },
      connectionsCache: {
        connections: [],
      },
      identifiersCache: {
        identifiers: [],
      },
    };
    const mockStore = configureStore();
    const dispatchMock = jest.fn();

    const mockedStore = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.IDENTIFIERS]}>
        <Provider store={mockedStore}>
          <Connections
            setShowConnections={mockSetShowConnections}
            showConnections={true}
            selfPaginated={false}
          />
        </Provider>
      </MemoryRouter>
    );

    expect(getByTestId("connections-tab-cards-placeholder")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("primary-button-connections-tab"));
    });

    await waitFor(() => {
      expect(getByTestId("add-a-connection-title")).toBeVisible();
    });
  });

  test("It renders connections page successfully", async () => {
    const { getByTestId, getByText, getAllByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.IDENTIFIERS]}>
        <Provider store={mockedStore}>
          <Connections
            setShowConnections={mockSetShowConnections}
            showConnections={true}
            selfPaginated={true}
          />
        </Provider>
      </MemoryRouter>
    );
    const addConnectionBtn = getByTestId("add-connection-button");
    expect(addConnectionBtn).toBeInTheDocument();
    const title = getByTestId("tab-title-connections");
    expect(title).toBeInTheDocument();
    expect(getByText(connectionsFix[0].label)).toBeInTheDocument();
    expect(
      getByText(formatShortDate(connectionsFix[0].connectionDate))
    ).toBeInTheDocument();
    expect(getAllByText(connectionsFix[0].status)[0]).toBeInTheDocument();
  });

  test("It shows available sharing ID", async () => {
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <Connections
          setShowConnections={mockSetShowConnections}
          showConnections={true}
          selfPaginated={true}
        />
      </Provider>
    );
    act(() => {
      fireEvent.click(getByTestId("add-connection-button"));
    });

    await waitFor(() => {
      expect(getByTestId("add-connection-modal-provide-qr-code")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("add-connection-modal-provide-qr-code"));
    });

    await waitFor(() => {
      expect(getByTestId("connection-identifier-selector-page")).toBeVisible();
      expect(
        getByTestId(
          `card-item-${initialStateFull.identifiersCache.identifiers[0].id}`
        )
      ).toBeVisible();
    });
  });

  test("It shows and dismiss an Alert when no Identifiers are available", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      identifiersCache: {
        identifiers: [],
      },
      identifierViewTypeCacheCache: {
        viewType: null,
      },
      connectionsCache: {
        connections: [],
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText, queryByText } = render(
      <Provider store={storeMocked}>
        <Connections
          setShowConnections={mockSetShowConnections}
          showConnections={true}
          selfPaginated={true}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("primary-button-connections-tab"));
    });

    await waitFor(() => {
      expect(getByTestId("add-connection-modal-provide-qr-code")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("add-connection-modal-provide-qr-code"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.connections.tab.alert.message)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("alert-create-keri-cancel-button"));
    });

    await waitFor(() => {
      expect(
        queryByText(EN_TRANSLATIONS.connections.tab.alert.message)
      ).toBeNull();
    });
  });

  test("It allows to create an Identifier when no Identifiers are available", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      identifiersCache: {
        identifiers: [],
      },
      identifierViewTypeCacheCache: {
        viewType: null,
      },
      connectionsCache: {
        connections: [],
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.IDENTIFIERS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.IDENTIFIERS}
            component={Identifiers}
          />
        </Provider>
      </MemoryRouter>
    );

    expect(getByTestId("connections-button")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    expect(getByText(EN_TRANSLATIONS.connections.tab.title)).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("primary-button-connections-tab"));
    });

    await waitFor(() => {
      expect(getByTestId("add-connection-modal-provide-qr-code")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("add-connection-modal-provide-qr-code"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.connections.tab.alert.message)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByText(EN_TRANSLATIONS.connections.tab.alert.confirm));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setCurrentOperation(
          OperationType.CREATE_IDENTIFIER_SHARE_CONNECTION_FROM_IDENTIFIERS
        )
      );
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.createidentifier.add.title)
      ).toBeVisible();
    });
  });

  test("Search", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      identifiersCache: {
        identifiers: [],
      },
      identifierViewTypeCacheCache: {
        viewType: null,
      },
      connectionsCache: {
        connections: connectionsFix,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByTestId, getByText, queryByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.IDENTIFIERS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.IDENTIFIERS}
            component={Identifiers}
          />
        </Provider>
      </MemoryRouter>
    );

    expect(getByTestId("connections-button")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    await waitFor(() => {
      expect(getByTestId("search-bar")).toBeVisible();
    });

    const searchBar = getByTestId("search-bar");

    act(() => {
      ionFireEvent.ionFocus(searchBar);
    });

    await waitFor(() => {
      expect(getByTestId("connections-tab-tab-header")).toBeVisible();
    });

    act(() => {
      ionFireEvent.change(searchBar, {
        target: {
          value: "Cambridge",
        },
      });
    });

    await waitFor(() => {
      expect(getByTestId("search-connection")).toBeVisible();
      expect(queryByTestId("empty-search-connection")).toBe(null);
      expect(queryByTestId("connection-group-0")).toBe(null);
      expect(getByText("Cambridge University")).toBeVisible();
    });

    act(() => {
      ionFireEvent.change(searchBar, {
        target: {
          value: "Nothing",
        },
      });
    });

    await waitFor(() => {
      expect(queryByTestId("search-connection")).toBe(null);
      expect(getByTestId("empty-search-connection")).toBeVisible();
      expect(queryByTestId("connection-group-0")).toBe(null);
    });
  });
});

describe("Connections page from Credentials tab", () => {
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();

    mockedStore = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };

    combineMock.mockReturnValue(TabsRoutePath.CREDENTIALS);
  });

  test("It allows to create an Identifier when no Identifiers are available (credentials tab)", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.CREDENTIALS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      identifiersCache: {
        identifiers: [],
      },
      credsCache: {
        creds: [],
      },
      credsArchivedCache: {
        creds: [],
      },
      identifierViewTypeCacheCache: {
        viewType: null,
      },
      connectionsCache: {
        connections: [],
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.CREDENTIALS}
            component={Credentials}
          />
        </Provider>
      </MemoryRouter>
    );

    expect(getByTestId("connections-button")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    expect(getByText(EN_TRANSLATIONS.connections.tab.title)).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("primary-button-connections-tab"));
    });

    await waitFor(() => {
      expect(getByTestId("add-connection-modal-provide-qr-code")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("add-connection-modal-provide-qr-code"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.connections.tab.alert.message)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByText(EN_TRANSLATIONS.connections.tab.alert.confirm));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setCurrentOperation(
          OperationType.CREATE_IDENTIFIER_SHARE_CONNECTION_FROM_CREDENTIALS
        )
      );
    });
  });

  test("Open connection when history.state.openConnections contain", async () => {
    const history = createMemoryHistory();
    history.push(TabsRoutePath.IDENTIFIERS, {
      openConnections: true,
    });

    const { getByTestId } = render(
      <IonReactMemoryRouter
        history={history}
        initialEntries={[TabsRoutePath.IDENTIFIERS]}
      >
        <Provider store={mockedStore}>
          <Route
            path={TabsRoutePath.IDENTIFIERS}
            component={Identifiers}
          />
        </Provider>
      </IonReactMemoryRouter>
    );

    await waitFor(() => {
      const addConnectionBtn = getByTestId("add-connection-button");
      expect(addConnectionBtn).toBeInTheDocument();
      const title = getByTestId("tab-title-connections");
      expect(title).toBeInTheDocument();
    });
  });

  test("Redirect to connection detail when click on connection item", async () => {
    const history = createMemoryHistory();
    history.push(TabsRoutePath.IDENTIFIERS);

    const { getByTestId } = render(
      <IonReactMemoryRouter
        history={history}
        initialEntries={[TabsRoutePath.IDENTIFIERS]}
      >
        <Provider store={mockedStore}>
          <Connections
            setShowConnections={mockSetShowConnections}
            showConnections={true}
            selfPaginated={true}
          />
        </Provider>
      </IonReactMemoryRouter>
    );

    await waitFor(() => {
      const addConnectionBtn = getByTestId("add-connection-button");
      expect(addConnectionBtn).toBeInTheDocument();
      const title = getByTestId("tab-title-connections");
      expect(title).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId(`card-item-${connectionsFix[2].id}`));
    });

    expect(dispatchMock).toBeCalled();
  });

  test("Remove pending connection alert", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIER_DETAILS, TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      identifiersCache: {
        identifiers: filteredIdentifierFix,
      },
      identifierViewTypeCacheCache: {
        viewType: null,
      },
      connectionsCache: {
        connections: connectionsFix,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.IDENTIFIERS]}>
        <Provider store={storeMocked}>
          <Connections
            setShowConnections={mockSetShowConnections}
            showConnections={true}
            selfPaginated={true}
          />
        </Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId(`card-item-${connectionsFix[4].id}`)).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId(`card-item-${connectionsFix[4].id}`));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.connections.tab.detelepending.title)
      ).toBeVisible();
      expect(
        getByText(EN_TRANSLATIONS.connections.tab.detelepending.description)
      ).toBeVisible();
      expect(
        getByText(EN_TRANSLATIONS.connections.tab.detelepending.button)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.connections.tab.detelepending.button)
      );
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.connections.tab.detelepending.secondchecktitle
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByTestId("connections-tab-delete-pending-modal-confirm-button")
      );
    });

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.verifypasscode.title)).toBeVisible();
    });

    passcodeFiller(getByText, getByTestId, "1", 6);

    await waitFor(() => {
      expect(deleteConnectionByIdMock).toBeCalled();
    });
  });

  test("Show connection detail", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const connection = connectionsFix[1];
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIER_DETAILS, TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      identifiersCache: {
        identifiers: filteredIdentifierFix,
      },
      identifierViewTypeCacheCache: {
        viewType: null,
      },
      connectionsCache: {
        openConnectionId: connection.id,
        connections: {
          [connection.id]: connection,
        },
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    render(
      <MemoryRouter initialEntries={[TabsRoutePath.IDENTIFIERS]}>
        <Provider store={storeMocked}>
          <Connections
            setShowConnections={mockSetShowConnections}
            showConnections={true}
            selfPaginated={true}
          />
        </Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(setOpenConnectionDetail(undefined));
      expect(historyPushMock).toBeCalled();
    });
  });
});
