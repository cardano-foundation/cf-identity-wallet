import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { Dids } from "./Dids";
import { store } from "../../../store";

describe("Dids Tab", () => {
  test("Renders Dids Tab", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Dids />
      </Provider>
    );

    expect(getByTestId("dids-tab")).toBeInTheDocument();
    expect(getByText("Identities")).toBeInTheDocument();
    expect(getByTestId("contacts-button")).toBeInTheDocument();
    expect(getByTestId("add-button")).toBeInTheDocument();
    expect(getByTestId("menu-button")).toBeInTheDocument();
  });
});
