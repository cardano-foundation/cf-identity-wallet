import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CardInfoCacheProps } from "./cardInfoCache.types";

const initialState: CardInfoCacheProps = {
  cardProps: {
    cardType: "",
    cardColor: "",
  },
  cardData: [],
};

const cardInfoCacheSlice = createSlice({
  name: "cardInfoCache",
  initialState,
  reducers: {
    setCardInfoCache: (state, action: PayloadAction<CardInfoCacheProps>) => {
      state.cardProps = action.payload.cardProps;
      state.cardData = action.payload.cardData;
    },
    clearCardInfoCache: (state) => {
      state.cardProps = {
        cardType: "",
        cardColor: "",
      };
      state.cardData = [];
    },
  },
});

export type { CardInfoCacheProps };

export { initialState, cardInfoCacheSlice };

export const { setCardInfoCache, clearCardInfoCache } =
  cardInfoCacheSlice.actions;
