import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { Creds } from "./Creds";
import { store } from "../../../store";

describe("Creds Tab", () => {
  test("Renders Creds Tab", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Creds />
      </Provider>
    );

    expect(getByTestId("creds-tab")).toBeInTheDocument();
    expect(getByText("Credentials")).toBeInTheDocument();
    expect(getByTestId("menu-button")).toBeInTheDocument();
  });
});
