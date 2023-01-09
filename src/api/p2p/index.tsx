import { CardanoPeerConnect, DAppPeerConnect } from '@fabianbormann/cardano-peer-connect';
import {Bytes, Cbor, Cip30DataSignature, Paginate} from "@fabianbormann/cardano-peer-connect/types";
import Meerkat from "@fabianbormann/meerkat";
import {getPeerConnect, setPeerConnect, addChannelInPeerConnect, addMessageInPeerConnect} from "../../db";
import {extendMoment} from "moment-range";
import Moment from 'moment';
// @ts-ignore
const moment = extendMoment(Moment);

export interface IPeer {
    id: string;
}

export interface IChannel {
    id: string;
    name: string;
    connected?: boolean;
    server: boolean;
    meerkat?: Meerkat;
}

export class PeerConnect extends CardanoPeerConnect {

    id?: number;
    apiVersion: string = '0.1.0';
    name: string = 'idWallet';
    icon: string = 'data:image/svg+xml,%3Csvg%20xmlns...';

    identity: {address:string, seed: string} = {
        address: '',
        seed: ''
    };
    channels: Array<IChannel> = [];
    // torrent trackers list
    trackers: Array<string> = [];
    // trusted addresses
    whitelist: Array<string> = [];

    constructor() {
        super();
        getPeerConnect().then(peerConnect => {
            this.identity = peerConnect.identity;
            this.channels = peerConnect.channels;
            this.trackers = peerConnect.trackers || (new Meerkat()).announce;
            this.whitelist = peerConnect.whitelist;
        });
    }

    /**
     * Init all meerkat instances
     */
    init(): void {
        if (this.channels.length) {
            for (let i = 0; i < this.channels.length; i++) {
                this.initChannel(
                    this.channels[i].name,
                    this.channels[i]?.meerkat?.seed || '',
                    this.channels[i].server
                );
            }
        }
    }

    /**
     * refresh all meerkat instances
     */
    refreshChannels(): void {
        if (this.channels.length) {
            const ccss = this.channels;
            this.channels = [];
            for (let i = 0; i < ccss.length; i++) {
                this.initChannel(
                    ccss[i].name,
                    ccss[i]?.meerkat?.seed || '',
                    ccss[i].server
                );
            }
        }
    }

    /**
     * Refresh an existing channel
     *
     * @param channelId - The channel id
     */
    refreshChannel(channelId: string): void {
        if (this.channels.length) {
            for (let i = 0; i < this.channels.length; i++) {
                if (channelId === this.channels[i].id){
                    this.channels = this.channels.filter(c => c.id == channelId);
                    this.initChannel(
                        this.channels[i].name,
                        this.channels[i]?.meerkat?.seed || '',
                        this.channels[i].server
                    );
                    break;
                }
            }
        }
    }

    /**
     * Add a new torrent tracker for peers discovering
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
            if (c.meerkat) c.meerkat.announce = this.trackers;
            return c;
        });

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

        this.initChannel(name, meerkat.seed, true);
    }

    /**
     * Init an existing channel.
     *
     * @param name - The channel name
     * @param seed - The seed of the channel instance
     *
     */
    initChannel(name:string, seed: string, isServer: boolean): void {
        if( !name || !seed || this.channels.some(c => c.name === name || c.meerkat?.seed === seed)) return;

        let meerkat = new Meerkat({seed});

        meerkat.register('message', (address: any, args: any, callback: (arg0: string) => void) => {
            console.log(
                `[info]: message rpc call invoked by address ${address}, content ${args}`
            );

            addMessageInPeerConnect(`${name}:${meerkat.address()}`, {
                sender: address,
                content: args,
                time: moment.utc().millisecond()
            });
            callback('callback from message');
        });

        if (isServer){
            meerkat.on('connections', (clients:number) => {
                if (clients === 0) {
                    console.log(`[info]: server ready  ${meerkat.address()}`);

                }
                addChannelInPeerConnect({
                    id:`${name}:${meerkat.address()}`,
                    name,
                    seed: meerkat.seed,
                    server: true,
                    messages: []}).then(r => {
                        this.channels.push({
                            id: `${name}:${meerkat.address()}`,
                            name,
                            meerkat,
                            server: true
                        });
                    });
                console.log(`[info]: ${clients} clients connected in channel`);
            });
        } else {
            meerkat.on('server', () => {
                console.log('[info]: connected to channel');

                addChannelInPeerConnect({
                    id:`${name}:${meerkat.address()}`,
                    name,
                    seed: meerkat.seed,
                    server: false,
                    messages: []}).then(r => {
                        this.channels.push({
                            id: `${name}:${meerkat.address()}`,
                            name,
                            meerkat,
                            server: false
                        });
                });

            });
        }
    }



    /**
     * Join an existing channel.
     *
     * @param serverAddress - The server address identifier
     *
     */
    joinChannel(name: string, serverAddress: string): void {

        let meerkat = new Meerkat({identifier: serverAddress});

        this.initChannel(name, meerkat.seed, false);
    }

    /**
     * Close an existing channel.
     *
     * @param channelId - The channel identifier
     *
     */
    closeChannel(channelId: string): void {
        getPeerConnect().then(channels => {
            const filteredChannels = channels.filter((c: { id: string; }) => c.id !== channelId);
            setPeerConnect(filteredChannels).then(_ => {
                this.channels = this.channels.filter((c: { id: string; }) => c.id !== channelId);
            });
        });
    }

    /**
     * Send message to channel
     *
     * @param serverAddress - The channel address to send the message
     * @param message - The text message to send
     *
     */
    sendMessage(serverAddress: string, message: string): void {

        getPeerConnect().then(peerConnect => {

            let meerkat = new Meerkat({
                    identifier: serverAddress,
                    seed: peerConnect.identity.seed
                }
            );

            meerkat.on('server', () => {
                console.log(`[info]: SendMessage-> connected to server: ${serverAddress}`);
                meerkat.rpc(serverAddress, 'message', {message}, (response: (arg0: string) => void) => {
                    console.log(`Message sent :${message}`)
                    console.log(`To server :${serverAddress}`)
                    console.log(`By user :${meerkat.address()}`)
                    //response(`Message sent: ${message}`);
                    //meerkat.close();
                    //console.log(`Connection is closed`)
                });
            });
        })
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
