import { IonReactMemoryRouter } from "@ionic/react-router";
import { mockIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { TabsRoutePath } from "../../../routes/paths";
import { connectionsForNotifications } from "../../__fixtures__/connectionsFix";
import { notificationsFix } from "../../__fixtures__/notificationsFix";
import { NotificationFilter } from "./Notification.types";
import { Notifications } from "./Notifications";

mockIonicReact();

const readNotificationMock = jest.fn((id: string) => Promise.resolve(id));
jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      multiSigs: {
        getMultisigIcpDetails: jest.fn().mockResolvedValue({
          sender: {
            label: "CF Credential Issuance",
          },
        }),
      },
      signifyNotifications: {
        readNotification: (id: string) => readNotificationMock(id),
      },
      basicStorage: {
        deleteById: jest.fn(() => Promise.resolve()),
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
    connections: [],
  },
  notificationsCache: {
    notifications: [],
  },
};

const fullState = {
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

const filterTestData = {
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
    notifications: [notificationsFix[0], notificationsFix[3]],
  },
};

describe("Notifications Tab", () => {
  test("Renders empty Notifications Tab", () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText, queryByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[TabsRoutePath.NOTIFICATIONS]}>
          <Notifications />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId("notifications-tab")).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.notifications.tab.header)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.notifications.tab.chips.all)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.notifications.tab.chips.identifiers)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.notifications.tab.chips.credentials)
    ).toBeInTheDocument();
    expect(queryByTestId("notifications-tab-section-new")).toBeNull();
    expect(queryByTestId("notifications-tab-section-earlier")).toBeNull();
  });

  test("Filter", async () => {
    const storeMocked = {
      ...mockStore(filterTestData),
      dispatch: dispatchMock,
    };
    const { getByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[TabsRoutePath.NOTIFICATIONS]}>
          <Notifications />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByTestId(`notifications-tab-item-${notificationsFix[0].id}`)
      ).toBeVisible();
      expect(
        getByTestId(`notifications-tab-item-${notificationsFix[3].id}`)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByTestId(`${NotificationFilter.Credential}-filter-btn`)
      );
    });

    await waitFor(() => {
      expect(
        getByTestId(`notifications-tab-item-${notificationsFix[0].id}`)
      ).toBeVisible();
      expect(
        queryByTestId(`notifications-tab-item-${notificationsFix[3].id}`)
      ).toBe(null);
    });

    act(() => {
      fireEvent.click(
        getByTestId(`${NotificationFilter.Identifier}-filter-btn`)
      );
    });

    await waitFor(() => {
      expect(
        queryByTestId(`notifications-tab-item-${notificationsFix[0].id}`)
      ).toBe(null);
      expect(
        getByTestId(`notifications-tab-item-${notificationsFix[3].id}`)
      ).toBeVisible();
    });
  });

  test("Item should mark as readed when click", async () => {
    const storeMocked = {
      ...mockStore(filterTestData),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();
    history.push(TabsRoutePath.NOTIFICATIONS);

    const { getByTestId } = render(
      <IonReactMemoryRouter history={history}>
        <Provider store={storeMocked}>
          <Notifications />
        </Provider>
      </IonReactMemoryRouter>
    );

    await waitFor(() => {
      expect(
        getByTestId(`notifications-tab-item-${notificationsFix[0].id}`)
      ).toBeVisible();
      expect(
        getByTestId(`notifications-tab-item-${notificationsFix[3].id}`)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByTestId(`notifications-tab-item-${notificationsFix[0].id}`)
      );
    });

    expect(readNotificationMock).toBeCalledWith(notificationsFix[0].id);
  });

  test("Renders Notifications in Notifications Tab", async () => {
    const storeMocked = {
      ...mockStore(fullState),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText, getAllByText } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[TabsRoutePath.NOTIFICATIONS]}>
          <Notifications />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId("notifications-tab-section-new")).toBeInTheDocument();
    setTimeout(() => {
      const notificationElements = getAllByText(
        "CF Credential Issuance wants to issue you a credential"
      );
      notificationElements.forEach((element) => {
        expect(element).toBeVisible();
      });
      expect(
        getByText(
          "CF Credential Issuance is requesting to create a multi-sig identifier with you"
        )
      ).toBeInTheDocument();
      expect(
        getByText("CF Credential Issuance has requested a credential from you")
      ).toBeInTheDocument();
      expect(
        getByTestId("notifications-tab-section-earlier")
      ).toBeInTheDocument();
      expect(getByText("10m")).toBeInTheDocument();
      expect(getByText("2h")).toBeInTheDocument();
      expect(getByText("2d")).toBeInTheDocument();
      expect(getByText("2w")).toBeInTheDocument();
      expect(getByText("2y")).toBeInTheDocument();
    }, 1);
  });
});
