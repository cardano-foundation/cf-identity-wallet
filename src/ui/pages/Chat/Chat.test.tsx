import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { Chat } from "./Chat";
import { store } from "../../../store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

describe("Chat Tab", () => {
  test("Renders Chat Tab", () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Chat />
      </Provider>
    );

    expect(getByTestId("chat-tab")).toBeInTheDocument();
    expect(getByText(EN_TRANSLATIONS.chat.tab.header)).toBeInTheDocument();
  });
});
