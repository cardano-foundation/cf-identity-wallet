import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { Crypto } from "./Crypto";
import { store } from "../../../store";

describe("Crypto Tab", () => {
  test("Renders Crypto Tab", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Crypto />
      </Provider>
    );

    expect(getByTestId("crypto-tab")).toBeInTheDocument();
    expect(getByText("Crypto")).toBeInTheDocument();
  });
});
