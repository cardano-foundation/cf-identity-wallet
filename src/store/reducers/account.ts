import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from "../store";
import {IAccount} from "../../models/types";

const initialState: { current: any } = {current: {}}

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        setCurrentAccount: (state, action: PayloadAction<IAccount>) => {
            state.current = action.payload;
        },
    }
});

export const {setCurrentAccount} = accountSlice.actions;

export const getAccount = (state: RootState) => state.account.current;
export const getNetwork = (state: RootState) => state.account.current.getNetwork(state.settings.network);
export const getStakeAddress = (state: RootState) => state.account.current.getNetwork(state.settings.network).stakeAddress;
export const getAddresses = (state: RootState) => state.account.current.getNetwork(state.settings.network).addresses;
export const getAssets = (state: RootState) => state.account.current.getNetwork(state.settings.network).assets;
export const getTransactions = (state: RootState) => state.account.current.getNetwork(state.settings.network).transactions;

export default accountSlice.reducer;
