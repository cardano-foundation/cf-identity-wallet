import { act, render, screen } from "@testing-library/react";
import {
  ionFireEvent as fireEvent,
  waitForIonicReact,
} from "@ionic/react-test-utils";
import { validateMnemonic } from "bip39";
import { GenerateSeedPhrase } from "./GenerateSeedPhrase";
import {
  MNEMONIC_FIFTEEN_WORDS,
  MNEMONIC_TWENTYFOUR_WORDS,
  FIFTEEN_WORDS_BIT_LENGTH,
  TWENTYFOUR_WORDS_BIT_LENGTH,
} from "../../../constants/appConstants";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

describe("Generate Seed Phrase screen", () => {
  test("User can see Title and Security Overlay", () => {
    render(<GenerateSeedPhrase />);

    const title = screen.getByText(EN_TRANSLATIONS["generateseedphrase.title"]);
    const overlay = screen.getByTestId("seed-phrase-privacy-overlay");

    expect(title).toBeInTheDocument();
    expect(overlay).toBeInTheDocument();
  });

  test("User can dismiss the Security Overlay", () => {
    render(<GenerateSeedPhrase />);

    const overlay = screen.getByTestId("seed-phrase-privacy-overlay");
    const revealSeedPhraseButton = screen.getByTestId(
      "reveal-seed-phrase-button"
    );

    expect(overlay).toHaveClass("visible");

    fireEvent.click(revealSeedPhraseButton);
    expect(overlay).toHaveClass("hidden");
  });

  test("User can toggle the 15/24 words seed phrase segment", () => {
    render(<GenerateSeedPhrase />);

    const segment = screen.getByTestId("mnemonic-length-segment");
    const seedPhraseContainer = screen.getByTestId("seed-phrase-container");

    // When the page is first loaded, the seed phrase length is 15 words
    expect(segment).toHaveValue(String(FIFTEEN_WORDS_BIT_LENGTH));
    expect(seedPhraseContainer.childNodes.length).toBe(MNEMONIC_FIFTEEN_WORDS);

    // When we toggle the seed phrase length it becomes 24 words
    fireEvent.ionChange(segment, String(TWENTYFOUR_WORDS_BIT_LENGTH));
    expect(segment).toHaveValue(String(TWENTYFOUR_WORDS_BIT_LENGTH));
    expect(seedPhraseContainer.childNodes.length).toBe(
      MNEMONIC_TWENTYFOUR_WORDS
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
    fireEvent.ionChange(segment, String(FIFTEEN_WORDS_BIT_LENGTH));
    expect(segment).toHaveValue(String(FIFTEEN_WORDS_BIT_LENGTH));
    expect(seedPhraseContainer.childNodes.length).toBe(MNEMONIC_FIFTEEN_WORDS);

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
    render(<GenerateSeedPhrase />);

    const revealSeedPhraseButton = screen.getByTestId(
      "reveal-seed-phrase-button"
    );
    const continueButton = screen.getByTestId(
      "generate-seed-phrase-continue-button"
    );
    const alertWrapper = screen.getByTestId("alert-wrapper");

    // When we load the page, the alert is not visible
    expect(alertWrapper).toHaveClass("alert-invisible");

    // ...and the continue button is disabled
    expect(continueButton).toBeDisabled;

    // When we reveal the seed phrase...
    act(() => {
      fireEvent.click(revealSeedPhraseButton);
    });
    await waitForIonicReact();
    // ...the continue button is no longer disabled
    expect(continueButton).not.toBeDisabled;

    // When we click on the continue button...
    act(() => {
      fireEvent.click(continueButton);
    });
    await waitForIonicReact();

    // ...the alert wrapper is visible...
    expect(alertWrapper).toHaveClass("alert-visible");
    const alertTitle = screen.getByText(
      EN_TRANSLATIONS["generateseedphrase.alert.text"]
    );
    // ...and we see the title.
    expect(alertTitle).toBeVisible();
  });

  test("Clicking on first alert button will dismiss it", async () => {
    render(<GenerateSeedPhrase />);

    const revealSeedPhraseButton = screen.getByTestId(
      "reveal-seed-phrase-button"
    );
    const continueButton = screen.getByTestId(
      "generate-seed-phrase-continue-button"
    );
    const alertWrapper = screen.getByTestId("alert-wrapper");

    // When we reveal the seed phrase...
    fireEvent.click(revealSeedPhraseButton);

    // ...and we click on the continue button...
    act(() => {
      fireEvent.click(continueButton);
    });
    await waitForIonicReact();

    // ...and we click on the first button...
    fireEvent.click(
      screen.getByText(
        EN_TRANSLATIONS["generateseedphrase.alert.button.confirm"]
      )
    );
    await waitForIonicReact();

    // ...the alert is no longer visible
    expect(alertWrapper).toHaveClass("alert-invisible");
  });

  test("Clicking on second alert button will dismiss it", async () => {
    render(<GenerateSeedPhrase />);

    const revealSeedPhraseButton = screen.getByTestId(
      "reveal-seed-phrase-button"
    );
    const continueButton = screen.getByTestId(
      "generate-seed-phrase-continue-button"
    );
    const alertWrapper = screen.getByTestId("alert-wrapper");

    // When we reveal the seed phrase...
    fireEvent.click(revealSeedPhraseButton);

    // ...and we click on the continue button...
    act(() => {
      fireEvent.click(continueButton);
    });
    await waitForIonicReact();

    // ...and we click on the second button...
    fireEvent.click(
      screen.getByText(
        EN_TRANSLATIONS["generateseedphrase.alert.button.cancel"]
      )
    );
    await waitForIonicReact();

    // ...the alert is no longer visible
    expect(alertWrapper).toHaveClass("alert-invisible");
  });

  test("Clicking on alert backdrop will dismiss it", async () => {
    render(<GenerateSeedPhrase />);

    const revealSeedPhraseButton = screen.getByTestId(
      "reveal-seed-phrase-button"
    );
    const continueButton = screen.getByTestId(
      "generate-seed-phrase-continue-button"
    );

    // When we reveal the seed phrase...
    fireEvent.click(revealSeedPhraseButton);

    // ...and we click on the continue button...
    act(() => {
      fireEvent.click(continueButton);
    });
    await waitForIonicReact();

    const backdrop = document.querySelector("ion-backdrop");
    const alertWrapper = screen.getByTestId("alert-wrapper");

    // ...we see the alert backdrop
    expect(backdrop).toBeInTheDocument();

    // When we click on the alert backdrop...
    act(() => {
      backdrop && fireEvent.click(backdrop);
    });
    await waitForIonicReact();

    expect(backdrop).not.toBeInTheDocument();

    // ...the alert is no longer visible
    expect(alertWrapper).toHaveClass("alert-invisible");
  });
});
