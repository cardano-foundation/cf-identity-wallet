import { render, screen } from "@testing-library/react";
import { Onboarding } from "./index";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

describe("Onboarding Page", () => {
  test("Render slide 1", () => {
    render(<Onboarding />);
    const slide1 = screen.getByText(
      EN_TRANSLATIONS["onboarding.slides"][0].title
    );
    expect(slide1).toBeInTheDocument();
  });
  test("Render 'Get Started' button", () => {
    render(<Onboarding />);
    const button = screen.getByText(
      EN_TRANSLATIONS["onboarding.getstarted.button.label"]
    );
    expect(button).toBeInTheDocument();
  });
  test("Render 'I already have a wallet' option", () => {
    render(<Onboarding />);
    const alreadyWallet = screen.getByText(
      EN_TRANSLATIONS["onboarding.alreadywallet.button.label"]
    );
    expect(alreadyWallet).toBeInTheDocument();
  });
});
