import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { Scan } from "./Scan";
import { store } from "../../../store";

describe("Scan Tab", () => {
  test("Renders Scan Tab", () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Scan />
      </Provider>
    );

    expect(getByTestId("scan-tab")).toBeInTheDocument();
  });
});
