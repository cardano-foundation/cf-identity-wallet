import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mockIonicReact } from "@ionic/react-test-utils";
import { Notifications } from "./Notifications";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { TabsRoutePath } from "../../../routes/paths";
import { connectionsForNotifications } from "../../__fixtures__/connectionsFix";
import { notificationsFix } from "../../__fixtures__/notificationsFix";
mockIonicReact();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      multiSigs: {
        getMultisigIcpDetails: jest
          .fn()
          .mockResolvedValue("CF Credential Issuance"),
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

describe("Notifications Tab", () => {
  test("Renders empty Notifications Tab", () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText, queryByTestId } = render(
      <Provider store={storeMocked}>
        <Notifications />
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
  test("Renders Notifications in Notifications Tab", () => {
    const storeMocked = {
      ...mockStore(fullState),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText, getAllByText } = render(
      <Provider store={storeMocked}>
        <Notifications />
      </Provider>
    );

    expect(getByTestId("notifications-tab-section-new")).toBeInTheDocument();
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
  });
});
