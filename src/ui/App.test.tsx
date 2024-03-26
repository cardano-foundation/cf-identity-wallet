import { render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { App } from "./App";
import { TabsRoutePath } from "../routes/paths";
import { store } from "../store";
import { Identifiers } from "./pages/Identifiers";

jest.mock("../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      start: jest.fn(),
      identifiers: {
        getIdentifiers: jest.fn().mockResolvedValue([]),
        syncKeriaIdentifiers: jest.fn(),
        getUnhandledMultisigIdentifiers: jest.fn(),
      },
      connections: {
        getConnections: jest.fn().mockResolvedValue([]),
        onConnectionStateChanged: jest.fn(),
        getConnectionShortDetails: jest.fn(),
        isConnectionRequestSent: jest.fn(),
        isConnectionResponseReceived: jest.fn(),
        isConnectionRequestReceived: jest.fn(),
        isConnectionResponseSent: jest.fn(),
        isConnectionConnected: jest.fn(),
        getConnectionShortDetailById: jest.fn(),
        getUnhandledConnections: jest.fn(),
        onConnectionKeriStateChanged: jest.fn(),
        syncKeriaContacts: jest.fn(),
      },
      credentials: {
        getCredentials: jest.fn().mockResolvedValue([]),
        onCredentialStateChanged: jest.fn(),
        isCredentialOfferReceived: jest.fn(),
        isCredentialRequestSent: jest.fn(),
        createMetadata: jest.fn(),
        isCredentialDone: jest.fn(),
        updateMetadataCompleted: jest.fn(),
        getUnhandledCredentials: jest.fn(),
        onAcdcKeriStateChanged: jest.fn(),
        syncACDCs: jest.fn(),
      },
      messages: {
        onBasicMessageStateChanged: jest.fn(),
        pickupMessagesFromMediator: jest.fn(),
      },
      signifyNotifications: {
        onNotificationKeriStateChanged: jest.fn(),
      },
    },
  },
}));

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    set: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();
const initialState = {
  stateCache: {
    routes: [TabsRoutePath.IDENTIFIERS],
    authentication: {
      loggedIn: true,
      userName: "",
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
  connectionsCache: {
    connections: [],
  },
  identifiersCache: {
    identifiers: [],
    favourites: [],
  },
};

const storeMocked = {
  ...mockStore(initialState),
  dispatch: dispatchMock,
};

describe("App", () => {
  test("Mobile header hidden when app not in preview mode", async () => {
    const { queryByTestId } = render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    await waitFor(() => {
      expect(queryByTestId("mobile-preview-header")).not.toBeInTheDocument();
    });
  });

  test.skip("It renders SetUserName modal", async () => {
    const { queryByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[TabsRoutePath.IDENTIFIERS]}>
          <Route
            path={TabsRoutePath.IDENTIFIERS}
            component={Identifiers}
          />
        </MemoryRouter>
      </Provider>
    );
    await waitFor(() => {
      expect(queryByTestId("set-user-name")).toBeInTheDocument();
    });
  });
});
