import {BLOCKFROST_TOKEN_ID} from "../../../secrets";
import axios from "axios";
import {blockfrostEndpoints} from "./config";

export const ApiProvider = {
    _network: 'MAINNET',
    _type: 'blockfrost',
    _token: '...',
    _networks: {
        blockfrost: {
            mainnet: blockfrostEndpoints.MAINNET,
            preprod: blockfrostEndpoints.PREVIEW
        }
    },
    set network(network: string) {
        this._network = network;
    },
    async get(endpoint: string) {
        const url = `${endpoint}`;
        const config = {
            method: 'GET',
            url,
            headers: {
                // @ts-ignore
                "project_id": BLOCKFROST_TOKEN_ID[this._network]
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
