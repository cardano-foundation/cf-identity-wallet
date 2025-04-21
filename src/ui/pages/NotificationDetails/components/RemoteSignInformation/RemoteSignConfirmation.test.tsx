import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { legacy_createStore as createStore } from "redux";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { RemoteSignInformation } from "./RemoteSignInformation";

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

describe("RemoteSignInformation", () => {
  test("Render", () => {
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
        <RemoteSignInformation
          pageId="sign-confirmation"
          activeStatus
          handleBack={jest.fn()}
          notificationDetails={mockNotificationDetails}
        />
      </Provider>
    );

    const certificate = "Certificate";

    expect(
      screen.getByText(
        EN_TRANSLATIONS.tabs.notifications.details.signinformation.title
      )
    ).toBeVisible();

    expect(
      screen.getByText(
        EN_TRANSLATIONS.tabs.notifications.details.signinformation.subtitle.replace(
          "{{certificate}}",
          certificate
        )
      )
    ).toBeVisible();

    const description =
      EN_TRANSLATIONS.tabs.notifications.details.signinformation.description.paragraphone
        .replace("{{certificate}}", certificate)
        .split("\n")
        .join("");

    expect(screen.getByText(description)).toBeVisible();
    expect(
      screen.getByText(
        EN_TRANSLATIONS.tabs.notifications.details.signinformation.description
          .paragraphtwo
      )
    ).toBeVisible();
    expect(
      screen.getByText(
        EN_TRANSLATIONS.tabs.notifications.details.signinformation.description
          .paragraphthree
      )
    ).toBeVisible();
  });
});
