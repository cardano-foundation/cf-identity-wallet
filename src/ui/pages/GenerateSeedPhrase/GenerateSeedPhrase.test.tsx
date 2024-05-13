import { render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { act } from "react-dom/test-utils";
import {
  ionFireEvent as fireEvent,
  waitForIonicReact,
} from "@ionic/react-test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Router } from "react-router-dom";
import { GenerateSeedPhrase } from "./GenerateSeedPhrase";
import {
  MNEMONIC_FIFTEEN_WORDS,
  MNEMONIC_TWENTYFOUR_WORDS,
  FIFTEEN_WORDS_BIT_LENGTH,
  TWENTYFOUR_WORDS_BIT_LENGTH,
} from "../../globals/constants";
import { OperationType } from "../../globals/types";
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
    currentOperation: OperationType;
  };
  seedPhraseCache: {
    seedPhrase160: string;
    seedPhrase256: string;
    selected: number;
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
    history.push(RoutePath.GENERATE_SEED_PHRASE);
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

    const seedPhraseModule = getByTestId("seed-phrase-module");
    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");
    const segment = getByTestId("mnemonic-length-segment");

    expect(seedPhraseModule).toHaveClass("seed-phrase-hidden");

    act(() => {
      fireEvent.click(revealSeedPhraseButton);
    });
    await waitFor(() =>
      expect(seedPhraseModule).toHaveClass("seed-phrase-visible")
    );

    act(() => {
      fireEvent.ionChange(segment, `${TWENTYFOUR_WORDS_BIT_LENGTH}`);
    });

    await waitFor(() =>
      expect(seedPhraseModule).toHaveClass("seed-phrase-hidden")
    );
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
        currentOperation: OperationType.IDLE,
      },
      seedPhraseCache: {
        seedPhrase160:
          "example example example example example example example example example example example example example example example",
        seedPhrase256:
          "example example example example example example example example example example example example example example example example example example example example example example example example",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
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
        currentOperation: OperationType.IDLE,
      },
      seedPhraseCache: {
        seedPhrase160: "",
        seedPhrase256: "",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
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
    const alertWrapper = getByTestId(
      "seed-phrase-generate-alert-continue-container"
    );
    const termsCheckbox = getByTestId("terms-and-conditions-checkbox");

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
    const alertWrapper = getByTestId(
      "seed-phrase-generate-alert-continue-container"
    );

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
      expect(
        getByTestId("seed-phrase-generate-alert-continue")
      ).toBeInTheDocument();
    });

    const backdrop = document.querySelector("ion-backdrop");

    act(() => {
      backdrop && fireEvent.click(backdrop);
    });

    await waitFor(() => {
      expect(backdrop).not.toBeInTheDocument();
    });
  });

  test("User can toggle the checkbox and modal", async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Router history={history}>
          <GenerateSeedPhrase />
        </Router>
      </Provider>
    );
    const termsCheckbox = getByTestId("terms-and-conditions-checkbox");
    expect(termsCheckbox.hasAttribute('[checked="false"'));
    fireEvent.ionChange(termsCheckbox, '[checked="true"');
    expect(termsCheckbox.hasAttribute('[checked="true"'));
    fireEvent.ionChange(termsCheckbox, '[checked="false"');
    expect(termsCheckbox.hasAttribute('[checked="false"'));
  });
  test("Display seed number on seed phrase segment", async () => {
    const initialState = {
      stateCache: {
        routes: [RoutePath.GENERATE_SEED_PHRASE],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
        currentOperation: OperationType.IDLE,
      },
      seedPhraseCache: {
        seedPhrase160: "",
        seedPhrase256: "",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
      },
    };

    const { getByTestId } = render(
      <Provider store={storeMocked(initialState)}>
        <Router history={history}>
          <GenerateSeedPhrase />
        </Router>
      </Provider>
    );

    const seedPhraseContainer = getByTestId("seed-phrase-container");

    expect(seedPhraseContainer.childNodes.length).toBe(MNEMONIC_FIFTEEN_WORDS);

    await waitFor(() => {
      const seedNumberElements = seedPhraseContainer.querySelectorAll(
        'span[data-testid*="word-index-number"]'
      );
      expect(seedNumberElements.length).toBe(MNEMONIC_FIFTEEN_WORDS);
    });
  });
});
