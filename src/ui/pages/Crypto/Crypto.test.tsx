import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { Crypto } from "./Crypto";
import { store } from "../../../store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

describe("Crypto Tab", () => {
  test("Renders Crypto Tab", () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Crypto />
      </Provider>
    );

    expect(getByTestId("crypto-tab")).toBeInTheDocument();
    expect(getByText(EN_TRANSLATIONS.crypto.tab.header)).toBeInTheDocument();
  });
});
