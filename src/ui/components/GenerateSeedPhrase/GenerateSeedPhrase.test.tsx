import React from "react";
import { newSpecPage } from "@stencil/core/testing";
import { render, screen } from "@testing-library/react";
import GenerateSeedPhrase from "./GenerateSeedPhrase";

test("renders Home page", () => {
  render(<GenerateSeedPhrase />);
  const title = screen.getByText(/Generate Seed Phrase/i);
  expect(title).toBeInTheDocument();
});
