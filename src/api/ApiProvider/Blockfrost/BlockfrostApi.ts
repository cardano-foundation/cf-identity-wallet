import axios from "axios";
import {
    AdditionalEndpointOptions,
    blockfrostEndpoints,
    DEFAULT_ORDER,
    DEFAULT_PAGINATION_PAGE_COUNT,
    DEFAULT_PAGINATION_PAGE_ITEMS_COUNT,
    PaginationOptions
} from "./config";
import {BLOCKFROST_TOKEN_ID} from "../../../../secrets";

export const Blockfrost = {
    _tokens: <{ [network: string]: string }>{
        mainnet: BLOCKFROST_TOKEN_ID.mainnet,
        preprod: BLOCKFROST_TOKEN_ID.preprod,
        preview: BLOCKFROST_TOKEN_ID.preview,
        ipfs: BLOCKFROST_TOKEN_ID.ipfs
    },
    _network: 'preprod',
    async init(network: string) {
        this._network = network;
    },
    async get(endpoint: string, pagination?: PaginationOptions) {
        try {
            const url = blockfrostEndpoints[this._network] + `${endpoint}`;
            const config = {
                method: 'GET',
                url,
                headers: {
                    project_id: this._tokens[this._network]
                },
                params: pagination || {}
            };
            return axios(config)
                .then(response => {
                    return response.data;
                });
        } catch (error) {
            throw error;
        }
    },
    async epochsLatestParameters() {
        try {
            return await this.get(`/epochs/latest/parameters`);
        } catch (error) {
            if (error) {
                console.log('Oops, error during sending the request');
            }
            throw error;
        }
    },
    async accountState(stakeAddress: string, pagination?: PaginationOptions) {
        const paginationOptions = getPaginationOptions(pagination);
        try {
            return await this.get(`/accounts/${stakeAddress}`, {
                page: paginationOptions.page,
                count: paginationOptions.count,
                order: paginationOptions.order,
            });
        } catch (error) {
            if (error) {
                console.log('Oops, error during sending the request to accountState');
            }
            throw error;
        }
    },
    async accountAddresses(stakeAddress: string, pagination?: PaginationOptions) {
        const paginationOptions = getPaginationOptions(pagination);
        try {
            return await this.get(`/accounts/${stakeAddress}/addresses`, {
                page: paginationOptions.page,
                count: paginationOptions.count,
                order: paginationOptions.order,
            });
        } catch (error) {
            if (error) {
                console.log('Oops, error during sending the request to accountState');
            }
            throw error;
        }
    },
    async addressesUtxos(address: string, pagination?: PaginationOptions) {
        const paginationOptions = getPaginationOptions(pagination);
        try {
            return await this.get(`/addresses/${address}/utxos`, {
                page: paginationOptions.page,
                count: paginationOptions.count,
                order: paginationOptions.order,
            });
        } catch (error) {
            if (error) {
                console.log('Oops, error during sending the request to utxos');
            }
            throw error;
        }
    },
    async asset(unit: string) {
        try {
            return await this.get(`assets/${unit}`);
        } catch (error) {
            if (error) {
                console.log('Oops, error during sending the request to asset');
            }
            throw error;
        }
    },
    async addressTransactions(address: string, pagination?: PaginationOptions, additionalOptions?: AdditionalEndpointOptions) {
        const paginationOps: PaginationOptions = getPaginationOptions(pagination);
        const additionalOps: AdditionalEndpointOptions = getAdditionalParams(additionalOptions);
        try {

            return await this.get(`addresses/${address}/transactions`, {
                page: paginationOps.page,
                count: paginationOps.count,
                order: paginationOps.order,
                // @ts-ignore
                from: additionalOps.from,
                to: additionalOps.to,
            });
        } catch (error) {
            if (error) {
                console.log('Oops, error during sending the request to utxos');
            }
            throw error;
        }
    },
    async tx(hash: string) {
        try {
            return await this.get(`txs/${hash}`);
        } catch (error) {
            if (error) {
                console.log('Oops, error during sending the request to tx');
            }
            throw error;
        }
    },
    async txUtxos(hash: string) {
        try {
            return await this.get(`txs/${hash}/utxos`);
        } catch (error) {
            if (error) {
                console.log('Oops, error during sending the request to txUtxos');
            }
            throw error;
        }
    },
}

export const getPaginationOptions = (
    options?: PaginationOptions,
): PaginationOptions => {
    if (!options) {
        return {
            page: DEFAULT_PAGINATION_PAGE_COUNT,
            count: DEFAULT_PAGINATION_PAGE_ITEMS_COUNT,
            order: DEFAULT_ORDER,
        };
    }

    return {
        page: options.page || DEFAULT_PAGINATION_PAGE_COUNT,
        count: options.count || DEFAULT_PAGINATION_PAGE_ITEMS_COUNT,
        order: options.order || DEFAULT_ORDER,
    };
};

export const getAdditionalParams = (
    options?: AdditionalEndpointOptions,
): AdditionalEndpointOptions => {
    return {
        from: options?.from,
        to: options?.to,
    };
};
