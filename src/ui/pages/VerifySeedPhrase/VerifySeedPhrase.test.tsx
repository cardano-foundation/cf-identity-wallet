import { Route, Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { Provider } from "react-redux";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { waitForIonicReact } from "@ionic/react-test-utils";
import configureStore from "redux-mock-store";
import { GenerateSeedPhrase } from "../GenerateSeedPhrase";
import { VerifySeedPhrase } from "../VerifySeedPhrase";
import { RoutePath } from "../../../routes";
import { store } from "../../../store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import {
  FIFTEEN_WORDS_BIT_LENGTH,
  MNEMONIC_FIFTEEN_WORDS,
} from "../../../constants/appConstants";
import { TabsMenu } from "../../components/navigation/TabsMenu";
import { Addresses } from "../../../core/cardano/addresses";
import {
  KeyStoreKeys,
  SecureStorage,
} from "../../../core/storage/secureStorage";

const rootKey = "rootKeyHex";
const secureStorageSetSpy = jest
  .spyOn(SecureStorage, "set")
  .mockResolvedValue();
const convertRootKeySpy = jest
  .spyOn(Addresses, "convertToRootXPrivateKeyHex")
  .mockReturnValue(rootKey);

describe("Verify Seed Phrase Page", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const initialState = {
    stateCache: {
      routes: [RoutePath.VERIFY_SEED_PHRASE],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
      },
    },
    seedPhraseCache: {
      seedPhrase160:
        "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
      seedPhrase256: "",
      selected: FIFTEEN_WORDS_BIT_LENGTH,
    },
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };
  test("The user can navigate from Generate to Verify Seed Phrase page", async () => {
    const history = createMemoryHistory();
    const state = {
      type: "new",
    };
    history.push(RoutePath.GENERATE_SEED_PHRASE, state);
    const seedPhrase = [];
    const { getByTestId, queryByText, getByText, findByText } = render(
      <Provider store={store}>
        <Router history={history}>
          <Route
            path={RoutePath.GENERATE_SEED_PHRASE}
            component={GenerateSeedPhrase}
          />
          <Route
            path={RoutePath.VERIFY_SEED_PHRASE}
            component={VerifySeedPhrase}
          />
        </Router>
      </Provider>
    );

    const revealSeedPhraseButton = getByTestId("reveal-seed-phrase-button");
    const termsCheckbox = getByTestId("termsandconditions-checkbox");
    const generateContinueButton = await findByText(
      EN_TRANSLATIONS.generateseedphrase.new.continue.button
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
      EN_TRANSLATIONS.generateseedphrase.alert.confirm.button.confirm
    );

    act(() => {
      fireEvent.click(generateConfirmButton);
    });

    await waitFor(() =>
      expect(
        queryByText(EN_TRANSLATIONS.verifyseedphrase.new.title)
      ).toBeVisible()
    );
  });

  test("The user can't Verify the Seed Phrase", async () => {
    const history = createMemoryHistory();
    const state = {
      type: "new",
    };
    history.push(RoutePath.VERIFY_SEED_PHRASE, state);
    const { getByTestId, queryByText } = render(
      <Provider store={storeMocked}>
        <Router history={history}>
          <Route
            path={RoutePath.VERIFY_SEED_PHRASE}
            component={VerifySeedPhrase}
          />
        </Router>
      </Provider>
    );

    const continueButton = getByTestId("continue-button-verify-seedphrase");
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
        queryByText(EN_TRANSLATIONS.verifyseedphrase.alert.text)
      ).toBeVisible()
    );

    expect(convertRootKeySpy).not.toBeCalled();
    expect(secureStorageSetSpy).not.toBeCalled();
  });

  test("The user can Verify the Seed Phrase", async () => {
    const history = createMemoryHistory();
    const state = {
      type: "new",
    };
    history.push(RoutePath.VERIFY_SEED_PHRASE, state);
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <Router history={history}>
          <Route
            path={RoutePath.VERIFY_SEED_PHRASE}
            component={VerifySeedPhrase}
          />
          <Route
            path={RoutePath.TABS_MENU}
            component={TabsMenu}
          />
        </Router>
      </Provider>
    );

    const continueButton = getByTestId("continue-button-verify-seedphrase");
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

    initialState.seedPhraseCache.seedPhrase160
      .split(" ")
      .forEach(async (word) => {
        fireEvent.click(getByText(String(word)));
      });

    await waitFor(() =>
      expect(matchingSeedPhraseContainer.childNodes.length).toBe(
        MNEMONIC_FIFTEEN_WORDS
      )
    );

    fireEvent.click(
      getByText(
        String(
          initialState.seedPhraseCache.seedPhrase160.split(" ")[
            MNEMONIC_FIFTEEN_WORDS - 1
          ]
        )
      )
    );

    await waitFor(() =>
      expect(matchingSeedPhraseContainer.childNodes.length).toBe(
        MNEMONIC_FIFTEEN_WORDS
      )
    );

    fireEvent.click(
      getByText(
        String(
          initialState.seedPhraseCache.seedPhrase160.split(" ")[
            MNEMONIC_FIFTEEN_WORDS - 1
          ]
        )
      )
    );

    await waitFor(() =>
      expect(continueButton).toHaveAttribute("disabled", "false")
    );

    fireEvent.click(continueButton);

    await waitFor(() => expect(getByTestId("tabs-menu")).toBeVisible());

    const seedPhraseString = initialState.seedPhraseCache.seedPhrase160;
    expect(convertRootKeySpy).toBeCalledWith(seedPhraseString);
    expect(secureStorageSetSpy).toBeCalledWith(
      KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY,
      rootKey
    );
    expect(secureStorageSetSpy).toBeCalledWith(
      KeyStoreKeys.IDENTITY_SEEDPHRASE,
      seedPhraseString
    );
  });

  test("calls handleOnBack when back button is clicked", async () => {
    const history = createMemoryHistory();
    const state = {
      type: "new",
    };
    history.push(RoutePath.VERIFY_SEED_PHRASE, state);
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [RoutePath.VERIFY_SEED_PHRASE],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {
        seedPhrase160: "example1 example2 example3 example4 example5",
        seedPhrase256: "",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <Router history={history}>
          <Route
            path={RoutePath.VERIFY_SEED_PHRASE}
            component={VerifySeedPhrase}
          />
        </Router>
      </Provider>
    );

    fireEvent.click(getByText(String("example1")));
    fireEvent.click(getByText(String("example2")));
    fireEvent.click(getByText(String("example3")));
    fireEvent.click(getByText(String("example4")));
    fireEvent.click(getByText(String("example5")));

    const continueButton = getByTestId(
      "continue-button-verify-seedphrase"
    ) as HTMLButtonElement;

    expect(continueButton.disabled).toBe(false);

    const backButton = getByTestId("back-button");
    act(() => {
      fireEvent.click(backButton);
    });

    expect(continueButton.disabled).toBe(true);
  });
});
