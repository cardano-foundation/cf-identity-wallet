import { waitForIonicReact } from "@ionic/react-test-utils";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Agent } from "../../../core/agent/agent";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import {
  addFavouritesCredsCache,
  removeFavouritesCredsCache,
  setCredsCache,
} from "../../../store/reducers/credsCache";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { credsFixAcdc, revokedCredFixs } from "../../__fixtures__/credsFix";
import { ToastMsgType } from "../../globals/types";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { CredentialDetailModule } from "./CredentialDetailModule";

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
    isOnline: true,
  },
  seedPhraseCache: {
    seedPhrase:
      "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
    bran: "bran",
  },
  credsCache: { creds: credsFixAcdc, favourites: [] },
  credsArchivedCache: { creds: credsFixAcdc },
  biometricsCache: {
    enabled: false,
  },
  notificationsCache: {
    notificationDetailCache: null,
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
    isOnline: true,
  },
  seedPhraseCache: {
    seedPhrase:
      "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
    bran: "bran",
  },
  credsCache: { creds: [] },
  credsArchivedCache: { creds: [] },
  biometricsCache: {
    enabled: false,
  },
  notificationsCache: {
    notificationDetailCache: null,
  },
};

describe("Cred Detail Module - current not archived credential", () => {
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
    const { getByText, getAllByText } = render(
      <Provider store={storeMocked}>
        <CredentialDetailModule
          pageId="credential-card-details"
          id={credsFixAcdc[0].id}
          onClose={jest.fn()}
        />
      </Provider>
    );
    await waitFor(() => {
      expect(getAllByText(credsFixAcdc[0].credentialType)).toHaveLength(2);
    });
    await waitFor(() => {
      expect(getByText(credsFixAcdc[0].s.description)).toBeVisible;
    });
    await waitFor(() => {
      expect(getByText(credsFixAcdc[0].a.i)).toBeVisible;
    });
  });

  test("It opens the options modal", async () => {
    const { findByTestId } = render(
      <Provider store={storeMocked}>
        <CredentialDetailModule
          pageId="credential-card-details"
          id={credsFixAcdc[0].id}
          onClose={jest.fn()}
        />
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

  test("It shows the warning when I click on the big archive button", async () => {
    const {
      findByTestId,
      getAllByText,
      queryAllByTestId,
      getByTestId,
      getAllByTestId,
    } = render(
      <Provider store={storeMocked}>
        <CredentialDetailModule
          pageId="credential-card-details"
          id={credsFixAcdc[0].id}
          onClose={jest.fn()}
        />
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

      expect(
        getAllByTestId("alert-delete-archive-confirm-button")[0]
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getAllByTestId("alert-delete-archive-confirm-button")[0]);
    });

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

    const { queryByTestId, findByTestId } = render(
      <Provider store={storeMocked}>
        <CredentialDetailModule
          pageId="credential-card-details"
          id={credsFixAcdc[0].id}
          onClose={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(queryByTestId("cred-detail-spinner-container")).toBe(null);
    });

    const heartButton = await findByTestId("heart-button");

    act(() => {
      fireEvent.click(heartButton);
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
        isOnline: true,
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
      notificationsCache: {
        notificationDetailCache: null,
      },
    };

    const storeMocked = {
      ...mockStore(initialStateNoPasswordCurrent),
      dispatch: dispatchMock,
    };

    const { findByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <CredentialDetailModule
          pageId="credential-card-details"
          id={credsFixAcdc[0].id}
          onClose={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(queryByTestId("cred-detail-spinner-container")).toBe(null);
    });

    const heartButton = await findByTestId("heart-button");

    act(() => {
      fireEvent.click(heartButton);
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
        isOnline: true,
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

      notificationsCache: {
        notificationDetailCache: null,
      },
    };

    const storeMocked = {
      ...mockStore(initialStateNoPasswordCurrent),
      dispatch: dispatchMock,
    };

    const { findByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <CredentialDetailModule
          pageId="credential-card-details"
          id={credsFixAcdc[0].id}
          onClose={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(queryByTestId("cred-detail-spinner-container")).toBe(null);
    });

    const heartButton = await findByTestId("heart-button");

    act(() => {
      fireEvent.click(heartButton);
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.MAX_FAVOURITES_REACHED)
      );
    });
  });
});

describe("Cred Detail Module - archived", () => {
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
        <CredentialDetailModule
          pageId="credential-card-details"
          id={credsFixAcdc[0].id}
          onClose={jest.fn()}
        />
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
        <CredentialDetailModule
          pageId="credential-card-details"
          id={credsFixAcdc[0].id}
          onClose={jest.fn()}
        />
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

      credDispatchMock.mockImplementation((action) => {
        expect(action).toEqual(setCredsCache(credsFixAcdc));
      });
    });
  });
});

describe("Cred Detail Module - light mode", () => {
  let storeMocked: Store<unknown, AnyAction>;
  const credDispatchMock = jest.fn();

  const state = {
    stateCache: {
      routes: [TabsRoutePath.CREDENTIALS],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        passwordIsSet: false,
        passwordIsSkipped: true,
      },
      isOnline: true,
    },
    seedPhraseCache: {
      seedPhrase:
        "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
      bran: "bran",
    },
    credsCache: { creds: credsFixAcdc },
    credsArchivedCache: { creds: [] },
    biometricsCache: {
      enabled: false,
    },
    notificationsCache: {
      notificationDetailCache: {
        notificationId: "test-id",
        viewCred: "test-cred",
        step: 0,
      },
    },
  };

  beforeAll(() => {
    jest
      .spyOn(Agent.agent.credentials, "getCredentialDetailsById")
      .mockResolvedValue(credsFixAcdc[0]);
  });
  beforeEach(() => {
    const mockStore = configureStore();
    storeMocked = {
      ...mockStore(state),
      dispatch: credDispatchMock,
    };
  });

  test("It show notification cred mode", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <CredentialDetailModule
          pageId="credential-card-details"
          id={credsFixAcdc[0].id}
          onClose={jest.fn()}
          isLightMode
          selected={false}
          setSelected={jest.fn}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("notification-selected")).toBeVisible();
    });
  });
});

describe("Cred detail - revoked", () => {
  let storeMocked: Store<unknown, AnyAction>;
  const credDispatchMock = jest.fn();

  const state = {
    stateCache: {
      routes: [TabsRoutePath.CREDENTIALS],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        passwordIsSet: false,
        passwordIsSkipped: true,
      },
      isOnline: true,
    },
    seedPhraseCache: {
      seedPhrase:
        "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
      bran: "bran",
    },
    credsCache: { creds: credsFixAcdc },
    credsArchivedCache: { creds: [] },
    biometricsCache: {
      enabled: false,
    },
    notificationsCache: {
      notificationDetailCache: {
        notificationId: "test-id",
        viewCred: "test-cred",
        step: 0,
      },
    },
  };

  beforeAll(() => {
    jest
      .spyOn(Agent.agent.credentials, "getCredentialDetailsById")
      .mockResolvedValue(revokedCredFixs[0]);
  });

  beforeEach(() => {
    const mockStore = configureStore();
    storeMocked = {
      ...mockStore(state),
      dispatch: credDispatchMock,
    };
  });

  test("It show notification revoke mode", async () => {
    const { getByText } = render(
      <Provider store={storeMocked}>
        <CredentialDetailModule
          pageId="credential-card-details"
          id={credsFixAcdc[0].id}
          onClose={jest.fn()}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.credentials.details.revoked)
      ).toBeVisible();
      expect(
        getByText(EN_TRANSLATIONS.credentials.details.delete)
      ).toBeVisible();
    });
  });
});
