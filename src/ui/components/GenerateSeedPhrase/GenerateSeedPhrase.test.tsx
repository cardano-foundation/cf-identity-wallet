import { render, screen } from "@testing-library/react";
import { ionFireEvent as fireEvent } from "@ionic/react-test-utils";
import { validateMnemonic, generateMnemonic } from "bip39";
import GenerateSeedPhrase from "./GenerateSeedPhrase";

test("User can see Title and Overlay", () => {
  render(<GenerateSeedPhrase />);

  const title = screen.getByText(/Generate Seed Phrase/i);
  const overlay = screen.getByTestId("overlay");

  expect(title).toBeInTheDocument();
  expect(overlay).toBeInTheDocument();
});

test("User can dismiss the Overlay", () => {
  render(<GenerateSeedPhrase />);

  const overlay = screen.getByTestId("overlay");
  const overlayButton = screen.getByTestId("overlay-button");

  expect(overlay).toHaveClass("visible");

  fireEvent.click(overlayButton);
  expect(overlay).toHaveClass("hidden");
});

test("User can toggle the segment", () => {
  render(<GenerateSeedPhrase />);

  const segment = screen.getByTestId("segment");
  const seedPhraseContainer = screen.getByTestId("seed-phrase-container");

  expect(segment).toHaveValue("160");
  expect(seedPhraseContainer.childNodes.length).toBe(15);

  fireEvent.ionChange(segment, "256");
  expect(segment).toHaveValue("256");
  expect(seedPhraseContainer.childNodes.length).toBe(24);

  const seedPhrase256 = [];
  for (let i = 0, len = seedPhraseContainer.childNodes.length; i < len; i++) {
    seedPhrase256.push(
      seedPhraseContainer.childNodes[i].childNodes[1].textContent
    );
  }

  expect(validateMnemonic(seedPhrase256.toString().split(",").join(" "))).toBe(
    true
  );

  fireEvent.ionChange(segment, "160");
  expect(segment).toHaveValue("160");
  expect(seedPhraseContainer.childNodes.length).toBe(15);

  const seedPhrase160 = [];
  for (let i = 0, len = seedPhraseContainer.childNodes.length; i < len; i++) {
    seedPhrase160.push(
      seedPhraseContainer.childNodes[i].childNodes[1].textContent
    );
  }

  expect(validateMnemonic(seedPhrase160.toString().split(",").join(" "))).toBe(
    true
  );
});
