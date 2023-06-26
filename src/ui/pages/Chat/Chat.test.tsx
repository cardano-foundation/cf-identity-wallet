import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { Chat } from "./Chat";
import { store } from "../../../store";

describe("Chat Tab", () => {
  test("Renders Chat Tab", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Chat />
      </Provider>
    );

    expect(getByTestId("chat-tab")).toBeInTheDocument();
    expect(getByText("Chat")).toBeInTheDocument();
    expect(getByTestId("menu-button")).toBeInTheDocument();
  });
});
