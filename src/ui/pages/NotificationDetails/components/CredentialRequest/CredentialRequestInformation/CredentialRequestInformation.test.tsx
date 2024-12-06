import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mockIonicReact } from "@ionic/react-test-utils";
import { act } from "react";
import { TabsRoutePath } from "../../../../../../routes/paths";
import { CredentialRequestInformation } from "./CredentialRequestInformation";
import { notificationsFix } from "../../../../../__fixtures__/notificationsFix";
import { connectionsForNotifications } from "../../../../../__fixtures__/connectionsFix";
import EN_TRANSLATIONS from "../../../../../../locales/en/en.json";
import { credRequestFix } from "../../../../../__fixtures__/credRequestFix";

mockIonicReact();

const deleteNotificationMock = jest.fn((id: string) => Promise.resolve(id));

jest.mock("../../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      keriaNotifications: {
        deleteNotificationRecordById: (id: string) =>
          deleteNotificationMock(id),
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

describe("Credential request information", () => {
  test("Render and decline", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <CredentialRequestInformation
          pageId="multi-sign"
          activeStatus
          onBack={jest.fn()}
          onAccept={jest.fn()}
          notificationDetails={notificationsFix[4]}
          credentialRequest={credRequestFix}
          linkedGroup={null}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .information.title
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("secondary-button-multi-sign"));
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.tabs.notifications.details.credential.request
            .information.alert.textdecline
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
});
