import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import ENG_trans from "../../../../../../../locales/en/en.json";
import { TermAndPrivacy } from "./TermAndPrivacy";
import { store } from "../../../../../../../store";

describe("Term and Privacy", () => {
  test("Render and open term modal", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <TermAndPrivacy />
      </Provider>
    );

    expect(
      getByText(
        ENG_trans.settings.sections.support.terms.submenu.termandcondition
      )
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("term-modal-btn"));
    });

    await waitFor(() => {
      expect(getByTestId("terms-of-use-modal")).toBeVisible();
    });
  });

  test("Render and open privacy modal", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <TermAndPrivacy />
      </Provider>
    );

    expect(
      getByText(
        ENG_trans.settings.sections.support.terms.submenu.termandcondition
      )
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("privacy-modal-btn"));
    });

    await waitFor(() => {
      expect(getByTestId("privacy-policy-modal")).toBeVisible();
    });
  });
});
