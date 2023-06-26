import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Crypto } from "./Crypto";
import { store } from "../../../store";
import { RoutePath } from "../../../routes";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../../constants/appConstants";
import { cryptoAccountsMock } from "../../__mocks__/cryptoAccountsMock";

describe("Crypto Tab", () => {
  test("Renders Crypto Tab", () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Crypto />
      </Provider>
    );

    expect(getByTestId("crypto-tab")).toBeInTheDocument();
    expect(getByTestId("menu-button")).toBeInTheDocument();
  });

  test("Renders placeholder when no crypto accounts are found", () => {
    const seed15 =
      "example example example example example example example example example example example example example example example";
    const seed24 =
      "example example example example example example example example example example example example example example example example example example example example example example example example";
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
        seedPhrase160: seed15,
        seedPhrase256: seed24,
        selected: FIFTEEN_WORDS_BIT_LENGTH,
      },
      cryptoAccountsCache: [{}],
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Crypto />
      </Provider>
    );

    expect(getByTestId("cards-placeholder")).toBeInTheDocument();
  });
});
