import { MemoryRouter, Route } from "react-router-dom";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Argon2 } from "@sphereon/isomorphic-argon2";
import { Buffer } from "buffer";
import {
  SetPasscode,
  ARGON2ID_OPTIONS,
} from "./SetPasscode";
import { GenerateSeedPhrase } from "../GenerateSeedPhrase";
import { GENERATE_SEED_PHRASE_ROUTE, PASSCODE_ROUTE } from "../../../routes";
import {
  SecureStorage,
  KeyStoreKeys,
} from "../../../core/storage/secureStorage";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

const ARGON2ID_HASH = { encoded: "hashedPasscode", hex: "0xHashedPasscode" };
const argon2Spy = jest.spyOn(Argon2, "hash").mockResolvedValue(ARGON2ID_HASH);
const setKeyStoreSpy = jest.spyOn(SecureStorage, "set").mockResolvedValue();

describe("SetPasscode Page", () => {
  test("renders create passcode label when passcode is not set", () => {
    const { getByText } = render(<SetPasscode />);
    const labelElement = getByText(
      EN_TRANSLATIONS["setpasscode.enterpasscode.label"]
    );
    expect(labelElement).toBeInTheDocument();
  });

  test("renders create passcode description", () => {
    const { getByText } = render(<SetPasscode />);
    const descriptionElement = getByText(
      EN_TRANSLATIONS["setpasscode.enterpasscode.description"]
    );
    expect(descriptionElement).toBeInTheDocument();
  });
});

describe("SetPasscode input", () => {
  test("clicking on a number button adds a digit to the passcode", () => {
    const { getByText, getByTestId } = render(<SetPasscode />);
    const buttonElement = getByText(/1/);
    fireEvent.click(buttonElement);
    const circleElement = getByTestId("circle-0");
    expect(circleElement.classList).toContain("circle-fill");
  });

  test("renders re-enter passcode label and start over button when passcode is set", () => {
    const { getByText } = render(<SetPasscode />);
    const buttonElement = getByText(/1/);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    const buttonContinue = getByText(
      EN_TRANSLATIONS["setpasscode.continue.button"]
    );
    fireEvent.click(buttonContinue);
    const labelElement = getByText(
      EN_TRANSLATIONS["setpasscode.reenterpasscode.label"]
    );
    expect(labelElement).toBeInTheDocument();
    const startOverElement = getByText(
      EN_TRANSLATIONS["setpasscode.startover.label"]
    );
    expect(startOverElement).toBeInTheDocument();
  });

  test("renders enter passcode restarting the process when start over button is clicked", () => {
    const { getByText } = render(<SetPasscode />);
    const buttonElement = getByText(/1/);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);

    const buttonContinue = getByText(
      EN_TRANSLATIONS["setpasscode.continue.button"]
    );
    fireEvent.click(buttonContinue);
    const labelElement = getByText(
      EN_TRANSLATIONS["setpasscode.reenterpasscode.label"]
    );
    expect(labelElement).toBeInTheDocument();

    const startOverElement = getByText(
      EN_TRANSLATIONS["setpasscode.startover.label"]
    );
    fireEvent.click(startOverElement);

    const passcodeLabel = getByText(
      EN_TRANSLATIONS["setpasscode.enterpasscode.label"]
    );
    expect(passcodeLabel).toBeInTheDocument();
  });

  test("clicking on the backspace button removes a digit from the passcode", () => {
    const { getByText, getByTestId } = render(<SetPasscode />);
    const buttonElement = getByText(/1/);
    fireEvent.click(buttonElement);
    const backspaceButton = getByTestId("setpasscode-backspace-button");
    fireEvent.click(backspaceButton);
    const circleElement = getByTestId("circle-0");
    expect(circleElement.classList).not.toContain("circle-fill");
  });

  test("displays error message if passcode doesn't match when re-entering", () => {
    const { getByText, getByTestId } = render(<SetPasscode />);
    const buttonElement = getByText(/1/);
    fireEvent.click(buttonElement);
    const button0Element = getByText(/0/);
    fireEvent.click(button0Element);
    const button8Element = getByText(/8/);
    fireEvent.click(button8Element);
    const button9Element = getByText(/9/);
    fireEvent.click(button9Element);
    fireEvent.click(button9Element);
    fireEvent.click(button9Element);

    const continueButton = getByTestId("setpasscode-continue-button");
    fireEvent.click(continueButton);

    const reenter2ButtonElement = getByText(/2/);
    fireEvent.click(reenter2ButtonElement);
    const reenter3ButtonElement = getByText(/3/);
    fireEvent.click(reenter3ButtonElement);
    const reenter4ButtonElement = getByText(/4/);
    fireEvent.click(reenter4ButtonElement);
    const reenter5ButtonElement = getByText(/5/);
    fireEvent.click(reenter5ButtonElement);
    const reenter6ButtonElement = getByText(/6/);
    fireEvent.click(reenter6ButtonElement);
    const reenter7ButtonElement = getByText(/7/);
    fireEvent.click(reenter7ButtonElement);
    const errorMessage = getByText(
      EN_TRANSLATIONS["setpasscode.enterpasscode.error"]
    );
    expect(errorMessage).toBeInTheDocument();
  });

  test("sets passcode and redirects to next page when passcode is entered correctly", async () => {
    const { getByTestId, getByText, queryByText } = render(
      <MemoryRouter initialEntries={[PASSCODE_ROUTE]}>
        <Route
          exact
          path={PASSCODE_ROUTE}
          component={SetPasscode}
        />
        <Route
          path={GENERATE_SEED_PHRASE_ROUTE}
          component={GenerateSeedPhrase}
        />
      </MemoryRouter>
    );

    const buttonElement = getByText(/1/);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);

    const continueButton = getByTestId("setpasscode-continue-button");
    fireEvent.click(continueButton);

    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);

    await waitFor(() =>
      expect(queryByText(EN_TRANSLATIONS["setpasscode.enterpasscode.description"])).not.toBeInTheDocument()
    );
    expect(argon2Spy).toBeCalledWith(
      "111111",
      expect.any(Buffer),
      ARGON2ID_OPTIONS
    );
    expect(setKeyStoreSpy).toBeCalledWith(
      KeyStoreKeys.APP_PASSCODE,
      ARGON2ID_HASH.encoded
    );

    const title = getByText(/Generate Seed Phrase/i);
    const overlay = getByTestId("seed-phrase-privacy-overlay");

    expect(title).toBeInTheDocument();
    expect(overlay).toBeInTheDocument();
  });

  test("displays error message if passcode doesn't match, backspace and re-enter correct passcode redirects to next page", async () => {
    const { getByTestId, getByText, queryByText } = render(
      <MemoryRouter initialEntries={[PASSCODE_ROUTE]}>
        <Route
          exact
          path={PASSCODE_ROUTE}
          component={SetPasscode}
        />
        <Route
          path={GENERATE_SEED_PHRASE_ROUTE}
          component={GenerateSeedPhrase}
        />
      </MemoryRouter>
    );

    const buttonElement = getByText(/1/);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);

    const continueButton = getByTestId("setpasscode-continue-button");
    fireEvent.click(continueButton);

    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);
    fireEvent.click(buttonElement);

    const button2Element = getByText(/2/);
    fireEvent.click(button2Element);

    const errorMessage = getByText(
      EN_TRANSLATIONS["setpasscode.enterpasscode.error"]
    );
    expect(errorMessage).toBeInTheDocument();

    const backspaceButton = getByTestId("setpasscode-backspace-button");
    fireEvent.click(backspaceButton);
    fireEvent.click(buttonElement);

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS["setpasscode.enterpasscode.description"])
      ).not.toBeInTheDocument()
    );
    expect(argon2Spy).toBeCalledWith(
      "111111",
      expect.any(Buffer),
      ARGON2ID_OPTIONS
    );
    expect(setKeyStoreSpy).toBeCalledWith(
      KeyStoreKeys.APP_PASSCODE,
      ARGON2ID_HASH.encoded
    );
    expect(
      queryByText(EN_TRANSLATIONS["setpasscode.enterpasscode.description"])
    ).not.toBeInTheDocument();

    const title = getByText(EN_TRANSLATIONS["generateseedphrase.title"]);
    const overlay = getByTestId("seed-phrase-privacy-overlay");

    expect(title).toBeInTheDocument();
    expect(overlay).toBeInTheDocument();
  });
});
