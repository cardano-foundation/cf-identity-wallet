import { mockIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../routes/paths";
import { setNotificationsCache } from "../../../../../store/reducers/notificationsCache";
import { connectionsForNotifications } from "../../../../__fixtures__/connectionsFix";
import { filteredIdentifierFix } from "../../../../__fixtures__/filteredIdentifierFix";
import { notificationsFix } from "../../../../__fixtures__/notificationsFix";
import { ReceiveCredentialMultisig } from "./ReceiveCredentialMultisig";

mockIonicReact();

const deleteNotificationMock = jest.fn((id: string) => Promise.resolve(id));
const acceptAcdcMock = jest.fn((id: string) => Promise.resolve(id));

jest.mock("../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      signifyNotifications: {
        deleteNotificationRecordById: (id: string) =>
          deleteNotificationMock(id),
      },
      ipexCommunications: {
        acceptAcdc: (id: string) => acceptAcdcMock(id),
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

  identifiersCache: {
    identifiers: filteredIdentifierFix,
  },
};

describe("Credential request from multisig exn", () => {
  test("Render and decline", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <ReceiveCredentialMultisig
          pageId="creadential-request"
          activeStatus
          handleBack={jest.fn()}
          notificationDetails={notificationsFix[0]}
        />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.notifications.details.credential.receive.title)
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("secondary-button-creadential-request"));
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.notifications.details.identifier.alert.textdecline
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByTestId("multisig-request-alert-decline-confirm-button")
      );
    });

    await waitFor(() => {
      expect(deleteNotificationMock).toBeCalled();
    });
  });

  test("Accept", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const backMock = jest.fn();
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <ReceiveCredentialMultisig
          pageId="creadential-request"
          activeStatus
          handleBack={backMock}
          notificationDetails={notificationsFix[0]}
        />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.notifications.details.credential.receive.title)
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("primary-button-creadential-request"));
    });

    await waitFor(() => {
      expect(acceptAcdcMock).toBeCalledWith(notificationsFix[0].id);
    });

    const newNotification = notificationsFix.filter(
      (notification) => notification.id !== notificationsFix[0].id
    );

    expect(dispatchMock).lastCalledWith(setNotificationsCache(newNotification));
  });
});
