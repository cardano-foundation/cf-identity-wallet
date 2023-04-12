import { render, screen } from "@testing-library/react";
import { ionFireEvent as fireEvent } from "@ionic/react-test-utils";
import { validateMnemonic } from "bip39";
import { GenerateSeedPhrase } from "./GenerateSeedPhrase";
import {
  FIFTEEN_WORDS_BIT_LENGTH,
  TWENTYFOUR_WORDS_BIT_LENGTH,
} from "../../../constants/appConstants";

describe("Generate Seed Phrase screen", () => {
  test("User can see Title and Overlay", () => {
    render(<GenerateSeedPhrase />);

    const title = screen.getByText(/Generate Seed Phrase/i);
    const overlay = screen.getByTestId("seed-phrase-overlay");

    expect(title).toBeInTheDocument();
    expect(overlay).toBeInTheDocument();
  });

  test("User can dismiss the Overlay", () => {
    render(<GenerateSeedPhrase />);

    const overlay = screen.getByTestId("seed-phrase-overlay");
    const overlayButton = screen.getByTestId("seed-phrase-overlay-button");

    expect(overlay).toHaveClass("visible");

    fireEvent.click(overlayButton);
    expect(overlay).toHaveClass("hidden");
  });

  test("User can toggle the segment", () => {
    render(<GenerateSeedPhrase />);

    const segment = screen.getByTestId("mnemonic-length-segment");
    const seedPhraseContainer = screen.getByTestId("seed-phrase-container");

    expect(segment).toHaveValue(String(FIFTEEN_WORDS_BIT_LENGTH));
    expect(seedPhraseContainer.childNodes.length).toBe(15);

    fireEvent.ionChange(segment, String(TWENTYFOUR_WORDS_BIT_LENGTH));
    expect(segment).toHaveValue(String(TWENTYFOUR_WORDS_BIT_LENGTH));
    expect(seedPhraseContainer.childNodes.length).toBe(24);

    const seedPhrase256 = [];
    for (let i = 0, len = seedPhraseContainer.childNodes.length; i < len; i++) {
      seedPhrase256.push(
        seedPhraseContainer.childNodes[i].childNodes[1].textContent
      );
    }

    expect(
      validateMnemonic(seedPhrase256.toString().split(",").join(" "))
    ).toBe(true);

    fireEvent.ionChange(segment, String(FIFTEEN_WORDS_BIT_LENGTH));
    expect(segment).toHaveValue(String(FIFTEEN_WORDS_BIT_LENGTH));
    expect(seedPhraseContainer.childNodes.length).toBe(15);

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
});
