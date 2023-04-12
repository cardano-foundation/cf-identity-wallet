import React from "react";
import { render, screen } from "@testing-library/react";
import { Onboarding, buttonLabel, alreadyWalletLabel, items } from "./index";

describe("Onboarding Page", () => {
  test("Render slide 1", () => {
    render(<Onboarding />);
    const slide1 = screen.getByText(items[0].title);
    expect(slide1).toBeInTheDocument();
  });
  test("Render 'Get Started' button", () => {
    render(<Onboarding />);
    const button = screen.getByText(buttonLabel);
    expect(button).toBeInTheDocument();
  });
  test("Render 'I already have a wallet' option", () => {
    render(<Onboarding />);
    const alreadyWallet = screen.getByText(alreadyWalletLabel);
    expect(alreadyWallet).toBeInTheDocument();
  });
});
