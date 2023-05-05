import { render, waitFor, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { act } from "react-dom/test-utils";
import { GenerateSeedPhrase } from "../../pages/GenerateSeedPhrase";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { store } from "../../../store";

describe("Terms and conditions screen", () => {
  test("User can see Terms and conditions checkbox and label", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );
    const termsCheckbox = getByTestId("termsandconditions-checkbox");
    const termsText = getByTestId("termsandconditions-label");
    const termsLink = getByText(
      EN_TRANSLATIONS["generateseedphrase.termsandconditions.link"]
    );
    expect(termsCheckbox).toBeInTheDocument();
    expect(termsText).toContainHTML(
      EN_TRANSLATIONS["generateseedphrase.termsandconditions.text"].substring(
        0,
        20
      )
    );
    expect(termsLink).toBeVisible();
  });

  test("User can open/close Terms and conditions and trigger checkbox", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );
    const termsCheckbox = getByTestId("termsandconditions-checkbox");
    const termsLink = getByText(
      EN_TRANSLATIONS["generateseedphrase.termsandconditions.link"]
    );

    // The checkbox is not checked by default
    expect(termsCheckbox.hasAttribute('[checked="false"]'));

    // When the user clicks on the link
    act(() => {
      fireEvent.click(termsLink);
    });

    await waitFor(() => {
      // The checkbox is ticked
      expect(termsCheckbox.hasAttribute('[checked="true"]'));
      // And the modal shows up
      expect(document.querySelector("ion-modal")).toBeInTheDocument();
      // And the close button is visible
      expect(getByTestId("close-button")).toBeVisible();
    });

    // When we click on the modal backdrop...
    const backdrop = document.querySelector("ion-backdrop");
    act(() => {
      backdrop && fireEvent.click(backdrop);
    });

    // ...the modal is no longer visible
    await waitFor(() => {
      expect(document.querySelector("ion-modal")).toBeInTheDocument();
    });
  });
});
