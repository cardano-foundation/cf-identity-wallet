import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../routes/paths";
import { connectionsForNotifications } from "../../../../__fixtures__/connectionsFix";
import { filteredIdentifierMapFix } from "../../../../__fixtures__/filteredIdentifierFix";
import { notificationsFix } from "../../../../__fixtures__/notificationsFix";
import { RemoteSignRequest } from "./RemoteSignRequest";

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
    // TODO: Matching the hardcoded value in the component
    // Remember to remove this hardcoded value once the component is refactored
    const customCertificateName = "CSO Certificate";
    const { getAllByText, getByText } = render(
      <Provider store={storeMocked}>
        <RemoteSignRequest
          pageId="creadential-request"
          activeStatus
          handleBack={jest.fn()}
          notificationDetails={notificationsFix[7]}
        />
      </Provider>
    );

    expect(
      getAllByText(
        `${EN_TRANSLATIONS.tabs.notifications.details.sign.title.replace(
          "{{certificate}}",
          customCertificateName
        )}`
      )[0]
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.tabs.notifications.details.sign.identifier)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.tabs.notifications.details.sign.info)
    ).toBeVisible();
    expect(
      getByText(
        EN_TRANSLATIONS.tabs.notifications.details.sign.transaction.data
      )
    ).toBeVisible();
  });
});
