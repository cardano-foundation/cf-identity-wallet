import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders cardano blockchain slogan", () => {
  render(<App />);
  const linkElement = screen.getByText(/Cardano Blockchain/i);
  expect(linkElement).toBeInTheDocument();
});
