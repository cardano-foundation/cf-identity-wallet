import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../index";
import { StateCacheProps } from "./stateCache.types";

const initialState: StateCacheProps = {
  roleView: 0,
};

const stateCacheSlice = createSlice({
  name: "stateCache",
  initialState,
  reducers: {
    setRoleView: (state, action: PayloadAction<number>) => {
      state.roleView = action.payload;
    },
  },
});

const { setRoleView } = stateCacheSlice.actions;

const getRoleView = (state: RootState) => state.stateCache.roleView;

export { stateCacheSlice, getRoleView, setRoleView };
