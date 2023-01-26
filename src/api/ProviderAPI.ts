import {BLOCKFROST} from "../../secrets";
import axios from "axios";

export const ProviderApi = {
    _network: 'MAINNET',
    _token: '...',
    set network(network: string) {
        this._network = network;
    },
    async get(endpoint: string) {
        const url = BLOCKFROST + `${endpoint}`;
        const config = {
            method: 'GET',
            url,
            headers: {
                // @ts-ignore
                "project_id": BLOCKFROST[this._network]
            }
        };

        return axios(config)
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.log(error);
            });

    },
}
