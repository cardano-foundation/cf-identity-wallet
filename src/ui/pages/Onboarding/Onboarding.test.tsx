import React from "react";
import { render, screen } from "@testing-library/react";
import { Onboarding } from "./index";

describe("Onboarding Page", () => {
  test("Renders Onboarding components", () => {
    render(<Onboarding />);
    const button = screen.getByText(/Get Started/i);
    expect(button).toBeInTheDocument();

    const alreadyWallet = screen.getByText(/I already have a wallet/i);
    expect(alreadyWallet).toBeInTheDocument();
  });
})

