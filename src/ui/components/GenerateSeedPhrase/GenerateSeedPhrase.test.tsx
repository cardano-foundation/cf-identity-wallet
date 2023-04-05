import { fireEvent, render, screen } from "@testing-library/react";
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
  const generateSeedPhrase = jest.fn();

  expect(segment).toHaveValue("160");
  expect(seedPhraseContainer.childNodes.length).toBe(15);

  fireEvent.change(segment, { target: { value: "256" } });
  setTimeout(() => {
    expect(generateSeedPhrase).toHaveBeenCalledWidth(256);
    expect(segment).toHaveValue("256");
    expect(seedPhraseContainer.childNodes.length).toHaveValue(24);
  }, 1);

  fireEvent.change(segment, { target: { value: "160" } });
  setTimeout(() => {
    expect(generateSeedPhrase).toHaveBeenCalledWidth(160);
    expect(segment).toHaveValue("160");
    expect(seedPhraseContainer.childNodes.length).toHaveValue(15);
  }, 1);
});
