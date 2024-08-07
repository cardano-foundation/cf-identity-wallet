import { IonReactMemoryRouter } from "@ionic/react-router";
import { mockIonicReact } from "@ionic/react-test-utils";
import { render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Provider } from "react-redux";
import { Route } from "react-router-dom";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { TabsRoutePath } from "../../../routes/paths";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { notificationsFix } from "../../__fixtures__/notificationsFix";
import { NotificationDetails } from "./NotificationDetails";

mockIonicReact();

const getMultiSignMock = jest.fn().mockResolvedValue({
  sender: {
    label: "CF Credential Issuance",
  },
  otherConnections: connectionsFix,
});

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      basicStorage: {
        deleteById: jest.fn(() => Promise.resolve()),
      },
      multiSigs: {
        getMultisigIcpDetails: () => getMultiSignMock(),
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
    connections: [],
  },
  identifiersCache: {
    identifiers: filteredIdentifierFix,
  },
  notificationsCache: {
    notifications: notificationsFix,
  },
};

describe("Notification Detail", () => {
  test("render credential receiver request", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();
    const path = `${TabsRoutePath.NOTIFICATIONS}/${notificationsFix[0].id}`;
    history.push(path, notificationsFix[0]);

    const { getByText } = render(
      <IonReactMemoryRouter
        initialEntries={[path]}
        history={history}
      >
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.NOTIFICATION_DETAILS}
            component={NotificationDetails}
          />
        </Provider>
      </IonReactMemoryRouter>
    );
    expect(
      getByText(EN_TRANSLATIONS.notifications.details.credential.receive.title)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.notifications.details.buttons.close)
    ).toBeVisible();
  });

  test("render mutil-sign request", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();
    const path = `${TabsRoutePath.NOTIFICATIONS}/${notificationsFix[3].id}`;
    history.push(path, notificationsFix[3]);

    const { getByText } = render(
      <IonReactMemoryRouter
        initialEntries={[path]}
        history={history}
      >
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.NOTIFICATION_DETAILS}
            component={NotificationDetails}
          />
        </Provider>
      </IonReactMemoryRouter>
    );
    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.notifications.details.identifier.title)
      ).toBeVisible();
    });
  });
});
