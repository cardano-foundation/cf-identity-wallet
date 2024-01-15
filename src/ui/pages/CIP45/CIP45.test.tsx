import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { CIP45 } from "./CIP45";
import { store } from "../../../store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

describe("CIP45 Tab", () => {
  test("Renders CIP45 Tab", () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <CIP45 />
      </Provider>
    );

    expect(getByTestId("CIP45-tab")).toBeInTheDocument();
    expect(getByText(EN_TRANSLATIONS.cip45.tab.title)).toBeInTheDocument();
  });
});
