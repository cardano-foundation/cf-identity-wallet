import { render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { ionFireEvent as fireEvent } from "@ionic/react-test-utils";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { cryptoAccountsMock } from "../../__mocks__/cryptoAccountsMock";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { AssetsTransactions } from "./AssetsTransactions";

describe("Slides Component", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const initialState = {
    stateCache: {
      routes: [TabsRoutePath.CRYPTO],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
      },
    },
    seedPhraseCache: {},
    cryptoAccountsCache: cryptoAccountsMock,
  };
  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("Render Assets Transactions (compact)", () => {
    const { getByText } = render(
      <Provider store={storeMocked}>
        <AssetsTransactions
          assets={cryptoAccountsMock[0].assets}
          transactions={cryptoAccountsMock[0].transactions}
          expanded={false}
          hideBalance={false}
        />
      </Provider>
    );
    const swipeUpMessage = getByText(
      EN_TRANSLATIONS.crypto.tab.assetstransactions.swipeupmessage
    );
    const firstAsset = getByText(
      cryptoAccountsMock[0].assets[0].balance.toFixed(2) + " ADA"
    );
    expect(swipeUpMessage).toBeInTheDocument();
    expect(firstAsset).toBeInTheDocument();
  });

  test("Render Assets Transactions (expanded)", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <AssetsTransactions
          assets={cryptoAccountsMock[0].assets}
          transactions={cryptoAccountsMock[0].transactions}
          expanded={true}
          hideBalance={false}
        />
      </Provider>
    );
    const segment = getByTestId("assets-transactions-toggle-segment");
    const firstAsset = getByText(
      cryptoAccountsMock[0].assets[0].balance.toFixed(2) + " ADA"
    );
    expect(segment).toBeInTheDocument();
    expect(getByTestId("assets-list")).toBeInTheDocument();
    expect(firstAsset).toBeInTheDocument();
    expect(segment).toHaveValue("assets");

    act(() => {
      fireEvent.ionChange(segment, "transactions");
    });

    await waitFor(() => expect(segment).toHaveValue("transactions"));

    await waitFor(() =>
      expect(getByTestId("transactions-list")).toBeInTheDocument()
    );

    const firstTransaction = getByText(
      cryptoAccountsMock[0].transactions[0].amount.toFixed(2) + " ADA"
    );
    expect(firstTransaction).toBeInTheDocument();
  });
});
