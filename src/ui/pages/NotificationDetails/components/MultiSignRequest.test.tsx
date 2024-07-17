import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mockIonicReact } from "@ionic/react-test-utils";
import { act } from "react-dom/test-utils";
import { TabsRoutePath } from "../../../../routes/paths";
import { notificationsFix } from "../../../__fixtures__/notificationsFix";
import {
  connectionsFix,
  connectionsForNotifications,
} from "../../../__fixtures__/connectionsFix";
import EN_TRANSLATIONS from "../../../../locales/en/en.json";
import { MultiSigRequest } from "./MultiSigRequest";
import { filteredIdentifierFix } from "../../../__fixtures__/filteredIdentifierFix";
import { setNotificationsCache } from "../../../../store/reducers/notificationsCache";

mockIonicReact();

const multisigIcpDetails = {
  sender: {
    label: "CF Credential Issuance",
  },
  ourIdentifier: {
    theme: 1,
    displayName: "displayName",
  },
  otherConnections: connectionsFix,
};

const deleteNotificationMock = jest.fn((id: string) => Promise.resolve(id));
const getMultiSignMock = jest.fn().mockResolvedValue(multisigIcpDetails);
const joinMultisignMock = jest.fn((...params: unknown[]) =>
  Promise.resolve({
    identifier: "identifier-id",
    signifyName: params,
  })
);

jest.mock("../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      signifyNotifications: {
        deleteNotificationRecordById: (id: string) =>
          deleteNotificationMock(id),
      },
      multiSigs: {
        getMultisigIcpDetails: () => getMultiSignMock(),
        joinMultisig: (...params: unknown[]) => joinMultisignMock(...params),
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

describe("Multisign request", () => {
  test("Render and decline", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <MultiSigRequest
          pageId="multi-sign"
          activeStatus
          handleBack={jest.fn()}
          notificationDetails={notificationsFix[3]}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.notifications.details.identifier.title)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("secondary-button-multi-sign"));
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
        <MultiSigRequest
          pageId="multi-sign"
          activeStatus
          handleBack={backMock}
          notificationDetails={notificationsFix[3]}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.notifications.details.identifier.title)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button-multi-sign"));
    });

    await waitFor(() => {
      expect(joinMultisignMock).toBeCalledWith(
        notificationsFix[3].id,
        notificationsFix[3].a.d,
        {
          theme: multisigIcpDetails.ourIdentifier.theme,
          displayName: multisigIcpDetails.ourIdentifier.displayName,
        }
      );
    });

    const newNotification = notificationsFix.filter(
      (notification) => notification.id !== notificationsFix[3].id
    );

    expect(backMock).toBeCalled();
    expect(dispatchMock).lastCalledWith(setNotificationsCache(newNotification));
  });
});
