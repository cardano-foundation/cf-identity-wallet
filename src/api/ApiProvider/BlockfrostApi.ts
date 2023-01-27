import {BlockFrostAPI, BlockfrostClientError} from '@blockfrost/blockfrost-js';
import {BLOCKFROST_TOKEN_ID} from "../../../secrets";
import {CardanoNetwork} from "@blockfrost/blockfrost-js/lib/types";

export const Blockfrost = {
    _tokens: {
        mainnet: '',
        preprod: '',
        preview: '',
        ipfs: ''
    },
    _api: undefined as any | typeof BlockFrostAPI,
    _network: 'preprod',
    async init(network: CardanoNetwork) {
        this._network = network;
        this._api = new BlockFrostAPI({
            projectId: BLOCKFROST_TOKEN_ID[this._network],
            network: network
        });
    },
    async getProtocolParams() {
        try {
            return this._api.epochsLatestParameters();
        } catch (error) {
            if (error instanceof BlockfrostClientError) {
                console.log('Oops, error during sending the request');
            }
            // Depending on your use case you may want to rethrow the error
            throw error;
        }
    },
    async getAccountState(stakeAddress: string) {
        try {
            return this._api.getAccountState(stakeAddress);
        } catch (error) {
            if (error instanceof BlockfrostClientError) {
                console.log('Oops, error during sending the request');
            }
            // Depending on your use case you may want to rethrow the error
            throw error;
        }
    },
}
