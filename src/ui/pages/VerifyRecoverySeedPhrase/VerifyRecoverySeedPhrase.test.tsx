import { IonReactMemoryRouter } from "@ionic/react-router";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ENG_Trans from "../../../locales/en/en.json";
import { RoutePath } from "../../../routes";
import { VerifyRecoverySeedPhrase } from "./VerifyRecoverySeedPhrase";
import { setSeedPhraseCache } from "../../../store/reducers/seedPhraseCache";

const SEED_PHRASE_LENGTH = 18;

const secureStorageGetFunc = jest.fn();
const secureStorageSetFunc = jest.fn();
const secureStorageDeleteFunc = jest.fn();
const verifySeedPhraseFnc = jest.fn();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      isMnemonicValid: () => verifySeedPhraseFnc(),
    },
  },
}));

jest.mock("../../../core/storage", () => ({
  ...jest.requireActual("../../../core/storage"),
  SecureStorage: {
    get: (...args: any) => secureStorageGetFunc(...args),
    set: (...args: any) => secureStorageSetFunc(...args),
    delete: (...args: any) => secureStorageDeleteFunc(...args),
  },
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonInput: (props: any) => {
    return (
      <input
        {...props}
        data-testid={props["data-testid"]}
        onBlur={(e) => props.onIonBlur(e)}
        onFocus={(e) => props.onIonFocus(e)}
        onChange={(e) => props.onIonInput?.(e)}
      />
    );
  },
}));

describe("Verify Recovery Seed Phrase", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const initialState = {
    stateCache: {
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        recoveryWalletProgress: true,
      },
    },
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("Render screen", () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <VerifyRecoverySeedPhrase />
      </Provider>
    );

    expect(getByText(ENG_Trans.verifyrecoveryseedphrase.title)).toBeVisible();
    expect(
      getByText(ENG_Trans.verifyrecoveryseedphrase.paragraph.top)
    ).toBeVisible();
    expect(
      getByText(
        ENG_Trans.verifyrecoveryseedphrase.button.continue
      ).getAttribute("disabled")
    ).toBe("true");
    expect(getByTestId("word-input-0")).toBeVisible();
  });

  test("Render suggest seed phrase", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <VerifyRecoverySeedPhrase />
      </Provider>
    );

    expect(getByText(ENG_Trans.verifyrecoveryseedphrase.title)).toBeVisible();

    const firstInput = getByTestId("word-input-0");
    act(() => {
      fireEvent.focus(firstInput);
      fireEvent.change(firstInput, {
        target: { value: "a" },
      });
    });

    expect(
      getByText(ENG_Trans.verifyrecoveryseedphrase.suggestions.title)
    ).toBeVisible();
    expect(getByText("abandon")).toBeVisible();
    expect(getByTestId("word-input-1")).toBeVisible();

    act(() => {
      fireEvent.click(getByText("abandon"));
    });

    await waitFor(() => {
      expect((firstInput as HTMLInputElement).value).toEqual("abandon");
    });
  });

  test("Render/clear word should match suggestion error", async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <Provider store={storeMocked}>
        <VerifyRecoverySeedPhrase />
      </Provider>
    );

    expect(getByText(ENG_Trans.verifyrecoveryseedphrase.title)).toBeVisible();

    const firstInput = getByTestId("word-input-0");
    act(() => {
      fireEvent.focus(firstInput);
      fireEvent.change(firstInput, {
        target: { value: "a" },
      });
    });

    expect(
      getByText(ENG_Trans.verifyrecoveryseedphrase.suggestions.title)
    ).toBeVisible();

    act(() => {
      fireEvent.blur(firstInput);
    });

    await waitFor(() => {
      expect(getByTestId("no-suggest-error")).toBeVisible();
    });

    act(() => {
      fireEvent.focus(firstInput);
      fireEvent.change(firstInput, {
        target: { value: "abandon" },
      });
    });

    expect(
      getByText(ENG_Trans.verifyrecoveryseedphrase.suggestions.title)
    ).toBeVisible();

    act(() => {
      fireEvent.blur(firstInput);
    });

    await waitFor(() => {
      expect(queryByTestId("no-suggest-error")).toBe(null);
    });
  });

  test("Fill all seed", async () => {
    const history = createMemoryHistory();
    history.push(RoutePath.VERIFY_RECOVERY_SEED_PHRASE);

    verifySeedPhraseFnc.mockImplementation(() => {
      return Promise.resolve(true);
    });

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter
          history={history}
          initialEntries={[RoutePath.VERIFY_RECOVERY_SEED_PHRASE]}
        >
          <VerifyRecoverySeedPhrase />
        </IonReactMemoryRouter>
      </Provider>
    );

    expect(getByText(ENG_Trans.verifyrecoveryseedphrase.title)).toBeVisible();
    for (let i = 0; i < SEED_PHRASE_LENGTH; i++) {
      act(() => {
        const input = getByTestId(`word-input-${i}`);
        fireEvent.focus(input);
        fireEvent.change(input, {
          target: { value: "a" },
        });
      });

      await waitFor(() => {
        expect(getByText("abandon")).toBeVisible();
      });

      act(() => {
        fireEvent.click(getByText("abandon"));
      });

      if (i < SEED_PHRASE_LENGTH - 1) {
        await waitFor(() => {
          expect(getByTestId(`word-input-${i}`)).toBeVisible();
        });
      }
    }

    expect(
      getByText(
        ENG_Trans.verifyrecoveryseedphrase.button.continue
      ).getAttribute("disabled")
    ).toBe("false");

    act(() => {
      fireEvent.click(
        getByText(ENG_Trans.verifyrecoveryseedphrase.button.continue)
      );
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setSeedPhraseCache({
          seedPhrase:
            "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon",
          bran: "",
        })
      );
    });
  });

  test("Lock when try max attempt", async () => {
    const history = createMemoryHistory();
    history.push(RoutePath.VERIFY_RECOVERY_SEED_PHRASE);

    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter
          history={history}
          initialEntries={[RoutePath.VERIFY_RECOVERY_SEED_PHRASE]}
        >
          <VerifyRecoverySeedPhrase />
        </IonReactMemoryRouter>
      </Provider>
    );

    expect(getByText(ENG_Trans.verifyrecoveryseedphrase.title)).toBeVisible();
    for (let i = 0; i < SEED_PHRASE_LENGTH; i++) {
      act(() => {
        const input = getByTestId(`word-input-${i}`);
        fireEvent.focus(input);
        fireEvent.change(input, {
          target: { value: "a" },
        });
      });

      await waitFor(() => {
        expect(getByText("abandon")).toBeVisible();
      });

      act(() => {
        fireEvent.click(getByText("abandon"));
      });

      if (i < SEED_PHRASE_LENGTH - 1) {
        await waitFor(() => {
          expect(getByTestId(`word-input-${i}`)).toBeVisible();
        });
      }
    }

    expect(
      getByText(
        ENG_Trans.verifyrecoveryseedphrase.button.continue
      ).getAttribute("disabled")
    ).toBe("false");

    verifySeedPhraseFnc.mockImplementation(() => {
      return Promise.resolve(false);
    });

    for (let i = 0; i < 5; i++) {
      act(() => {
        fireEvent.click(
          getByText(ENG_Trans.verifyrecoveryseedphrase.button.continue)
        );
      });

      await waitFor(() => {
        expect(
          getByText(ENG_Trans.verifyrecoveryseedphrase.alert.fail.text)
        ).toBeVisible();
      });

      act(() => {
        fireEvent.click(
          getByText(
            ENG_Trans.verifyrecoveryseedphrase.alert.fail.button.confirm
          )
        );
      });
    }

    await waitFor(() => {
      expect(
        getByText(ENG_Trans.verifyrecoveryseedphrase.alert.manyattemp.text)
      ).toBeVisible();
      expect(
        getByText(ENG_Trans.verifyrecoveryseedphrase.button.lock)
      ).toBeVisible();
    });
  });

  test("Lock when try max attempt after reload page", async () => {
    const history = createMemoryHistory();
    history.push(RoutePath.VERIFY_RECOVERY_SEED_PHRASE);

    secureStorageGetFunc.mockImplementation(() => {
      return Promise.resolve(Date.now() - 1000);
    });

    const { getByText } = render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter
          history={history}
          initialEntries={[RoutePath.VERIFY_RECOVERY_SEED_PHRASE]}
        >
          <VerifyRecoverySeedPhrase />
        </IonReactMemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(ENG_Trans.verifyrecoveryseedphrase.button.lock)
      ).toBeVisible();
    });
  });

  test("Remove last lock time when duration greater than 10 minutes", async () => {
    const history = createMemoryHistory();
    history.push(RoutePath.VERIFY_RECOVERY_SEED_PHRASE);

    secureStorageGetFunc.mockImplementation(() => {
      return Promise.resolve(Date.now() - 11 * 60 * 1000);
    });

    render(
      <Provider store={storeMocked}>
        <IonReactMemoryRouter
          history={history}
          initialEntries={[RoutePath.VERIFY_RECOVERY_SEED_PHRASE]}
        >
          <VerifyRecoverySeedPhrase />
        </IonReactMemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(secureStorageDeleteFunc).toBeCalled();
    });
  });
});
