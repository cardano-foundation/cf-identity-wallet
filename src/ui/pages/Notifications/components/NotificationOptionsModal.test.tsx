import { AnyAction, Store } from "@reduxjs/toolkit";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { ReactNode, act } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { KeriaNotification } from "../../../../core/agent/agent.types";
import EN_TRANSLATIONS from "../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../routes/paths";
import {
  deleteNotificationById,
  markNotificationAsRead,
} from "../../../../store/reducers/notificationsCache";
import { NotificationOptionsModal } from "./NotificationOptionsModal";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: ReactNode }) => children,
}));

const notification: KeriaNotification = {
  id: "AL3XmFY8BM9F604qmV-l9b0YMZNvshHG7X6CveMWKMmG",
  createdAt: "2024-06-25T12:38:36.988Z",
  a: {
    r: "/exn/ipex/grant",
    d: "EMT02ZHUhpnr4gFFk104B-pLwb2bJC8aip2VYmbPztnk",
    m: "",
  },
  connectionId: "EMrT7qX0FIMenQoe5pJLahxz_rheks1uIviGW8ch8pfB",
  read: false,
  groupReplied: false,
};

const deleteNotificationMock = jest.fn();
const toggleNotificationMock = jest.fn();

describe("Notification Options modal", () => {
  const dispatchMock = jest.fn();
  let mockedStore: Store<unknown, AnyAction>;
  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: true,
        },
      },
    };
    mockedStore = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
  });

  test("render", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={mockedStore}>
        <NotificationOptionsModal
          optionsIsOpen
          setCloseModal={jest.fn}
          onShowDetail={jest.fn}
          notification={notification}
          onDeleteNotification={deleteNotificationMock}
          onToggleNotification={toggleNotificationMock}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("show-notification-detail")).toBeVisible();
    })

    expect(getByTestId("toogle-read-notification")).toBeVisible();
    expect(getByTestId("delete-notification")).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.tabs.notifications.tab.optionmodal.title)
    ).toBeVisible();
    expect(
      getByText(EN_TRANSLATIONS.tabs.notifications.tab.optionmodal.markasread)
    ).toBeVisible();
  });

  test("delete notification", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={mockedStore}>
        <NotificationOptionsModal
          optionsIsOpen
          setCloseModal={jest.fn}
          onShowDetail={jest.fn}
          notification={notification}
          onDeleteNotification={deleteNotificationMock}
          onToggleNotification={toggleNotificationMock}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("delete-notification")).toBeVisible();
    })

    act(() => {
      fireEvent.click(getByTestId("delete-notification"));
    });

    await waitFor(() => {
      expect(deleteNotificationMock).toBeCalledWith(notification);
    });
  });

  test("mask as read notification", async () => {
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <NotificationOptionsModal
          optionsIsOpen
          setCloseModal={jest.fn}
          onShowDetail={jest.fn}
          notification={notification}
          onDeleteNotification={deleteNotificationMock}
          onToggleNotification={toggleNotificationMock}
        />
      </Provider>
    );

    expect(getByTestId("toogle-read-notification")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("toogle-read-notification"));
    });

    await waitFor(() => {
      expect(toggleNotificationMock).toBeCalledWith(notification);
    });
  });

  test("mask as unread notification", async () => {
    const testNotification = {
      ...notification,
      read: true,
    };
    
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <NotificationOptionsModal
          optionsIsOpen
          setCloseModal={jest.fn}
          onShowDetail={jest.fn}
          notification={testNotification}
          onDeleteNotification={deleteNotificationMock}
          onToggleNotification={toggleNotificationMock}
        />
      </Provider>
    );

    expect(getByTestId("toogle-read-notification")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("toogle-read-notification"));
    });

    await waitFor(() => {
      expect(toggleNotificationMock).toBeCalledWith(testNotification);
    });
  });

  test("show notification detail", async () => {
    const showNotiMock = jest.fn();
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <NotificationOptionsModal
          optionsIsOpen
          setCloseModal={jest.fn}
          onShowDetail={showNotiMock}
          notification={notification}
          onDeleteNotification={deleteNotificationMock}
          onToggleNotification={toggleNotificationMock}
        />
      </Provider>
    );

    expect(getByTestId("show-notification-detail")).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("show-notification-detail"));
    });

    await waitFor(() => {
      expect(showNotiMock).toBeCalledWith(notification);
    });
  });
});
