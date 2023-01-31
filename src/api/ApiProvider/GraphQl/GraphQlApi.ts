import axios from "axios";
import {graphqlEndpoints} from "./config";
import {statusBody} from "./queries/status";

export const GraphQl = {
    _network: 'preprod',
    async init(network: string) {
        this._network = network;
    },
    async get(query:any, params:any) {
        try {
            console.log("get");
            console.log('graphqlEndpoints[this._network]');
            console.log(graphqlEndpoints[this._network]);
            return await axios.post(
                graphqlEndpoints[this._network],
                {
                    query: query,
                    variables: params,
                }
            );
        } catch (e) {
            console.log(e);
            return e;
        }
    },
    async status() {
        console.log("query status");
        const query = statusBody();
        console.log(query)
        const r = await this.get(query, {});
        console.log("result");
        console.log(r);

        return r;
    }
}
