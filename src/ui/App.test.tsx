import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("Home page", () => {
  test("renders cardano blockchain slogan", () => {
    render(<App />);
    const linkElement = screen.getByText(/Cardano Blockchain/i);
    expect(linkElement).toBeInTheDocument();
  });
});
