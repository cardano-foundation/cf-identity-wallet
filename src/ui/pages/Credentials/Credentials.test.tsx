import { AnyAction, Store } from "@reduxjs/toolkit";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { act } from "react";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { TabsRoutePath } from "../../../routes/paths";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { pendingCredFixs } from "../../__fixtures__/credsFix";
import { filteredCredsFix } from "../../__fixtures__/filteredCredsFix";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { Credentials } from "./Credentials";
import { passcodeFiller } from "../../utils/passcodeFiller";
import { CredentialStatus } from "../../../core/agent/services/credentialService.types";
import {
  setCurrentOperation,
  setCurrentRoute,
  showConnections,
} from "../../../store/reducers/stateCache";
import { OperationType } from "../../globals/types";

const deleteIdentifierMock = jest.fn();
const archiveIdentifierMock = jest.fn();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      credentials: {
        getCredentialDetailsById: jest.fn(),
        deleteCredential: () => deleteIdentifierMock(),
        archiveCredential: () => archiveIdentifierMock(),
      },
    },
  },
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen, ...props }: any) =>
    isOpen ? <div {...props}>{children}</div> : null,
}));

jest.mock("../../../core/storage", () => ({
  ...jest.requireActual("../../../core/storage"),
  SecureStorage: {
    get: () => "111111",
  },
}));

const initialStateEmpty = {
  stateCache: {
    routes: [TabsRoutePath.CREDENTIALS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
    isOnline: true,
    showConnections: false,
  },
  seedPhraseCache: {},
  credsCache: {
    creds: [],
  },
  credsArchivedCache: {
    creds: filteredCredsFix,
  },
  connectionsCache: {
    connections: [],
  },
  identifiersCache: {
    identifiers: filteredIdentifierFix,
  },
};

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
      {
        id: filteredCredsFix[1].id,
        time: 2,
      },
    ],
  },
  credsArchivedCache: {
    creds: filteredCredsFix,
  },
  connectionsCache: {
    connections: connectionsFix,
  },
  identifiersCache: {
    identifiers: filteredIdentifierFix,
  },
};

const archivedAndRevokedState = {
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
    creds: [
      filteredCredsFix[0],
      {
        ...filteredCredsFix[1],
        status: CredentialStatus.REVOKED,
      },
    ],
    favourites: [
      {
        id: filteredCredsFix[0].id,
        time: 1,
      },
    ],
  },
  credsArchivedCache: {
    creds: filteredCredsFix,
  },
  connectionsCache: {
    connections: connectionsFix,
  },
  identifiersCache: {
    identifiers: filteredIdentifierFix,
  },
  notificationsCache: {
    notifications: [],
  },
};

let mockedStore: Store<unknown, AnyAction>;
const dispatch = jest.fn();

describe("Creds Tab", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();
    const dispatchMock = jest.fn();

    mockedStore = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
  });

  test("Renders favourites in Creds", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={mockedStore}>
          <Credentials />
        </Provider>
      </MemoryRouter>
    );

    expect(
      getByText(EN_TRANSLATIONS.tabs.credentials.tab.favourites)
    ).toBeInTheDocument();
  });

  test("Renders Creds Tab", () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByText, getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Credentials />
        </Provider>
      </MemoryRouter>
    );

    expect(getByTestId("credentials-tab")).toBeInTheDocument();
    expect(getByText("Credentials")).toBeInTheDocument();
  });

  test("Renders Creds Card placeholder", () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Credentials />
        </Provider>
      </MemoryRouter>
    );

    expect(
      getByTestId("credentials-tab-cards-placeholder")
    ).toBeInTheDocument();
  });

  test("Renders Creds Card", () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Credentials />
        </Provider>
      </MemoryRouter>
    );

    expect(getByTestId("keri-card-template-favs-index-0")).toBeInTheDocument();
  });

  test("Toggle Connections view", async () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Credentials />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(showConnections(true));
    });
  });

  test("Show Connections placeholder", async () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Credentials />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("connections-button"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(showConnections(true));
    });
  });

  test("Remove pending cred alert", async () => {
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
      credsCache: {
        creds: pendingCredFixs,
        favourites: [],
      },
      seedPhraseCache: {},
      identifiersCache: {
        identifiers: filteredIdentifierFix,
      },

      credsArchivedCache: {
        creds: [],
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
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Credentials />
        </Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId(`card-item-${pendingCredFixs[0].id}`)).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId(`card-item-${pendingCredFixs[0].id}`));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.tabs.credentials.tab.detelepending.title)
      ).toBeVisible();
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.credentials.tab.detelepending.description
        )
      ).toBeVisible();
      expect(
        getByText(EN_TRANSLATIONS.tabs.credentials.tab.detelepending.button)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.tabs.credentials.tab.detelepending.button)
      );
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.credentials.tab.detelepending.secondchecktitle
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByTestId("credentials-tab-delete-pending-modal-confirm-button")
      );
    });

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.verifypasscode.title)).toBeVisible();
    });

    passcodeFiller(getByText, getByTestId, "1", 6);

    await waitFor(() => {
      expect(deleteIdentifierMock).toBeCalled();
      expect(archiveIdentifierMock).toBeCalled();
    });
  });

  test("Show archived & revoked credentials", async () => {
    const storeMocked = {
      ...mockStore(archivedAndRevokedState),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Credentials />
        </Provider>
      </MemoryRouter>
    );

    expect(getByTestId("cred-archived-revoked-button")).toBeVisible();
  });

  test("Create cred", () => {
    const storeMocked = {
      ...mockStore(archivedAndRevokedState),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Credentials />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("add-credential-button"));
    });

    expect(dispatchMock).toBeCalledWith(
      setCurrentOperation(OperationType.SCAN_CONNECTION)
    );
  });

  test("Open cred detail", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Credentials />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("keri-card-template-allcreds-index-0"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setCurrentRoute({
          path: `${TabsRoutePath.CREDENTIALS}/${filteredCredsFix[0].id}`,
        })
      );

      expect(
        getByTestId("favourite-container-element").getAttribute("style")
      ).not.toBe(null);
    });

    await waitFor(() => {
      expect(
        getByTestId("favourite-container-element").getAttribute("style")
      ).toBe(null);
    });
  });

  test("Open cred detail", async () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Credentials />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("keri-card-template-favs-index-0"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setCurrentRoute({
          path: `${TabsRoutePath.CREDENTIALS}/${filteredCredsFix[0].id}`,
        })
      );

      expect(
        getByTestId("favourite-container-element").getAttribute("style")
      ).toBe(null);
    });
  });

  test("Open cred archived modal", async () => {
    const storeMocked = {
      ...mockStore(archivedAndRevokedState),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.CREDENTIALS]}>
        <Provider store={storeMocked}>
          <Credentials />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId("cred-archived-revoked-button"));
    });

    await waitFor(() => {
      expect(getByTestId("archived-credentials")).toBeVisible();
    });
  });
});
