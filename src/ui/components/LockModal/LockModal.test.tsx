import { MemoryRouter, Route, Router } from "react-router-dom";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { createMemoryHistory } from "history";
import { IonReactRouter } from "@ionic/react-router";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { store } from "../../../store";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { RoutePath } from "../../../routes";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../globals/constants";
import { OperationType } from "../../globals/types";
import { LockModal } from "./LockModal";
import { SetPasscode } from "../../pages/SetPasscode";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children }: { children: any }) => children,
}));

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
  cryptoAccountsCache: {
    cryptoAccounts: never[];
  };
}

const mockStore = configureStore();
const dispatchMock = jest.fn();
const storeMocked = (initialState: StoreMocked) => {
  return {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };
};

const initialStateWithSeedPhrase = {
  stateCache: {
    routes: [RoutePath.GENERATE_SEED_PHRASE],
    authentication: {
      loggedIn: false,
      time: Date.now(),
      passcodeIsSet: true,
      seedPhraseIsSet: true,
    },
    currentOperation: OperationType.IDLE,
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

const initialStateWithoutSeedPhrase = {
  stateCache: {
    routes: [RoutePath.GENERATE_SEED_PHRASE],
    authentication: {
      loggedIn: false,
      time: Date.now(),
      passcodeIsSet: true,
      seedPhraseIsSet: false,
    },
    currentOperation: OperationType.IDLE,
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

describe("Lock Modal", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("Renders Lock modal with title and description", () => {
    const { getByText } = render(
      <Provider store={storeMocked(initialStateWithoutSeedPhrase)}>
        <LockModal />
      </Provider>
    );
    expect(getByText(EN_TRANSLATIONS.lockmodal.title)).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.lockmodal.description)
    ).toBeInTheDocument();
  });

  test("The user can add and remove digits from the passcode", () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked(initialStateWithoutSeedPhrase)}>
        <LockModal />
      </Provider>
    );
    fireEvent.click(getByText(/1/));
    const circleElement = getByTestId("circle-0");
    expect(circleElement.classList).toContain("passcode-module-circle-fill");
    const backspaceButton = getByTestId("setpasscode-backspace-button");
    fireEvent.click(backspaceButton);
    expect(circleElement.classList).not.toContain(
      "passcode-module-circle-fill"
    );
  });

  test("If a seed phrase was stored and I click on I forgot my passcode, I can start over", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const storeMocked2 = (initialState: StoreMocked) => {
      return {
        ...mockStore(initialState),
        dispatch: dispatchMock,
      };
    };
    const { getByText, findByText } = render(
      <Provider store={storeMocked2(initialStateWithSeedPhrase)}>
        <MemoryRouter initialEntries={[RoutePath.ROOT]}>
          <IonReactRouter>
            <LockModal />
            <Route
              path={RoutePath.SET_PASSCODE}
              component={SetPasscode}
            />
          </IonReactRouter>
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(
      await findByText(EN_TRANSLATIONS.lockmodal.forgotten.button)
    );
    fireEvent.click(
      await getByText(EN_TRANSLATIONS.lockmodal.alert.button.verify)
    );

    await waitFor(() => {
      expect(
        findByText(EN_TRANSLATIONS.lockmodal.description)
      ).not.toBeInTheDocument();
    });
  });

  test("If no seed phrase was stored and I click on I forgot my passcode, I can start over", async () => {
    const { getByText, findByText } = render(
      <Provider store={storeMocked(initialStateWithoutSeedPhrase)}>
        <MemoryRouter initialEntries={[RoutePath.ROOT]}>
          <IonReactRouter>
            <LockModal />
            <Route
              path={RoutePath.SET_PASSCODE}
              component={SetPasscode}
            />
          </IonReactRouter>
        </MemoryRouter>
      </Provider>
    );
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/2/));
    fireEvent.click(getByText(/3/));
    fireEvent.click(getByText(/4/));
    fireEvent.click(getByText(/5/));
    fireEvent.click(getByText(/6/));
    expect(await findByText(EN_TRANSLATIONS.lockmodal.error)).toBeVisible();
    fireEvent.click(getByText(EN_TRANSLATIONS.lockmodal.forgotten.button));
    expect(
      await findByText(EN_TRANSLATIONS.lockmodal.alert.text.restart)
    ).toBeVisible();
    fireEvent.click(getByText(EN_TRANSLATIONS.lockmodal.alert.button.restart));
    expect(
      await findByText(EN_TRANSLATIONS.setpasscode.enterpasscode.title)
    ).toBeVisible();
  });

  test("verifies passcode and hide modal", async () => {
    const storedPass = "111111";
    const secureStorageGetMock = jest
      .spyOn(SecureStorage, "get")
      .mockResolvedValue(storedPass);

    const { getByText, findByText } = render(
      <Provider store={storeMocked(initialStateWithSeedPhrase)}>
        <LockModal />
      </Provider>
    );

    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));
    fireEvent.click(getByText(/1/));

    await waitFor(() => {
      expect(secureStorageGetMock).toHaveBeenCalledWith(
        KeyStoreKeys.APP_PASSCODE
      );
    });

    expect(
      getByText(EN_TRANSLATIONS.lockmodal.description)
    ).not.toBeInTheDocument();
  });
});
