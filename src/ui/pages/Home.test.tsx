import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "./Home";

test("renders Home page", () => {
  render(<Home />);
  const linkElement = screen.getByText(/Cardano Blockchain/i);
  expect(linkElement).toBeInTheDocument();
});
