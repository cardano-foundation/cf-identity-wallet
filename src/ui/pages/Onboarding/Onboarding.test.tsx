import React from "react";
import { render, screen } from "@testing-library/react";
import { Onboarding } from "./index";

test("renders Onboarding page", () => {
  render(<Onboarding />);
  const linkElement = screen.getByText(
    /Welcome to your Cardano Foundation Identity Wallet/i
  );
  expect(linkElement).toBeInTheDocument();
});
