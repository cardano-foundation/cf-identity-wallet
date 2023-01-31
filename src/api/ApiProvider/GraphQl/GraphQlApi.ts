import axios from "axios";
import {graphqlEndpoints} from "./config";
import {statusBody} from "./queries/status";
import {protocolParamsBody} from "./queries/network";
import {accountStateBody} from "./queries/account";

export const GraphQl = {
    _network: 'preprod',
    async init(network: string) {
        this._network = network;
    },
    async get(query: any, params: any) {
        try {
            console.log("get");
            console.log('graphqlEndpoints[this._network]');
            console.log(graphqlEndpoints[this._network]);
            const result = await axios.post(
                graphqlEndpoints[this._network],
                {
                    query: query,
                    variables: params,
                }
            );
            return result?.data;
        } catch (e) {
            console.log(e);
            return e;
        }
    },
    async status() {
        return await this.get(statusBody(), {});
    },
    async epochsLatestParameters() {
        return await this.get(protocolParamsBody(), {});
    },
    async accountState(stakeAddress: string) {
        try {
            return await this.get(accountStateBody(), {stakeAddress});
        } catch (error) {
            throw error;
        }
    },
}
