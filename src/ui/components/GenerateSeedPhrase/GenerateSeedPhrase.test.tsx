import { render, screen } from "@testing-library/react";
import GenerateSeedPhrase from "./GenerateSeedPhrase";

test("renders Generate Seed Phrase component", () => {
  render(<GenerateSeedPhrase />);
  const title = screen.getByText(/Generate Seed Phrase/i);
  expect(title).toBeInTheDocument();
});
