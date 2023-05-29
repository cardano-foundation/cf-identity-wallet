import { render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import {
  ionFireEvent as fireEvent,
  waitForIonicReact,
} from "@ionic/react-test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import { GenerateSeedPhrase } from "./GenerateSeedPhrase";
import {
  MNEMONIC_FIFTEEN_WORDS,
  MNEMONIC_TWENTYFOUR_WORDS,
  FIFTEEN_WORDS_BIT_LENGTH,
  TWENTYFOUR_WORDS_BIT_LENGTH,
} from "../../../constants/appConstants";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { store } from "../../../store";
import { RoutePath } from "../../../routes";

describe("Generate Seed Phrase screen", () => {
  test("User can see Title and Security Overlay", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );

    const title = getByText(EN_TRANSLATIONS["generateseedphrase.title"]);
    const overlay = getByTestId("seed-phrase-privacy-overlay");

    expect(title).toBeInTheDocument();
    expect(overlay).toBeInTheDocument();
  });

  test("User can dismiss the Security Overlay", async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );

    const overlay = getByTestId("seed-phrase-privacy-overlay");
    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");

    expect(overlay).toHaveClass("visible");

    act(() => {
      fireEvent.click(revealSeedPhraseButton);
    });
    await waitFor(() => expect(overlay).toHaveClass("hidden"));
  });

  test("User can toggle the 15/24 words seed phrase segment using the seed phrases from Redux", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [RoutePath.GENERATE_SEED_PHRASE],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {
        seedPhrase160: "example example example example example example example example example example example example example example example",
        seedPhrase256: "example example example example example example example example example example example example example example example example example example example example example example example example",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByTestId } = render(
      <MemoryRouter initialEntries={[RoutePath.GENERATE_SEED_PHRASE]}>
        <Provider store={storeMocked}>
          <GenerateSeedPhrase />
        </Provider>
      </MemoryRouter>
    );

    const segment = getByTestId("mnemonic-length-segment");
    const seedPhraseContainer = getByTestId("seed-phrase-container");

    expect(segment).toHaveValue(String(FIFTEEN_WORDS_BIT_LENGTH));

    expect(seedPhraseContainer.childNodes.length).toBe(MNEMONIC_FIFTEEN_WORDS);

    act(() => {
      fireEvent.ionChange(segment, String(TWENTYFOUR_WORDS_BIT_LENGTH));
    });
    await waitFor(() =>
      expect(segment).toHaveValue(String(TWENTYFOUR_WORDS_BIT_LENGTH))
    );
    await waitFor(() =>
      expect(seedPhraseContainer.childNodes.length).toBe(
        MNEMONIC_TWENTYFOUR_WORDS
      )
    );

    act(() => {
      fireEvent.ionChange(segment, String(FIFTEEN_WORDS_BIT_LENGTH));
    });
    await waitFor(() =>
      expect(segment).toHaveValue(String(FIFTEEN_WORDS_BIT_LENGTH))
    );
    await waitFor(() =>
      expect(seedPhraseContainer.childNodes.length).toBe(MNEMONIC_FIFTEEN_WORDS)
    );
  });
  test("User can toggle the 15/24 words seed phrase segment", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [RoutePath.GENERATE_SEED_PHRASE],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {
        seedPhrase160: "",
        seedPhrase256: "",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByTestId } = render(
      <MemoryRouter initialEntries={[RoutePath.GENERATE_SEED_PHRASE]}>
        <Provider store={storeMocked}>
          <GenerateSeedPhrase />
        </Provider>
      </MemoryRouter>
    );

    const segment = getByTestId("mnemonic-length-segment");
    const seedPhraseContainer = getByTestId("seed-phrase-container");

    expect(segment).toHaveValue(String(FIFTEEN_WORDS_BIT_LENGTH));

    expect(seedPhraseContainer.childNodes.length).toBe(MNEMONIC_FIFTEEN_WORDS);

    act(() => {
      fireEvent.ionChange(segment, String(TWENTYFOUR_WORDS_BIT_LENGTH));
    });
    await waitFor(() =>
      expect(segment).toHaveValue(String(TWENTYFOUR_WORDS_BIT_LENGTH))
    );
    await waitFor(() =>
      expect(seedPhraseContainer.childNodes.length).toBe(
        MNEMONIC_TWENTYFOUR_WORDS
      )
    );

    act(() => {
      fireEvent.ionChange(segment, String(FIFTEEN_WORDS_BIT_LENGTH));
    });
    await waitFor(() =>
      expect(segment).toHaveValue(String(FIFTEEN_WORDS_BIT_LENGTH))
    );
    await waitFor(() =>
      expect(seedPhraseContainer.childNodes.length).toBe(MNEMONIC_FIFTEEN_WORDS)
    );
  });

  test("User is prompted to save the seed phrase", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );

    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");
    const continueButton = getByText(
      EN_TRANSLATIONS["generateseedphrase.continue.button"]
    );
    const alertWrapper = getByTestId("alert-wrapper");
    const termsCheckbox = getByTestId("termsandconditions-checkbox");

    expect(alertWrapper).toHaveClass("alert-invisible");
    expect(continueButton).toBeDisabled;

    act(() => {
      fireEvent.click(revealSeedPhraseButton);
      fireEvent.change(termsCheckbox, { target: { checked: true } });
    });

    await waitFor(() => expect(continueButton).not.toBeDisabled);

    act(() => {
      fireEvent.click(continueButton);
    });

    await waitForIonicReact();

    await waitFor(() => expect(alertWrapper).toHaveClass("alert-visible"));

    const alertTitle = getByText(
      EN_TRANSLATIONS["generateseedphrase.alert.text"]
    );

    await waitFor(() => expect(alertTitle).toBeVisible());
  });

  test("Clicking on second alert button will dismiss it", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );

    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");
    const continueButton = getByText(
      EN_TRANSLATIONS["generateseedphrase.continue.button"]
    );
    const alertWrapper = getByTestId("alert-wrapper");

    act(() => {
      fireEvent.click(revealSeedPhraseButton);
      fireEvent.click(continueButton);
    });
    await waitForIonicReact();

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS["generateseedphrase.alert.button.cancel"])
      );
    });

    await waitFor(() => expect(alertWrapper).toHaveClass("alert-invisible"));
  });

  test("Clicking on alert backdrop will dismiss it", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );

    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");
    const continueButton = getByText(
      EN_TRANSLATIONS["generateseedphrase.continue.button"]
    );

    act(() => {
      fireEvent.click(revealSeedPhraseButton);
      fireEvent.click(continueButton);
    });

    await waitFor(() => {
      expect(getByTestId("alert-wrapper")).toBeInTheDocument();
    });

    const backdrop = document.querySelector("ion-backdrop");

    act(() => {
      backdrop && fireEvent.click(backdrop);
    });

    await waitFor(() => {
      expect(backdrop).not.toBeInTheDocument();
    });
  });

  test("User can toggle the checkbox", async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );
    const termsCheckbox = getByTestId("termsandconditions-checkbox");
    expect(termsCheckbox.hasAttribute('[checked="false"]'));
    fireEvent.click(termsCheckbox);
    expect(termsCheckbox.hasAttribute('[checked="true"]'));
    fireEvent.click(termsCheckbox);
    expect(termsCheckbox.hasAttribute('[checked="false"]'));
  });

  test("Opening Terms and conditions modal triggers the checkbox", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <GenerateSeedPhrase />
      </Provider>
    );
    const termsCheckbox = getByTestId("termsandconditions-checkbox");
    const termsLink = getByText(
      EN_TRANSLATIONS["generateseedphrase.termsandconditions.link"]
    );

    expect(termsCheckbox.hasAttribute('[checked="false"]'));

    act(() => {
      fireEvent.click(termsLink);
    });

    await waitFor(() => {
      expect(termsCheckbox.hasAttribute('[checked="true"]'));
    });
  });

  test("calls handleOnBack when back button is clicked", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [RoutePath.SET_PASSCODE, RoutePath.ONBOARDING],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {
        seedPhrase160: "",
        seedPhrase256: "",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <MemoryRouter initialEntries={[RoutePath.GENERATE_SEED_PHRASE]}>
        <Provider store={storeMocked}>
          <GenerateSeedPhrase />
        </Provider>
      </MemoryRouter>
    );

    const overlay = getByTestId("seed-phrase-privacy-overlay");
    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");

    expect(overlay).toHaveClass("visible");

    act(() => {
      fireEvent.click(revealSeedPhraseButton);
    });
    await waitFor(() => expect(overlay).toHaveClass("hidden"));

    const backButton = getByTestId("back-button");
    act(() => {
      fireEvent.click(backButton);
    });

    await waitFor(() => expect(overlay).toHaveClass("visible"));
  });
});
