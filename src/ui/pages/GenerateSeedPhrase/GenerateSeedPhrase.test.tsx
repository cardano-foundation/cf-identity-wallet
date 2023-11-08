import { render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { act } from "react-dom/test-utils";
import {
  ionFireEvent as fireEvent,
  waitForIonicReact,
} from "@ionic/react-test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Route, Router } from "react-router-dom";
import { GenerateSeedPhrase } from "./GenerateSeedPhrase";
import {
  MNEMONIC_FIFTEEN_WORDS,
  MNEMONIC_TWENTYFOUR_WORDS,
  FIFTEEN_WORDS_BIT_LENGTH,
  TWENTYFOUR_WORDS_BIT_LENGTH,
} from "../../../constants/appConstants";
import { operationState, onboardingRoute } from "../../constants/dictionary";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { store } from "../../../store";
import { RoutePath } from "../../../routes";

interface StoreMocked {
  stateCache: {
    routes: RoutePath[];
    authentication: {
      loggedIn: boolean;
      time: number;
      passcodeIsSet: boolean;
      seedPhraseIsSet?: boolean;
    };
    currentOperation: string;
  };
  seedPhraseCache: {
    seedPhrase160: string;
    seedPhrase256: string;
    selected: number;
  };
  cryptoAccountsCache: {
    cryptoAccounts: never[];
  };
}

const mockStore = configureStore();
const dispatchMock = jest.fn();
const history = createMemoryHistory();
const storeMocked = (initialState: StoreMocked) => {
  return {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };
};

describe("Generate Seed Phrase screen from Onboarding", () => {
  beforeAll(() => {
    history.push(RoutePath.GENERATE_SEED_PHRASE, operationState.onboarding);
  });

  test("User can see Title and Security Overlay", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Router history={history}>
          <GenerateSeedPhrase />
        </Router>
      </Provider>
    );

    const title = getByText(
      EN_TRANSLATIONS.generateseedphrase.onboarding.title
    );
    const overlay = getByTestId("seed-phrase-privacy-overlay");

    expect(title).toBeInTheDocument();
    expect(overlay).toBeInTheDocument();
  });

  test("User can dismiss the Security Overlay", async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Router history={history}>
          <GenerateSeedPhrase />
        </Router>
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
    const initialState = {
      stateCache: {
        routes: [RoutePath.GENERATE_SEED_PHRASE],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
        currentOperation: onboardingRoute.createRoute,
      },
      seedPhraseCache: {
        seedPhrase160:
          "example example example example example example example example example example example example example example example",
        seedPhrase256:
          "example example example example example example example example example example example example example example example example example example example example example example example example",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
      },
      cryptoAccountsCache: {
        cryptoAccounts: [],
      },
    };

    const { getByTestId } = render(
      <Provider store={storeMocked(initialState)}>
        <Router history={history}>
          <GenerateSeedPhrase />
        </Router>
      </Provider>
    );

    const segment = getByTestId("mnemonic-length-segment");
    const seedPhraseContainer = getByTestId("seed-phrase-container");

    expect(segment).toHaveValue(`${FIFTEEN_WORDS_BIT_LENGTH}`);

    expect(seedPhraseContainer.childNodes.length).toBe(MNEMONIC_FIFTEEN_WORDS);

    act(() => {
      fireEvent.ionChange(segment, `${TWENTYFOUR_WORDS_BIT_LENGTH}`);
    });
    await waitFor(() =>
      expect(segment).toHaveValue(`${TWENTYFOUR_WORDS_BIT_LENGTH}`)
    );
    await waitFor(() =>
      expect(seedPhraseContainer.childNodes.length).toBe(
        MNEMONIC_TWENTYFOUR_WORDS
      )
    );

    act(() => {
      fireEvent.ionChange(segment, `${FIFTEEN_WORDS_BIT_LENGTH}`);
    });
    await waitFor(() =>
      expect(segment).toHaveValue(`${FIFTEEN_WORDS_BIT_LENGTH}`)
    );
    await waitFor(() =>
      expect(seedPhraseContainer.childNodes.length).toBe(MNEMONIC_FIFTEEN_WORDS)
    );
  });
  test("User can toggle the 15/24 words seed phrase segment", async () => {
    const initialState = {
      stateCache: {
        routes: [RoutePath.GENERATE_SEED_PHRASE],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
        currentOperation: onboardingRoute.createRoute,
      },
      seedPhraseCache: {
        seedPhrase160: "",
        seedPhrase256: "",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
      },
      cryptoAccountsCache: {
        cryptoAccounts: [],
      },
    };

    const { getByTestId } = render(
      <Provider store={storeMocked(initialState)}>
        <Router history={history}>
          <GenerateSeedPhrase />
        </Router>
      </Provider>
    );

    const segment = getByTestId("mnemonic-length-segment");
    const seedPhraseContainer = getByTestId("seed-phrase-container");

    expect(segment).toHaveValue(`${FIFTEEN_WORDS_BIT_LENGTH}`);

    expect(seedPhraseContainer.childNodes.length).toBe(MNEMONIC_FIFTEEN_WORDS);

    act(() => {
      fireEvent.ionChange(segment, `${TWENTYFOUR_WORDS_BIT_LENGTH}`);
    });
    await waitFor(() =>
      expect(segment).toHaveValue(`${TWENTYFOUR_WORDS_BIT_LENGTH}`)
    );
    await waitFor(() =>
      expect(seedPhraseContainer.childNodes.length).toBe(
        MNEMONIC_TWENTYFOUR_WORDS
      )
    );

    act(() => {
      fireEvent.ionChange(segment, `${FIFTEEN_WORDS_BIT_LENGTH}`);
    });
    await waitFor(() =>
      expect(segment).toHaveValue(`${FIFTEEN_WORDS_BIT_LENGTH}`)
    );
    await waitFor(() =>
      expect(seedPhraseContainer.childNodes.length).toBe(MNEMONIC_FIFTEEN_WORDS)
    );
  });

  test("User is prompted to save the seed phrase", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Router history={history}>
          <GenerateSeedPhrase />
        </Router>
      </Provider>
    );

    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");
    const continueButton = getByText(
      EN_TRANSLATIONS.generateseedphrase.onboarding.button.continue
    );
    const alertWrapper = getByTestId("alert-confirm");
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
      EN_TRANSLATIONS.generateseedphrase.alert.confirm.text
    );

    await waitFor(() => expect(alertTitle).toBeVisible());
  });

  test("Clicking on second alert button will dismiss it", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Router history={history}>
          <GenerateSeedPhrase />
        </Router>
      </Provider>
    );

    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");
    const continueButton = getByText(
      EN_TRANSLATIONS.generateseedphrase.onboarding.button.continue
    );
    const alertWrapper = getByTestId("alert-confirm");

    act(() => {
      fireEvent.click(revealSeedPhraseButton);
      fireEvent.click(continueButton);
    });
    await waitForIonicReact();

    act(() => {
      fireEvent.click(
        getByText(
          EN_TRANSLATIONS.generateseedphrase.alert.confirm.button.cancel
        )
      );
    });

    await waitFor(() => expect(alertWrapper).toHaveClass("alert-invisible"));
  });

  test("Clicking on alert backdrop will dismiss it", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Router history={history}>
          <GenerateSeedPhrase />
        </Router>
      </Provider>
    );

    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");
    const continueButton = getByText(
      EN_TRANSLATIONS.generateseedphrase.onboarding.button.continue
    );

    act(() => {
      fireEvent.click(revealSeedPhraseButton);
      fireEvent.click(continueButton);
    });

    await waitFor(() => {
      expect(getByTestId("alert-confirm")).toBeInTheDocument();
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
        <Router history={history}>
          <GenerateSeedPhrase />
        </Router>
      </Provider>
    );
    const termsCheckbox = getByTestId("termsandconditions-checkbox");
    expect(termsCheckbox.hasAttribute("[checked=\"false"));
    fireEvent.click(termsCheckbox);
    expect(termsCheckbox.hasAttribute("[checked=\"true"));
    fireEvent.click(termsCheckbox);
    expect(termsCheckbox.hasAttribute("[checked=\"false"));
  });

  test("calls handleOnBack when back button is clicked", async () => {
    const initialState = {
      stateCache: {
        routes: [RoutePath.SET_PASSCODE, RoutePath.ONBOARDING],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
        currentOperation: onboardingRoute.createRoute,
      },
      seedPhraseCache: {
        seedPhrase160: "",
        seedPhrase256: "",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
      },
      cryptoAccountsCache: {
        cryptoAccounts: [],
      },
    };

    const { getByTestId } = render(
      <Provider store={storeMocked(initialState)}>
        <Router history={history}>
          <GenerateSeedPhrase />
        </Router>
      </Provider>
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

describe("Generate Seed Phrase screen from Crypto/Generate", () => {
  beforeAll(() => {
    history.push(
      RoutePath.GENERATE_SEED_PHRASE,
      operationState.newCryptoAccount
    );
  });

  const initialState = {
    stateCache: {
      routes: [RoutePath.GENERATE_SEED_PHRASE],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        seedPhraseIsSet: true,
      },
      currentOperation: "",
    },
    seedPhraseCache: {
      seedPhrase160:
        "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
      seedPhrase256: "",
      selected: FIFTEEN_WORDS_BIT_LENGTH,
    },
    cryptoAccountsCache: {
      cryptoAccounts: [],
    },
  };

  test("User can generate a new seed phrase", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked(initialState)}>
        <Router history={history}>
          <GenerateSeedPhrase />
        </Router>
      </Provider>
    );

    expect(getByTestId("close-button")).toBeInTheDocument();
    const overlay = getByTestId("seed-phrase-privacy-overlay");
    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");

    expect(overlay).toHaveClass("visible");

    act(() => {
      fireEvent.click(revealSeedPhraseButton);
    });
    await waitFor(() => expect(overlay).toHaveClass("hidden"));

    const termsCheckbox = getByTestId("termsandconditions-checkbox");
    expect(termsCheckbox.hasAttribute("[checked=\"false"));
    fireEvent.click(termsCheckbox);
    expect(termsCheckbox.hasAttribute("[checked=\"true"));

    const continueButton = getByTestId("primary-button");

    await waitFor(() => expect(continueButton).not.toBeDisabled);

    act(() => {
      fireEvent.click(continueButton);
    });

    await waitForIonicReact();

    await waitFor(() => expect(getByTestId("alert-confirm")).toBeVisible());
  });

  test("Shows an alert when close button is clicked", async () => {
    const { getByTestId, queryByText } = render(
      <Provider store={storeMocked(initialState)}>
        <Router history={history}>
          <GenerateSeedPhrase />
        </Router>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("close-button"));
    });

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.generateseedphrase.alert.exit.text)
      ).toBeVisible()
    );
  });
});

describe.skip("Restore account from existing seed phrase", () => {
  beforeAll(() => {
    history.push(
      RoutePath.GENERATE_SEED_PHRASE,
      operationState.restoreCryptoAccount
    );
  });

  const initialState = {
    stateCache: {
      routes: [RoutePath.GENERATE_SEED_PHRASE],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        seedPhraseIsSet: true,
      },
      currentOperation: "",
    },
    seedPhraseCache: {
      seedPhrase160:
        "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
      seedPhrase256: "",
      selected: FIFTEEN_WORDS_BIT_LENGTH,
    },
    cryptoAccountsCache: {
      cryptoAccounts: [],
    },
  };

  test("User can enter a seed phrase", async () => {
    window.history.pushState(
      { type: operationState.restoreCryptoAccount },
      "",
      RoutePath.GENERATE_SEED_PHRASE
    );
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked(initialState)}>
        <Router history={history}>
          <Route
            path={RoutePath.GENERATE_SEED_PHRASE}
            component={GenerateSeedPhrase}
          />
        </Router>
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.generateseedphrase.restorecryptoaccount.paragraph.top
      )
    ).toBeVisible();

    const overlay = getByTestId("seed-phrase-privacy-overlay");
    expect(overlay).toHaveClass("hidden");

    const continueButton = getByTestId("primary-button");
    expect(continueButton).toBeDisabled;
  });
});
