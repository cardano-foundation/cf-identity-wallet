
import Meerkat from "@fabianbormann/meerkat";
import {
    setHost,
    getHost
} from "../../db";
import {extendMoment} from "moment-range";
import Moment from 'moment';
import crypto from "crypto";
// @ts-ignore
const moment = extendMoment(Moment);

export const md5 = (contents: string) => crypto.createHash('md5').update(contents).digest("hex");

export class HostConnect {

    private meerkat: Meerkat | undefined;
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
            announce: config.announce
        });
        this.id = `${name}:${this.meerkat.identifier}`;

        setHost(this.id, this.meerkat.seed, this.meerkat.identifier, name, this.meerkat.announce);

        let connected = false;
        this.meerkat.on('connections', () => {
            if (!connected) {
                connected = true;
                console.log('server ready');
            }
        });

        this.meerkat.register(
            'message',
            (address: string, message: string, callback: Function) => {
                try {
                    console.log(`[info]: message: ${message}`);
                    console.log(`[info]: sent by: ${address}`);
                    getHost(this.id).then(host => {
                        setHost(this.id, host.seed, host.identifier, name, host.announce, [...host.messages, message]).then(_ => {
                            callback(true);
                        });
                    });
                } catch (e) {
                    callback(false);
                }
            }
        );
    }

}

