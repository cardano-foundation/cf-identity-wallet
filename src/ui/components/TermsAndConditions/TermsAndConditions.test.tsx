import { render, waitFor, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { act } from "react-dom/test-utils";
import { GenerateSeedPhrase } from "../../pages/GenerateSeedPhrase";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { store } from "../../../store";

describe("Terms and conditions screen", () => {
  test("Opening Terms and conditions modal triggers the checkbox", async () => {
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

    // When the user opens the modal
    act(() => {
      fireEvent.click(termsLink);
    });

    await waitFor(() => {
      // The checkbox is ticked
      expect(termsCheckbox.hasAttribute('[checked="true"]'));
    });
  });

  test("User can close the modal clicking on the backdrop", async () => {
    const { getByText, queryByText } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );
    const termsLink = getByText(
      EN_TRANSLATIONS["generateseedphrase.termsandconditions.link"]
    );

    // When the user opens the modal
    act(() => {
      fireEvent.click(termsLink);
    });

    await waitFor(() => {
      // The modal shows up
      expect(document.querySelector("ion-modal")).toBeInTheDocument();
    });

    // When we click on the modal backdrop...
    const backdrop = document.querySelector("ion-backdrop");
    act(() => {
      backdrop && fireEvent.click(backdrop);
    });

    // ...the backdrop is no longer visible...
    await waitFor(() => {
      expect(backdrop).not.toBeInTheDocument();
    });

    // ...and the modal is no longer visible
    expect(
      queryByText(EN_TRANSLATIONS["termsandconditions.title"])
    ).not.toBeInTheDocument();
  });

  test("User can close the modal clicking on the close button", async () => {
    const { getByText, getByTestId, queryByText } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );
    const termsLink = getByText(
      EN_TRANSLATIONS["generateseedphrase.termsandconditions.link"]
    );

    // When the user opens the modal..
    act(() => {
      fireEvent.click(termsLink);
    });

    await waitFor(() => {
      // ...the close button is visible
      expect(getByTestId("close-button")).toBeVisible();
    });

    // When we click on the close button...
    act(() => {
      fireEvent.click(getByTestId("close-button"));
    });

    // ...the modal is no longer visible
    await waitFor(() => {
      expect(
        queryByText(EN_TRANSLATIONS["termsandconditions.title"])
      ).not.toBeInTheDocument();
    });
  });
});
