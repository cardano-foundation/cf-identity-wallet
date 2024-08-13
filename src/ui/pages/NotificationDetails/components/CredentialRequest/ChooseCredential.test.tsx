import { mockIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { createMemoryHistory } from "history";
import configureStore from "redux-mock-store";
import { IonReactMemoryRouter } from "@ionic/react-router";
import { act } from "react-dom/test-utils";
import { DataType, SecureStorage } from "@aparajita/capacitor-secure-storage";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../routes/paths";
import { connectionsForNotifications } from "../../../../__fixtures__/connectionsFix";
import { notificationsFix } from "../../../../__fixtures__/notificationsFix";
import { ChooseCredential } from "./ChooseCredential";
import { formatShortDate, formatTimeToSec } from "../../../../utils/formatters";
import { setNotificationDetailCache } from "../../../../../store/reducers/notificationsCache";
import { KeriaNotification } from "../../../../../core/agent/agent.types";
import { ACDC } from "./CredentialRequest.types";
import { credRequestFix } from "../../../../__fixtures__/credRequestFix";
import { KeyStoreKeys } from "../../../../../core/storage";

mockIonicReact();

const EXISTING_KEY = "keythatexists";
const NON_EXISTING_KEY = "keythatdoesnotexist";
const EXISTING_VALUE: DataType = "valuethatexists";

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: (key: string) => {
      if (key === EXISTING_KEY) {
        return EXISTING_VALUE;
      }
      return null;
    },
    set: jest.fn(),
  },
}));

const deleteNotificationMock = jest.fn((id: string) => Promise.resolve(id));
const offerAcdcFromApplyMock = jest.fn(
  (detail: KeriaNotification, acdc: ACDC) =>
    Promise.resolve({
      detail,
      acdc,
    })
);

jest.mock("../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      signifyNotifications: {
        deleteNotificationRecordById: (id: string) =>
          deleteNotificationMock(id),
      },
      ipexCommunications: {
        offerAcdcFromApply: (detail: KeriaNotification, acdc: ACDC) =>
          offerAcdcFromApplyMock(detail, acdc),
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
  connectionsCache: {
    connections: connectionsForNotifications,
  },
  notificationsCache: {
    notifications: notificationsFix,
  },
};

describe("Credential request - choose request", () => {
  test("Render", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();

    const { getByText, getByTestId, getAllByText } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter history={history}>
          <ChooseCredential
            pageId="multi-sign"
            activeStatus
            onBack={jest.fn()}
            onClose={jest.fn()}
            notificationDetails={notificationsFix[4]}
            credentialRequest={credRequestFix}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request
            .choosecredential.title
        )
      ).toBeVisible();
    });

    expect(
      getByTestId("card-item-" + credRequestFix.credentials[0].acdc.d)
    ).toBeVisible();
    expect(
      getByTestId("card-item-" + credRequestFix.credentials[1].acdc.d)
    ).toBeVisible();

    expect(
      getAllByText(Object.values(connectionsForNotifications)[0].label).length
    ).toBe(2);

    expect(
      getByText(
        `${formatShortDate(
          credRequestFix.credentials[0].acdc.a.dt
        )} - ${formatTimeToSec(credRequestFix.credentials[0].acdc.a.dt)}`
      )
    ).toBeVisible();
    expect(
      getByText(
        `${formatShortDate(
          credRequestFix.credentials[1].acdc.a.dt
        )} - ${formatTimeToSec(credRequestFix.credentials[1].acdc.a.dt)}`
      )
    ).toBeVisible();
  });

  test("Show detail", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter history={history}>
          <ChooseCredential
            pageId="multi-sign"
            activeStatus
            onBack={jest.fn()}
            onClose={jest.fn()}
            notificationDetails={notificationsFix[4]}
            credentialRequest={credRequestFix}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request
            .choosecredential.title
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByTestId(`cred-detail-${credRequestFix.credentials[0].acdc.d}`)
      );
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setNotificationDetailCache({
          notificationId: notificationsFix[4].id,
          viewCred: credRequestFix.credentials[0].acdc.d,
          step: 1,
          checked: false,
        })
      );
    });
  });

  test("Update cred after nav from cred detail page - check new", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.NOTIFICATIONS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      connectionsCache: {
        connections: connectionsForNotifications,
      },
      notificationsCache: {
        notifications: notificationsFix,
        notificationDetailCache: {
          notificationId: notificationsFix[4].id,
          viewCred: credRequestFix.credentials[0].acdc.d,
          step: 1,
          checked: true,
        },
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const path = `${TabsRoutePath.NOTIFICATIONS}/${notificationsFix[4].id}`;
    const history = createMemoryHistory();
    history.push(path);

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter
          initialEntries={[path]}
          history={history}
        >
          <ChooseCredential
            pageId="multi-sign"
            activeStatus
            onBack={jest.fn()}
            onClose={jest.fn()}
            notificationDetails={notificationsFix[4]}
            credentialRequest={credRequestFix}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request
            .choosecredential.title
        )
      ).toBeVisible();
    });

    await waitFor(() => {
      expect(
        getByTestId(
          `cred-select-${credRequestFix.credentials[0].acdc.d}`
        ).classList.contains("checkbox-checked")
      ).toBe(true);
      expect(dispatchMock).toBeCalledWith(setNotificationDetailCache(null));
    });
  });

  test("Update cred after nav from cred detail page - uncheck", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.NOTIFICATIONS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      connectionsCache: {
        connections: connectionsForNotifications,
      },
      notificationsCache: {
        notifications: notificationsFix,
        notificationDetailCache: null,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const path = `${TabsRoutePath.NOTIFICATIONS}/${notificationsFix[4].id}`;
    const history = createMemoryHistory();
    history.push(path);

    const { getByText, getByTestId, rerender } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter
          initialEntries={[path]}
          history={history}
        >
          <ChooseCredential
            pageId="multi-sign"
            activeStatus
            onBack={jest.fn()}
            onClose={jest.fn()}
            notificationDetails={notificationsFix[4]}
            credentialRequest={credRequestFix}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request
            .choosecredential.title
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByTestId(`cred-select-${credRequestFix.credentials[0].acdc.d}`)
      );
    });

    await waitFor(() => {
      expect(
        getByTestId(
          `cred-select-${credRequestFix.credentials[0].acdc.d}`
        ).classList.contains("checkbox-checked")
      ).toBe(true);
    });

    const updateState = {
      stateCache: {
        routes: [TabsRoutePath.NOTIFICATIONS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      connectionsCache: {
        connections: connectionsForNotifications,
      },
      notificationsCache: {
        notifications: notificationsFix,
        notificationDetailCache: {
          notificationId: notificationsFix[4].id,
          viewCred: credRequestFix.credentials[0].acdc.d,
          step: 1,
          checked: false,
        },
      },
    };

    const newStore = {
      ...mockStore(updateState),
      dispatch: dispatchMock,
    };

    rerender(
      <Provider store={newStore}>
        <IonReactMemoryRouter
          initialEntries={[path]}
          history={history}
        >
          <ChooseCredential
            pageId="multi-sign"
            activeStatus
            onBack={jest.fn()}
            onClose={jest.fn()}
            notificationDetails={notificationsFix[4]}
            credentialRequest={credRequestFix}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByTestId(
          `cred-select-${credRequestFix.credentials[0].acdc.d}`
        ).classList.contains("checkbox-checked")
      ).toBe(false);
      expect(dispatchMock).toBeCalledWith(setNotificationDetailCache(null));
    });
  });

  test.skip("Submit", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.NOTIFICATIONS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      connectionsCache: {
        connections: connectionsForNotifications,
      },
      notificationsCache: {
        notifications: notificationsFix,
        notificationDetailCache: null,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    jest.spyOn(SecureStorage, "get").mockResolvedValue("111111");

    const path = `${TabsRoutePath.NOTIFICATIONS}/${notificationsFix[4].id}`;
    const history = createMemoryHistory();
    history.push(path);

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter
          initialEntries={[path]}
          history={history}
        >
          <ChooseCredential
            pageId="multi-sign"
            activeStatus
            onBack={jest.fn()}
            onClose={jest.fn()}
            notificationDetails={notificationsFix[4]}
            credentialRequest={credRequestFix}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request
            .choosecredential.title
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByTestId(`cred-select-${credRequestFix.credentials[0].acdc.d}`)
      );
    });

    await waitFor(() => {
      expect(
        getByTestId(
          `cred-select-${credRequestFix.credentials[0].acdc.d}`
        ).classList.contains("checkbox-checked")
      ).toBe(true);
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-multi-sign"));
    });

    await waitFor(() => {
      expect(getByTestId("verify-passcode")).toBeVisible();
    });

    await waitFor(() => {
      expect(getByTestId("passcode-button-1")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("passcode-button-1"));
      fireEvent.click(getByTestId("passcode-button-1"));
      fireEvent.click(getByTestId("passcode-button-1"));
      fireEvent.click(getByTestId("passcode-button-1"));
      fireEvent.click(getByTestId("passcode-button-1"));
      fireEvent.click(getByTestId("passcode-button-1"));
    });

    await waitFor(() => {
      expect(SecureStorage.get).toHaveBeenCalledWith(KeyStoreKeys.APP_PASSCODE);
    });

    await waitFor(() => {
      expect(getByTestId("cre-request-spinner-container")).toBeVisible();
    });

    expect(offerAcdcFromApplyMock).toBeCalledWith(
      notificationsFix[4],
      credRequestFix.credentials[0].acdc
    );
  });
});
