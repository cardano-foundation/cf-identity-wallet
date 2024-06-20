import { waitForIonicReact } from "@ionic/react-test-utils";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";
import { Agent } from "../../../core/agent/agent";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import {
  addFavouritesCredsCache,
  removeFavouritesCredsCache,
  setCredsCache,
} from "../../../store/reducers/credsCache";
import {
  setCurrentRoute,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { credsFixAcdc } from "../../__fixtures__/credsFix";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import { ToastMsgType } from "../../globals/types";
import { CredentialDetails } from "./CredentialDetails";
import { setCredsArchivedCache } from "../../../store/reducers/credsArchivedCache";

const path = TabsRoutePath.CREDENTIALS + "/" + credsFixAcdc[0].id;

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      credentials: {
        getCredentialDetailsById: jest.fn(),
        restoreCredential: jest.fn(() => Promise.resolve(true)),
        getCredentialShortDetailsById: jest.fn(() => Promise.resolve([])),
        getCredentials: jest.fn(() => Promise.resolve(true)),
      },
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
        createOrUpdateBasicRecord: jest.fn().mockResolvedValue(undefined),
      },
    },
  },
}));

jest.mock("../../hooks/appIonRouterHook", () => ({
  useAppIonRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: credsFixAcdc[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
}));
const initialStateCreds = {
  stateCache: {
    routes: [TabsRoutePath.CREDENTIALS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
      passwordIsSet: true,
    },
  },
  seedPhraseCache: {
    seedPhrase:
      "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
    bran: "bran",
  },
  identifiersCache: {
    identifiers: credsFixAcdc,
    favourites: [],
  },
};
const mockStore = configureStore();
const dispatchMock = jest.fn();

const initialStateNoPasswordCurrent = {
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
  credsCache: { creds: credsFixAcdc, favourites: [] },
  credsArchivedCache: { creds: credsFixAcdc },
  biometryCache: {
    enabled: false,
  },
};

const initialStateNoPasswordArchived = {
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
  credsCache: { creds: [] },
  credsArchivedCache: { creds: [] },
  biometryCache: {
    enabled: false,
  },
};

describe("Cards Details page - current not archived credential", () => {
  let storeMocked: Store<unknown, AnyAction>;
  beforeAll(() => {
    jest
      .spyOn(Agent.agent.credentials, "getCredentialDetailsById")
      .mockResolvedValue(credsFixAcdc[0]);
  });
  beforeEach(() => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    storeMocked = {
      ...mockStore(initialStateNoPasswordCurrent),
      dispatch: dispatchMock,
    };
  });

  test("It renders Card Details", async () => {
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
    await waitFor(() => {
      expect(getByTestId("creds-options-modal").getAttribute("is-open")).toBe(
        "false"
      );
      expect(getByTestId("view-creds-modal").getAttribute("is-open")).toBe(
        "false"
      );
      expect(getAllByTestId("verify-password")[0].getAttribute("is-open")).toBe(
        "false"
      );
    });
  });

  test("Nav back from credential", async () => {
    const initialStateNoPasswordCurrent = {
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
      credsCache: { creds: credsFixAcdc, favourites: [] },
      credsArchivedCache: { creds: credsFixAcdc },
      connectionsCache: {
        connections: [],
      },
    };

    storeMocked = {
      ...mockStore(initialStateNoPasswordCurrent),
      dispatch: dispatchMock,
    };

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredentialDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("tab-done-button")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("tab-done-button"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setCurrentRoute({
          path: TabsRoutePath.CREDENTIALS,
        })
      );
    });
  });

  test("It opens the options modal", async () => {
    const { findByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredentialDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    const credsOptionsModal = await findByTestId("creds-options-modal");
    expect(credsOptionsModal.getAttribute("is-open")).toBe("false");
    const optionsButton = await findByTestId("options-button");
    act(() => {
      fireEvent.click(optionsButton);
    });

    const credsOptionsModalOpen = await findByTestId("creds-options-modal");
    expect(credsOptionsModalOpen.getAttribute("is-open")).toBe("true");
  });

  test.skip("It shows the credential viewer", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredentialDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("options-button"));
    });

    await waitFor(() => {
      expect(getByTestId("creds-options-view-button")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("creds-options-view-button"));
    });

    await waitFor(() => {
      expect(getByTestId("view-creds-modal").getAttribute("is-open")).toBe(
        "true"
      );
    });

    await waitFor(() => {
      expect(getByText(credsFixAcdc[0].id)).toBeVisible();
    });
  });

  test("It shows the warning when I click on the big archive button", async () => {
    const {
      findByTestId,
      getAllByText,
      queryAllByTestId,
      getByTestId,
      getAllByTestId,
    } = render(
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
      expect(queryAllByTestId("alert-delete-archive")[0]).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        getAllByText(EN_TRANSLATIONS.credentials.details.alert.archive.title)[0]
      ).toBeVisible();
    });

    await waitForIonicReact();

    expect(
      getAllByTestId("alert-delete-archive-confirm-button")[0]
    ).toBeVisible();

    act(() => {
      fireEvent.click(getAllByTestId("alert-delete-archive-confirm-button")[0]);
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(getByTestId("verify-passcode")).toBeVisible();
      expect(getByTestId("verify-passcode")).toHaveAttribute("is-open", "true");
    });
  });

  test("It changes to favourite icon on click disabled favourite button", async () => {
    const storeMocked = {
      ...mockStore(initialStateNoPasswordCurrent),
      dispatch: dispatchMock,
    };

    const mockNow = 1466424490000;
    const dateSpy = jest.spyOn(Date, "now").mockReturnValue(mockNow);

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredentialDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("heart-button"));
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        addFavouritesCredsCache({
          id: credsFixAcdc[0].id,
          time: mockNow,
        })
      );
    });

    dateSpy.mockRestore();
  });
  test("Remove favourite credential", async () => {
    const mockNow = 1466424490000;

    const initialStateNoPasswordCurrent = {
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
      credsCache: {
        creds: credsFixAcdc,
        favourites: [
          {
            id: credsFixAcdc[0].id,
            time: mockNow,
          },
        ],
      },
    };

    const storeMocked = {
      ...mockStore(initialStateNoPasswordCurrent),
      dispatch: dispatchMock,
    };

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredentialDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("heart-button"));
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        removeFavouritesCredsCache(credsFixAcdc[0].id)
      );
    });
  });

  test("Maximum favourite credential", async () => {
    const mockNow = 1466424490000;

    const initialStateNoPasswordCurrent = {
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
      credsCache: {
        creds: credsFixAcdc,
        favourites: new Array(5).map((_, index) => ({
          id: index,
          time: mockNow,
        })),
      },
    };

    const storeMocked = {
      ...mockStore(initialStateNoPasswordCurrent),
      dispatch: dispatchMock,
    };

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredentialDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("heart-button"));
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.MAX_FAVOURITES_REACHED)
      );
    });
  });
});

describe("Cards Details page - archived credential", () => {
  let storeMocked: Store<unknown, AnyAction>;
  const credDispatchMock = jest.fn();
  beforeAll(() => {
    jest
      .spyOn(Agent.agent.credentials, "getCredentialDetailsById")
      .mockResolvedValue(credsFixAcdc[0]);
  });
  beforeEach(() => {
    const mockStore = configureStore();
    storeMocked = {
      ...mockStore(initialStateNoPasswordArchived),
      dispatch: credDispatchMock,
    };
  });

  test("It shows the restore alert", async () => {
    const { queryByText, getByText, queryAllByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredentialDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        queryByText(EN_TRANSLATIONS.credentials.details.restore)
      ).toBeVisible();
    });

    const restoreButton = getByText(
      EN_TRANSLATIONS.credentials.details.restore
    );

    act(() => {
      fireEvent.click(restoreButton);
    });

    await waitFor(() => {
      expect(queryAllByTestId("alert-restore")[0]).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        queryByText(EN_TRANSLATIONS.credentials.details.alert.restore.title)
      ).toBeVisible();
    });
  });

  test("Restore func", async () => {
    const { queryByText, getByText, queryAllByTestId, getByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CredentialDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        queryByText(EN_TRANSLATIONS.credentials.details.restore)
      ).toBeVisible();
    });

    const restoreButton = getByText(
      EN_TRANSLATIONS.credentials.details.restore
    );

    act(() => {
      fireEvent.click(restoreButton);
    });

    await waitFor(() => {
      expect(queryAllByTestId("alert-restore")[0]).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        queryByText(EN_TRANSLATIONS.credentials.details.alert.restore.title)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("alert-restore-confirm-button"));
    });

    await waitFor(() => {
      expect(credDispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.CREDENTIAL_RESTORED)
      );

      expect(credDispatchMock).toBeCalledWith(
        setCurrentRoute({
          path: TabsRoutePath.CREDENTIALS,
        })
      );

      credDispatchMock.mockImplementation((action) => {
        expect(action).toEqual(setCredsCache(credsFixAcdc));
      });
    });
  });
});
