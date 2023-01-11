
import Meerkat from "@fabianbormann/meerkat";
import {
    setHost,
    getHost, getPeer, setPeer, getAllChannels
} from "../../db";
import {extendMoment} from "moment-range";
import Moment from 'moment';
import crypto from "crypto";
import {add} from "ionicons/icons";
// @ts-ignore
const moment = extendMoment(Moment);

export const md5 = (contents: string) => crypto.createHash('md5').update(contents).digest("hex");

export class HostConnect {

    private meerkat: Meerkat;
    id:string;
    name:string;

    constructor(name:string, config:{
                    seed:string | undefined,
                    announce:string[],
                    messages?:string[]
                }) {

        this.name = name;

        this.meerkat = new Meerkat({
            seed: config.seed || undefined,
            //announce: config.announce
        });
        this.id = `${name}:${this.meerkat.identifier}`;

        console.log(`Share this address ${this.meerkat.address()} with your clients`);

        let connected = false;
        this.meerkat.on('connections', (clients) => {
            console.log(`[info]: connections: ${clients}`);
            if (!connected) {
                connected = true;
                console.log('server ready');
                if (clients){
                    getHost(this.id).then(host => {
                        setHost(this.id, host.seed, host.identifier, name, host.announce, host.messages, true).then(_ => {
                            console.log(`[info]: the server is ready to use 💬`);
                            this.meerkat.rpc(host.identifier, 'message', {message: "server ready 💬"}, (response: any) => {
                                    console.log("response");
                                    console.log(response);
                                }
                            );
                        });
                    });
                } else {
                    getHost(this.id).then(host => {
                        setHost(this.id, host.seed, host.identifier, name, host.announce, host.messages, false).then(_ => {
                            console.log(`[info]: loading server... 💬`);
                        });
                    });
                }
            }
        });

        this.meerkat.register(
            'message',
            (address: string, message: string, callback: Function) => {
                try {
                    console.log(`[info]: message: ${message}`);
                    console.log(`[info]: sent by: ${address}`);

                    getHost(this.id).then(host => {

                        const newMessage = {
                            preview: message,
                            sender: address,
                            received: true,
                            sent: address === host.identifier,
                            read: false,
                            starred: false,
                            date: moment.utc().format("MM-DD HH:mm:ss")
                        }
                        setHost(this.id, host.seed, host.identifier, name, host.announce, [...host.messages, newMessage], host.connected).then(_ => {
                            callback(true);
                        });
                    });
                } catch (e) {
                    callback(false);
                }
            }
        );

        setHost(this.id, this.meerkat.seed, this.meerkat.identifier, name, this.meerkat.announce, config.messages);
    }

    /**
     * Send message to host
     *
     * @param identifier - The host identifier to send the message
     * @param name - The local channel name
     * @param message - The text message to send
     *
     */
    sendMessage(identifier: string, name: string, message: string): void {

        if(!this.meerkat) return;

        console.log(`[info]: send message from host`);
        this.meerkat.rpc(
            identifier,
            'message',
            {
                message
            },
            (response:boolean) => {
                try {

                    console.log(`[info]: message: ${message}`);
                    console.log(`[info]: sent from host to: ${identifier}`);
                    getHost(this.id).then(host => {
                        const newMessage = {
                            preview: {
                                message
                            },
                            received: response,
                            sent: true,
                            read: false,
                            starred: false,
                            date: moment.utc().format("YYYY-MM-DD HH:mm:ss")
                        }
                        setHost(
                            this.id,
                            host.seed,
                            host.identifier,
                            name,
                            host.announce,
                            [...host.messages, newMessage],
                            host.connected).then(_ => {});
                        console.log(`[info]: message received by: ${identifier}`);
                    });
                } catch (e) {

                }
            }
        );
    }
}

