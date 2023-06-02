import { PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import {
  initialState,
  CardInfoCacheProps,
  cardInfoCacheSlice,
  setCardInfoCache,
  clearCardInfoCache,
} from "./cardInfoCache";
import { RootState } from "../../index";
import { RoutePath } from "../../../routes";
import { didsMock } from "../../../ui/__mocks__/didsMock";

describe("Card Info Cache", () => {
  test("It should return the initial state on first run", () => {
    expect(cardInfoCacheSlice.reducer(undefined, {} as PayloadAction)).toEqual(
      initialState
    );
  });

  test("It should set and clear the current card info cache", () => {
    const cardType = "dids";
    const cardColor = "#FFFFFF";
    const cardData = didsMock[0];

    const newData: CardInfoCacheProps = {
      cardProps: {
        cardType: cardType,
        cardColor: cardColor,
      },
      cardData: [cardData],
    };

    const actionSetData = setCardInfoCache(newData);
    const newCardInfoCache = cardInfoCacheSlice.reducer(
      initialState,
      actionSetData
    );

    expect(newCardInfoCache.cardProps.cardType).toEqual(cardType);
    expect(newCardInfoCache.cardProps.cardColor).toEqual(cardColor);
    expect(newCardInfoCache.cardData).toEqual([cardData]);

    const actionClearData = clearCardInfoCache();
    const emptyCardInfoCache = cardInfoCacheSlice.reducer(
      initialState,
      actionClearData
    );

    expect(emptyCardInfoCache).toEqual(initialState);
  });
});
