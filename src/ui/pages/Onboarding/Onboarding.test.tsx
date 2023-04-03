import React from "react";
import { render, screen } from "@testing-library/react";
import Index from "./index";

test("renders Home page", () => {
  render(<Index />);
  const linkElement = screen.getByText(/Cardano Blockchain/i);
  expect(linkElement).toBeInTheDocument();
});
