import { IonReactMemoryRouter } from "@ionic/react-router";
import { mockIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { act } from "react";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../routes/paths";
import { connectionsForNotifications } from "../../../../__fixtures__/connectionsFix";
import { notificationsFix } from "../../../../__fixtures__/notificationsFix";
import { CredentialRequest } from "./CredentialRequest";
import { credRequestFix } from "../../../../__fixtures__/credRequestFix";
import { credsFixAcdc } from "../../../../__fixtures__/credsFix";

mockIonicReact();

const getIpexApplyDetailsMock = jest.fn(() => Promise.resolve(credRequestFix));

jest.mock("../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      ipexCommunications: {
        getIpexApplyDetails: () => getIpexApplyDetailsMock(),
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
    connections: connectionsForNotifications,
  },
  credsCache: { creds: credsFixAcdc, favourites: [] },
  credsArchivedCache: { creds: [] },
  notificationsCache: {
    notifications: notificationsFix,
  },
};

describe("Credential request", () => {
  test("Render", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();

    const { getByText, getByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter history={history}>
          <CredentialRequest
            pageId="multi-sign"
            activeStatus
            handleBack={jest.fn()}
            notificationDetails={notificationsFix[4]}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    expect(getByTestId("cre-request-spinner-container")).toBeVisible();

    await waitFor(() => {
      expect(queryByTestId("cre-request-spinner-container")).toBe(null);

      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request.information
            .title
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-multi-sign"));
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request
            .choosecredential.title
        )
      ).toBeVisible();
    });
  });

  test("Alert when credential is empty", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const history = createMemoryHistory();

    getIpexApplyDetailsMock.mockImplementation(() =>
      Promise.resolve({
        ...credRequestFix,
        credentials: [],
      })
    );

    const { getByText, getByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter history={history}>
          <CredentialRequest
            pageId="notification-details"
            activeStatus
            handleBack={jest.fn()}
            notificationDetails={notificationsFix[4]}
          />
        </IonReactMemoryRouter>
      </Provider>
    );

    expect(getByTestId("cre-request-spinner-container")).toBeVisible();

    await waitFor(() => {
      expect(queryByTestId("cre-request-spinner-container")).toBe(null);

      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request.information
            .title
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-notification-details"));
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.credential.request.alert.text
        )
      ).toBeVisible();
    });
  });
});
