import React from "react";
import { render, screen } from "@testing-library/react";
import { Onboarding, BUTTON_LABEL, ALREADY_WALLET_LABEL, ITEMS } from "./index";

describe("Onboarding Page", () => {
  test("Render slide 1", () => {
    render(<Onboarding />);
    const slide1 = screen.getByText(ITEMS[0].title);
    expect(slide1).toBeInTheDocument();
  });
  test("Render 'Get Started' button", () => {
    render(<Onboarding />);
    const button = screen.getByText(BUTTON_LABEL);
    expect(button).toBeInTheDocument();
  });
  test("Render 'I already have a wallet' option", () => {
    render(<Onboarding />);
    const alreadyWallet = screen.getByText(ALREADY_WALLET_LABEL);
    expect(alreadyWallet).toBeInTheDocument();
  });
});
