export type PaginationOptions = {
    count?: number;
    page?: number;
    order?: 'asc' | 'desc';
};

export type AdditionalEndpointOptions = {
    from?: string | undefined;
    to?: string | undefined;
};

export const DEFAULT_PAGINATION_PAGE_COUNT = 1;
export const DEFAULT_PAGINATION_PAGE_ITEMS_COUNT = 100;
export const DEFAULT_ORDER: 'asc' | 'desc' = 'asc';

export const blockfrostEndpoints: { [network: string]: string } = {
    mainnet: 'https://cardano-mainnet.blockfrost.io/api/v0',
    preprod: 'https://cardano-preprod.blockfrost.io/api/v0',
    preview: 'https://cardano-preview.blockfrost.io/api/v0',
    ipfs: 'https://ipfs.blockfrost.io/api/v0'
}
