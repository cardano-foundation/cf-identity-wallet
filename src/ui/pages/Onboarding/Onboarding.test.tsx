import React from "react";
import { render, screen } from "@testing-library/react";
import Index from "./index";

test("renders Home page", () => {
  render(<Index />);
  const linkElement = screen.getByText(/Get Started/i);
  expect(linkElement).toBeInTheDocument();
});
