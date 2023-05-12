import { MemoryRouter, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { GenerateSeedPhrase } from "../GenerateSeedPhrase";
import { VerifySeedPhrase } from "../VerifySeedPhrase";
import { RoutePath } from "../../../routes";
import { store } from "../../../store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { MNEMONIC_FIFTEEN_WORDS } from "../../../constants/appConstants";

describe("Verify Seed Phrase Page", () => {
  const seedPhrase: (string | null)[] = [];
  test("The user can navigate from Generate to Verify Seed Phrase page", async () => {
    const { getByTestId, queryByText, getByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[RoutePath.GENERATE_SEED_PHRASE]}>
          <Route
            path={RoutePath.GENERATE_SEED_PHRASE}
            component={GenerateSeedPhrase}
          />
          <Route
            path={RoutePath.VERIFY_SEED_PHRASE}
            component={VerifySeedPhrase}
          />
        </MemoryRouter>
      </Provider>
    );

    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");
    const termsCheckbox = getByTestId("termsandconditions-checkbox");
    const generateContinueButton = getByText(
      EN_TRANSLATIONS["generateseedphrase.continue.button"]
    );

    act(() => {
      fireEvent.click(revealSeedPhraseButton);
      fireEvent.click(termsCheckbox);
      fireEvent.click(generateContinueButton);
    });
    await waitForIonicReact();

    const seedPhraseContainer = getByTestId("seed-phrase-container");
    for (let i = 0, len = seedPhraseContainer.childNodes.length; i < len; i++) {
      seedPhrase.push(
        seedPhraseContainer.childNodes[i].childNodes[1].textContent
      );
    }

    const generateConfirmButton = getByText(
      EN_TRANSLATIONS["generateseedphrase.alert.button.confirm"]
    );

    act(() => {
      fireEvent.click(generateConfirmButton);
    });

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS["verifyseedphrase.title"])
      ).toBeVisible()
    );
  });

  test("The user can't Verify the Seed Phrase", async () => {
    const { getByTestId, queryByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[RoutePath.VERIFY_SEED_PHRASE]}>
          <Route
            path={RoutePath.VERIFY_SEED_PHRASE}
            component={VerifySeedPhrase}
          />
        </MemoryRouter>
      </Provider>
    );

    const continueButton = getByTestId("continue-button");
    const originalSeedPhraseContainer = getByTestId(
      "original-seed-phrase-container"
    );
    const matchingSeedPhraseContainer = getByTestId(
      "matching-seed-phrase-container"
    );
    await waitFor(() =>
      expect(originalSeedPhraseContainer.childNodes.length).toBe(
        MNEMONIC_FIFTEEN_WORDS
      )
    );

    expect(continueButton).toBeDisabled();

    for (let index = 0; index < MNEMONIC_FIFTEEN_WORDS; index++) {
      fireEvent.click(originalSeedPhraseContainer.childNodes[0]);
    }

    await waitFor(() =>
      expect(matchingSeedPhraseContainer.childNodes.length).toBe(
        MNEMONIC_FIFTEEN_WORDS
      )
    );

    await waitFor(() =>
      expect(continueButton).toHaveAttribute("disabled", "false")
    );

    fireEvent.click(continueButton);

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS["verifyseedphrase.alert.text"])
      ).toBeVisible()
    );
  });

  test("The user can Verify the Seed Phrase", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[RoutePath.VERIFY_SEED_PHRASE]}>
          <Route
            path={RoutePath.VERIFY_SEED_PHRASE}
            component={VerifySeedPhrase}
          />
        </MemoryRouter>
      </Provider>
    );

    const continueButton = getByTestId("continue-button");
    const originalSeedPhraseContainer = getByTestId(
      "original-seed-phrase-container"
    );
    const matchingSeedPhraseContainer = getByTestId(
      "matching-seed-phrase-container"
    );
    await waitFor(() =>
      expect(originalSeedPhraseContainer.childNodes.length).toBe(
        MNEMONIC_FIFTEEN_WORDS
      )
    );

    expect(continueButton).toBeDisabled();

    seedPhrase.forEach(async (word) => {
      fireEvent.click(getByText(String(word)));
    });

    await waitFor(() =>
      expect(matchingSeedPhraseContainer.childNodes.length).toBe(
        MNEMONIC_FIFTEEN_WORDS
      )
    );

    fireEvent.click(getByText(String(seedPhrase[MNEMONIC_FIFTEEN_WORDS - 1])));

    await waitFor(() =>
      expect(matchingSeedPhraseContainer.childNodes.length).toBe(
        MNEMONIC_FIFTEEN_WORDS
      )
    );

    fireEvent.click(getByText(String(seedPhrase[MNEMONIC_FIFTEEN_WORDS - 1])));

    await waitFor(() =>
      expect(continueButton).toHaveAttribute("disabled", "false")
    );
  });
});
