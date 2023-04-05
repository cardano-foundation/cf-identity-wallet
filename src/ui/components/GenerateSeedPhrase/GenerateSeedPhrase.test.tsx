import { fireEvent, render, screen } from "@testing-library/react";
import GenerateSeedPhrase from "./GenerateSeedPhrase";

test("It renders Title and Overlay", () => {
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
  const toggleLength = jest.fn();
  const generateSeedPhrase = jest.fn();

  expect(segment).toHaveValue("160");
  expect(seedPhraseContainer.childNodes.length).toBe(15);

  fireEvent.change(segment, { target: { value: "256" } });
  setTimeout(() => {
    expect(toggleLength.mock.calls[0][0].detail).toStrictEqual("256");
    expect(generateSeedPhrase).toHaveBeenCalledWidth(256);
    expect(segment).toHaveValue("256");
    expect(seedPhraseContainer.childNodes.length).toHaveValue(24);
  }, 1);

  fireEvent.change(segment, { target: { value: "160" } });
  setTimeout(() => {
    expect(toggleLength.mock.calls[0][0].detail).toStrictEqual("160");
    expect(generateSeedPhrase).toHaveBeenCalledWidth(160);
    expect(segment).toHaveValue("160");
    expect(seedPhraseContainer.childNodes.length).toHaveValue(15);
  }, 1);
});
