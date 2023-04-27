import {
  fireEvent,
  render,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { Onboarding } from "./index";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { GenerateSeedPhrase } from "../GenerateSeedPhrase";
import { SetPasscode } from "../SetPasscode";
import {
  GENERATE_SEED_PHRASE_ROUTE,
  SET_PASSCODE_ROUTE,
  ONBOARDING_ROUTE,
} from "../../../routes";

describe("Onboarding Page", () => {
  test("Render slide 1", () => {
    const { getByText } = render(<Onboarding storedPasscode="" />);
    const slide1 = getByText(EN_TRANSLATIONS["onboarding.slides"][0].title);
    expect(slide1).toBeInTheDocument();
  });
  test("Render 'Get Started' button", () => {
    const { getByText } = render(<Onboarding storedPasscode="" />);
    const button = getByText(
      EN_TRANSLATIONS["onboarding.getstarted.button.label"]
    );
    expect(button).toBeInTheDocument();
  });
  test("Render 'I already have a wallet' option", () => {
    const { getByText } = render(<Onboarding storedPasscode="" />);
    const alreadyWallet = getByText(
      EN_TRANSLATIONS["onboarding.alreadywallet.button.label"]
    );
    expect(alreadyWallet).toBeInTheDocument();
  });
});
