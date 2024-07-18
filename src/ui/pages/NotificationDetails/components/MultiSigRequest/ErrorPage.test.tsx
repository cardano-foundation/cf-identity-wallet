import { mockIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../routes/paths";
import { setCurrentOperation } from "../../../../../store/reducers/stateCache";
import { connectionsForNotifications } from "../../../../__fixtures__/connectionsFix";
import { filteredIdentifierFix } from "../../../../__fixtures__/filteredIdentifierFix";
import { notificationsFix } from "../../../../__fixtures__/notificationsFix";
import { OperationType } from "../../../../globals/types";
import { ErrorPage } from "./ErrorPage";

mockIonicReact();

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

describe("Multisign error feedback", () => {
  test("Render and scan", async () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <ErrorPage
          pageId="feedback"
          activeStatus
          handleBack={jest.fn()}
        />
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.notifications.details.identifier.errorpage.alerttext
      )
    ).toBeVisible();

    expect(
      getByText(
        EN_TRANSLATIONS.notifications.details.identifier.errorpage.instructions
          .title
      )
    ).toBeVisible();

    expect(
      getByText(
        EN_TRANSLATIONS.notifications.details.identifier.errorpage.instructions
          .detailtext
      )
    ).toBeVisible();

    expect(
      getByText(
        EN_TRANSLATIONS.notifications.details.identifier.errorpage.instructions
          .stepone
      )
    ).toBeVisible();

    expect(
      getByText(
        EN_TRANSLATIONS.notifications.details.identifier.errorpage.instructions
          .steptwo
      )
    ).toBeVisible();

    expect(
      getByText(
        EN_TRANSLATIONS.notifications.details.identifier.errorpage.help.title
      )
    ).toBeVisible();

    expect(
      getByText(
        EN_TRANSLATIONS.notifications.details.identifier.errorpage.help
          .detailtext
      )
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("primary-button-feedback"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setCurrentOperation(OperationType.MULTI_SIG_RECEIVER_SCAN)
      );
    });
  });
});
