import React from "react";
import { render, screen } from "@testing-library/react";

import { Slides } from "./index";

const slides = [
  {
    title: "Welcome to your Cardano Foundation Identity Wallet",
    description:
        "A secure and easy-to-use tool that allows you to manage your digital identity and control your personal data",
    image: "https://placehold.co/290x290",
  }
];

test("renders Onboarding page", () => {
  render(<Slides slides={slides} />);
  const linkElement = screen.getByText(
    /Welcome to your Cardano Foundation Identity Wallet/i
  );
  expect(linkElement).toBeInTheDocument();
});
