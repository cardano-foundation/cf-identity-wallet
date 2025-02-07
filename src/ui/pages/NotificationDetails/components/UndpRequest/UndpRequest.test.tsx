import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../routes/paths";
import { connectionsForNotifications } from "../../../../__fixtures__/connectionsFix";
import { filteredIdentifierMapFix } from "../../../../__fixtures__/filteredIdentifierFix";
import { notificationsFix } from "../../../../__fixtures__/notificationsFix";
import { UndpRequest } from "./UndpRequest";

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
  credsCache: {
    creds: [],
  },
  connectionsCache: {
    connections: connectionsForNotifications,
  },
  notificationsCache: {
    notifications: notificationsFix,
  },
  identifiersCache: {
    identifiers: filteredIdentifierMapFix,
  },
};

describe("Receive credential", () => {
  global.ResizeObserver = class {
    observe() {
      jest.fn();
    }
    unobserve() {
      jest.fn();
    }
    disconnect() {
      jest.fn();
    }
  };
  test("Render and decline", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getAllByText, getByText } = render(
      <Provider store={storeMocked}>
        <UndpRequest
          pageId="creadential-request"
          activeStatus
          handleBack={jest.fn()}
          notificationDetails={notificationsFix[1]}
        />
      </Provider>
    );

    expect(getAllByText(EN_TRANSLATIONS.tabs.notifications.details.undp.title)[0]).toBeVisible();
    expect(getByText(EN_TRANSLATIONS.tabs.notifications.details.undp.identifier)).toBeVisible();
    expect(getByText(EN_TRANSLATIONS.tabs.notifications.details.undp.info)).toBeVisible();
    expect(getByText(EN_TRANSLATIONS.tabs.notifications.details.undp.transaction.data)).toBeVisible();
  });
});
