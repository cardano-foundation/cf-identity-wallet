import { CardanoPeerConnect, DAppPeerConnect } from '@fabianbormann/cardano-peer-connect';
import {Bytes, Cbor, Cip30DataSignature, Paginate} from "@fabianbormann/cardano-peer-connect/types";
import Meerkat from "@fabianbormann/meerkat";

export interface IPeer {
    id: string;
}

export interface IChannel {
    name: string;
    connected: boolean;
    server?: boolean;
    meerkat: Meerkat;
}

export class PeerConnect extends CardanoPeerConnect {

    id?: number;
    apiVersion: string = '0.1.0';
    name: string = 'idWallet';
    icon: string = 'data:image/svg+xml,%3Csvg%20xmlns...';

    channels: Array<IChannel>;
    // torrent trackers list
    trackers: Array<string>;
    // trusted addresses
    whitelist: Array<string>;

    constructor() {
        super();
        this.channels = [];
        this.whitelist = [];
        this.trackers = [];
    }

    /**
     * Init all meerkat instances
     */
    init(): void {

    }

    /**
     * refresh all meerkat instances
     */
    refreshChannels(): void {

    }

    /**
     * Add a new torrent tracker to our p2p state
     *
     * @param channelId - The channel id
     */
    refreshChannel(channelId: string): void {

    }

    /**
     * Add a new torrent tracker to our p2p state
     *
     * @param tracker - The tracker url
     *
     * @example "https://pro.passwordchaos.gimbalabs.io/"
     */
    addTracker(tracker: string): void {
        if (this.trackers.includes(tracker)) return;

        // update global trackers list
        this.trackers =[...this.trackers, tracker];

        // update meerkat instances
        this.channels = this.channels.map(c => {
            c.meerkat.announce = this.trackers;
            return c;
        });

        // TODO: update localDb
    }

    /**
     * Create a new channel.
     *
     * @param name - The channel object
     *
     */
    createChannel(name: string): void {

        if( !name || this.channels.some(c => c.name === name)) return;

        let meerkat = new Meerkat();

        meerkat.on('connections', (clients:number) => {
            if (clients === 0) {
                console.log(`[info]: server ready  ${meerkat.address()}`);

            }
            console.log(`[info]: ${clients} clients connected in channel`);
        });

        meerkat.register('message', (address: any, args: any, callback: (arg0: string) => void) => {
            console.log(
                `[info]: message rpc call invoked by address ${address}, content ${args}`
            );

            callback('callback from message');
        });

        // @ts-ignore
        const channel:IChannel = {
            name,
            server: true,
            connected: true,
            meerkat
        }

        // TODO: persist state in db, remove meerkat object and replace with meerkat.seed
        this.channels.push(channel);
    }


    /**
     * Restore an existing channel.
     *
     * @param name - The channel name
     * @param seed - The seed of the channel instance
     *
     */
    restoreChannel(name:string, seed:string): void {
        if( !name || !seed || this.channels.some(c => c.name === name || c.meerkat.seed === seed)) return;

        let meerkat = new Meerkat({seed});
    }

    /**
     * Close an existing channel.
     *
     * @param channelId - The channel identifier
     *
     */
    closeChannel(): void {
        return undefined;
    }

    /**
     * Leave an existing channel.
     *
     * @param channelId - The channel identifier
     *
     */
    leaveChannel(): void {
        return undefined;
    }

    /**
     * Join an existing channel.
     *
     * @param serverAddress - The server identifier
     *
     */
    joinChannel(serverAddress: string): void {

        let meerkat = new Meerkat({identifier: serverAddress || ''});
    }

    /**
     * Update the channels
     *
     * @param channelId - The channel identifier
     *
     */
    updateChannels(): void {
        return undefined;
    }

    /**
     * Send text message to
     *
     * @param channelId - The channel identifier
     *
     */
    sendMessage(channelId: string): void {

        const channel = this.channels.find(c => c.id === channelId);
    }

    getBalance(): Cbor {
        return undefined;
    }

    getChangeAddress(): Cbor {
        return undefined;
    }

    getCollateral(params?: { amount?: Cbor }): Cbor[] | null {
        return undefined;
    }

    getNetworkId(): number {
        return 0;
    }

    getRewardAddresses(): Cbor[] {
        return [];
    }

    getUnusedAddresses(): Cbor[] {
        return [];
    }

    getUsedAddresses(): Cbor[] {
        return [];
    }

    getUtxos(amount?: Cbor, paginate?: Paginate): Cbor[] | null {
        return undefined;
    }

    signData(addr: string, payload: Bytes): Cip30DataSignature {
        return undefined;
    }

    signTx(tx: Cbor, partialSign: boolean): Cbor {
        return undefined;
    }

    submitTx(tx: Cbor): string {
        return "";
    }
}


export const peerConnect = new PeerConnect();
