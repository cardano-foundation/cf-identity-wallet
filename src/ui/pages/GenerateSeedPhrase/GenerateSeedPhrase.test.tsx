import { render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import {
  ionFireEvent as fireEvent,
  waitForIonicReact,
} from "@ionic/react-test-utils";
import { validateMnemonic } from "bip39";
import { Provider } from "react-redux";
import { GenerateSeedPhrase } from "./GenerateSeedPhrase";
import {
  MNEMONIC_FIFTEEN_WORDS,
  MNEMONIC_TWENTYFOUR_WORDS,
  FIFTEEN_WORDS_BIT_LENGTH,
  TWENTYFOUR_WORDS_BIT_LENGTH,
} from "../../../constants/appConstants";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { store } from "../../../store";

describe("Generate Seed Phrase screen", () => {
  test("User can see Title and Security Overlay", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );

    const title = getByText(EN_TRANSLATIONS["generateseedphrase.title"]);
    const overlay = getByTestId("seed-phrase-privacy-overlay");

    expect(title).toBeInTheDocument();
    expect(overlay).toBeInTheDocument();
  });

  test("User can dismiss the Security Overlay", async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );

    const overlay = getByTestId("seed-phrase-privacy-overlay");
    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");

    expect(overlay).toHaveClass("visible");

    act(() => {
      fireEvent.click(revealSeedPhraseButton);
    });
    await waitFor(() => expect(overlay).toHaveClass("hidden"));
  });

  test("User can toggle the 15/24 words seed phrase segment", async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );

    const segment = getByTestId("mnemonic-length-segment");
    const seedPhraseContainer = getByTestId("seed-phrase-container");

    // When the page is first loaded, the seed phrase length is 15 words
    expect(segment).toHaveValue(String(FIFTEEN_WORDS_BIT_LENGTH));
    expect(seedPhraseContainer.childNodes.length).toBe(MNEMONIC_FIFTEEN_WORDS);

    // When we toggle the seed phrase length it becomes 24 words
    act(() => {
      fireEvent.ionChange(segment, String(TWENTYFOUR_WORDS_BIT_LENGTH));
    });
    await waitFor(() =>
      expect(segment).toHaveValue(String(TWENTYFOUR_WORDS_BIT_LENGTH))
    );
    await waitFor(() =>
      expect(seedPhraseContainer.childNodes.length).toBe(
        MNEMONIC_TWENTYFOUR_WORDS
      )
    );

    // Scrape the screen to get the seed phrase into an array
    const seedPhrase256 = [];
    for (let i = 0, len = seedPhraseContainer.childNodes.length; i < len; i++) {
      seedPhrase256.push(
        seedPhraseContainer.childNodes[i].childNodes[1].textContent
      );
    }

    // Use bip39 method to validate the seedphrase
    expect(
      validateMnemonic(seedPhrase256.toString().split(",").join(" "))
    ).toBe(true);

    // Do the same scrape and validation for a 15 words seed phrase
    act(() => {
      fireEvent.ionChange(segment, String(FIFTEEN_WORDS_BIT_LENGTH));
    });
    await waitFor(() =>
      expect(segment).toHaveValue(String(FIFTEEN_WORDS_BIT_LENGTH))
    );
    await waitFor(() =>
      expect(seedPhraseContainer.childNodes.length).toBe(MNEMONIC_FIFTEEN_WORDS)
    );

    const seedPhrase160 = [];
    for (let i = 0, len = seedPhraseContainer.childNodes.length; i < len; i++) {
      seedPhrase160.push(
        seedPhraseContainer.childNodes[i].childNodes[1].textContent
      );
    }

    expect(
      validateMnemonic(seedPhrase160.toString().split(",").join(" "))
    ).toBe(true);
  });

  test("User is prompted to save the seed phrase", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );

    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");
    const continueButton = getByTestId("generate-seed-phrase-continue-button");
    const alertWrapper = getByTestId("alert-wrapper");
    const termsCheckbox = getByTestId("termsandconditions-checkbox");

    // When we load the page, the alert is not visible
    expect(alertWrapper).toHaveClass("alert-invisible");

    // ...and the continue button is disabled
    expect(continueButton).toBeDisabled;

    // When we reveal the seed phrase and tick the checkbox...
    act(() => {
      fireEvent.click(revealSeedPhraseButton);
      fireEvent.change(termsCheckbox, { target: { checked: true } });
    });

    // ...the continue button is no longer disabled
    await waitFor(() => expect(continueButton).not.toBeDisabled);

    // When we click on the continue button...
    act(() => {
      fireEvent.click(continueButton);
    });
    await waitForIonicReact();

    // ...the alert wrapper is visible...
    await waitFor(() => expect(alertWrapper).toHaveClass("alert-visible"));

    const alertTitle = getByText(
      EN_TRANSLATIONS["generateseedphrase.alert.text"]
    );
    // ...and we see the title.
    await waitFor(() => expect(alertTitle).toBeVisible());
  });

  test("Clicking on second alert button will dismiss it", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );

    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");
    const continueButton = getByTestId("generate-seed-phrase-continue-button");
    const alertWrapper = getByTestId("alert-wrapper");

    // When we reveal the seed phrase...
    act(() => {
      fireEvent.click(revealSeedPhraseButton);
      // ...and we click on the continue button...
      fireEvent.click(continueButton);
    });
    await waitForIonicReact();

    // ...and we click on the second button...
    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS["generateseedphrase.alert.button.cancel"])
      );
    });

    // ...the alert is no longer visible
    await waitFor(() => expect(alertWrapper).toHaveClass("alert-invisible"));
  });

  test("Clicking on alert backdrop will dismiss it", async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );

    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");
    const continueButton = getByTestId("generate-seed-phrase-continue-button");

    // When we reveal the seed phrase...
    act(() => {
      fireEvent.click(revealSeedPhraseButton);
      // ...and we click on the continue button...
      fireEvent.click(continueButton);
    });

    // ...we see the alert backdrop
    await waitFor(() => {
      expect(getByTestId("alert-wrapper")).toBeInTheDocument();
    });

    const backdrop = document.querySelector("ion-backdrop");

    // When we click on the alert backdrop...
    act(() => {
      backdrop && fireEvent.click(backdrop);
    });

    // ...the alert is no longer visible
    await waitFor(() => {
      expect(backdrop).not.toBeInTheDocument();
    });
  });

  test("User can toggle the checkbox", async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );
    const termsCheckbox = getByTestId("termsandconditions-checkbox");
    // The checkbox is not checked by default
    expect(termsCheckbox.hasAttribute('[checked="false"]'));
    // User can toggle the checkbox
    fireEvent.click(termsCheckbox);
    expect(termsCheckbox.hasAttribute('[checked="true"]'));
    fireEvent.click(termsCheckbox);
    expect(termsCheckbox.hasAttribute('[checked="false"]'));
  });

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
});
