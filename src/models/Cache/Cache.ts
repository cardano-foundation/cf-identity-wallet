import {get, set} from "../../db/storage";

export const Cache = {
    table: 'app.cache',
    path: '/',
    payload: {},
    accountId: '',

    async init() {
        const cache = await get(this.table);
        if (!cache) return;
        this.path = cache.path;
        this.payload = cache.payload;
        this.accountId = cache.accountId;
    },
    set setPath(path: string) {
        this.path = path
    },
    set setPayload(payload: string) {
        this.payload = payload
    },
    set setAccountId(accountId: string) {
        this.accountId = accountId
    },
    get() {
        return {
            path: this.path,
            payload: this.payload,
            accountId: this.accountId,
        }
    },
    async commit() {
        await set(this.table, {
            path: this.path,
            payload: this.payload,
            accountId: this.accountId
        });
    }
}
