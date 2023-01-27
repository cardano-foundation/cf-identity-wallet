import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from "../store";

export interface ICacheState {
    path: string,
    payload: any,
    accountId: string
}

const initialState: ICacheState = {
    path: '/',
    payload: {},
    accountId: '',
};

export const cacheSlice = createSlice({
    name: 'cache',
    initialState,
    reducers: {
        setCache: (state, action: PayloadAction<ICacheState>) => {
            state.path = action.payload.path;
            state.payload = action.payload.payload;
            state.accountId = action.payload.accountId;
        },
        setPathInCache: (state, action: PayloadAction<ICacheState>) => {
            state.path = action.payload.path;
        },
        setPayloadInCache: (state, action: PayloadAction<ICacheState>) => {
            state.payload = action.payload.payload;
        },
        setAccountIdInCache: (state, action: PayloadAction<ICacheState>) => {
            state.accountId = action.payload.accountId;
        },
    }
});

export const {setCache, setPathInCache, setPayloadInCache, setAccountIdInCache} = cacheSlice.actions;

export const getCache = (state: RootState) => state.cache;
export const getCachedPath = (state: RootState) => state.cache.path;
export const getCachedPayload = (state: RootState) => state.cache.payload;
export const getCachedAccount = (state: RootState) => state.cache.accountId;

export default cacheSlice.reducer;
