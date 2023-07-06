import { act, fireEvent, render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { CryptoBalance } from "./index";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { cryptoAccountsMock } from "../../__mocks__/cryptoAccountsMock";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { formatCurrencyUSD } from "../../../utils";
import { CryptoBalanceItem } from "./CryptoBalance.types";

const items: CryptoBalanceItem[] = [
  {
    title: EN_TRANSLATIONS.crypto.tab.slider.title.mainbalance,
    fiatBalance: formatCurrencyUSD(
      cryptoAccountsMock[0].balance.main.usdBalance
    ),
    nativeBalance:
      cryptoAccountsMock[0].balance.main.nativeBalance.toFixed(2) + " ADA",
  },
  {
    title: EN_TRANSLATIONS.crypto.tab.slider.title.rewardbalance,
    fiatBalance: formatCurrencyUSD(
      cryptoAccountsMock[1].balance.reward.usdBalance
    ),
    nativeBalance:
      cryptoAccountsMock[1].balance.reward.nativeBalance.toFixed(2) + " ADA",
  },
];

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

  test("Render slide 1", () => {
    const { getByText } = render(
      <Provider store={storeMocked}>
        <CryptoBalance items={items} />
      </Provider>
    );
    const linkElement = getByText(
      EN_TRANSLATIONS.crypto.tab.slider.title.mainbalance
    );
    expect(linkElement).toBeInTheDocument();
  });

  test.skip("Toggle hide balance", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <CryptoBalance items={items} />
      </Provider>
    );

    const container = getByTestId("crypto-balance-container");
    const swiper = getByTestId("crypto-balance-swiper");
    expect(container).not.toHaveClass("hide-balance");

    act(() => {
      fireEvent.click(swiper);
    });

    await waitFor(() => {
      expect(container).toHaveClass("hide-balance");
    });

    act(() => {
      fireEvent.click(swiper);
    });

    await waitFor(() => {
      expect(container).not.toHaveClass("hide-balance");
    });
  });
});
