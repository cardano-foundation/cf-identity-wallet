import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { CryptoPlaceholder } from "./CryptoPlaceholder";
import { store } from "../../../store";

describe("CryptoPlaceholder Tab", () => {
  test("Renders CryptoPlaceholder Tab", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <CryptoPlaceholder />
      </Provider>
    );

    expect(getByTestId("crypto-placeholder-tab")).toBeInTheDocument();
  });
});
