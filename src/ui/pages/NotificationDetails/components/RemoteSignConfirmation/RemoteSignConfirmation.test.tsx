import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { legacy_createStore as createStore } from "redux";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { RemoteSignConfirmation } from "./RemoteSignConfirmation";

const mockStore = (initialState: any) => createStore(() => initialState);
const dispatchMock = jest.fn();

const initialState = {
  stateCache: {
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
};

describe("RemoteSignConfirmation", () => {
  test("renders the component with correct title, subtitle, and description", () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const mockNotificationDetails = {
      id: "123",
      createdAt: new Date().toISOString(),
      a: {},
      connectionId: "connection-456",
      read: false,
      groupReplied: false,
    };

    render(
      <Provider store={storeMocked}>
        <RemoteSignConfirmation
          pageId="sign-confirmation"
          activeStatus
          handleBack={jest.fn()}
          notificationDetails={mockNotificationDetails}
        />
      </Provider>
    );

    const certificate = "Certificate";
    const connection = "Connection Name";

    expect(
      screen.getByText(
        EN_TRANSLATIONS.tabs.notifications.details.signconfirmation.title
      )
    ).toBeVisible();

    expect(
      screen.getByText(
        EN_TRANSLATIONS.tabs.notifications.details.signconfirmation.subtitle
          .replace("{{certificate}}", certificate)
          .replace("{{connection}}", connection)
      )
    ).toBeVisible();

    const description =
      EN_TRANSLATIONS.tabs.notifications.details.signconfirmation.description
        .replace("{{certificate}}", certificate)
        .replace("{{connection}}", connection)
        .split("\n")
        .join("");
    expect(screen.getByText(description)).toBeVisible();

    expect(
      screen.getByText(
        EN_TRANSLATIONS.tabs.notifications.details.signconfirmation.button.label.replace(
          "{{certificate}}",
          certificate.toLocaleLowerCase()
        )
      )
    ).toBeVisible();
  });

  test("calls handleBack when the close button is clicked", () => {
    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const handleBackMock = jest.fn();

    render(
      <Provider store={storeMocked}>
        <RemoteSignConfirmation
          pageId="sign-confirmation"
          activeStatus
          handleBack={handleBackMock}
          notificationDetails={{
            id: "123",
            createdAt: new Date().toISOString(),
            a: {},
            connectionId: "connection-456",
            read: false,
            groupReplied: false,
          }}
        />
      </Provider>
    );

    screen
      .getByText(EN_TRANSLATIONS.tabs.notifications.details.buttons.close)
      .click();

    expect(handleBackMock).toHaveBeenCalled();
  });
});
