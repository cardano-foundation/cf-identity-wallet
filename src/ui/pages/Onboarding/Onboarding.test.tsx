import React from "react";
import { render, screen } from "@testing-library/react";
import {buttonLabel, alreadyWalletLabel, Onboarding} from "./index";

describe("Onboarding Page", () => {
  test("Renders Onboarding components", () => {
    render(<Onboarding />);
    const button = screen.getByText(buttonLabel);
    expect(button).toBeInTheDocument();

    const alreadyWallet = screen.getByText(alreadyWalletLabel);
    expect(alreadyWallet).toBeInTheDocument();
  });
})

