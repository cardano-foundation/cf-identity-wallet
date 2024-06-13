import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { Notifications } from "./Notifications";
import { store } from "../../../store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

describe("Notifications Tab", () => {
  test("Renders Notifications Tab", () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Notifications />
      </Provider>
    );

    expect(getByTestId("notifications-tab")).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.notifications.tab.header)
    ).toBeInTheDocument();
  });
});
