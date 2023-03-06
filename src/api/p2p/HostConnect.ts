import Meerkat from '@fabianbormann/meerkat';
import {extendMoment} from 'moment-range';
import Moment from 'moment';
import {publish} from '../../utils/events';
import { pouchAPI } from '../../components/AppWrapper';
// @ts-ignore
const moment = extendMoment(Moment);

export class HostConnect {
  static table = 'host';
  private meerkat: Meerkat;
  id: string;
  name: string;

  constructor(
    name: string,
    config: {
      seed: string | undefined;
      identifier: string | undefined;
      announce: string[];
      messages?: string[];
    }
  ) {
    this.name = name;

    this.meerkat = new Meerkat({
      seed: config.seed || undefined,
      identifier: config.identifier || undefined,
      announce: [
        'ws://tracker.files.fm:7072/announce',
        'wss://tracker.openwebtorrent.com/announce',
        'wss://tracker.btorrent.xyz/',
        'https://tracker.boostpool.io',
      ],
    });
    this.id = `${name}:${this.meerkat.identifier}`;

    //console.log(`Share this address ${this.meerkat.address()} with your clients`);
    let connected = false;
    this.meerkat.on('connections', (clients) => {
      console.log(`[info]: connections: ${clients}`);
      if (!connected) {
        connected = true;
        console.log(`[info]: server ready: ${this.meerkat.identifier}`);
        if (clients) {
          pouchAPI.get(HostConnect.table, this.id)
            .then((host) => {
              pouchAPI.set(HostConnect.table, this.id, {
                id: this.id,
                seed: this.meerkat.seed,
                identifier: this.meerkat.identifier,
                name,
                announce: host?.announce || [],
                messages: host?.messages || [],
                connected: true,
              });
            })
            .then((_) => {
              console.log(
                `[info]: the server is ready with address 💬: ${this.meerkat.identifier}`
              );
              /*publish('updateChat')*/
            });
        } else {
          pouchAPI.get(HostConnect.table, this.id)
            .then((host) => {
              pouchAPI.set(HostConnect.table, this.id, {
                id: this.id,
                seed: this.meerkat.seed,
                identifier: this.meerkat.identifier,
                name,
                announce: host?.announce || [],
                messages: host?.messages || [],
                connected: false,
              });
            })
            .then((_) => {
              console.log(`[info]: loading server... 💬`);
              /*publish('updateChat')*/
            });
        }
      }
    });

    this.meerkat.register(
      'text_message',
      (address: string, message: {[key: string]: any}, callback: Function) => {
        try {
          console.log(`[info]: an message arrived to the server: ${message}`);
          console.log(`[info]: sent by: ${address}`);

          console.log(
            `[info]: Broadcast message to: ${JSON.stringify(
              this.meerkat.peers
            )}`
          );
          for (let key in this.meerkat.peers) {
            // do something for each key in the object
            // 2. Make a rpc call for each client with the message just received
            this.meerkat.rpc(
              key,
              'text_receive',
              {
                ...message,
                sender: {address, publicKey: this.meerkat.peers[key].publicKey},
              },
              (response: boolean) => {
                console.log(`[info]: message transmitted to: ${key}`);
              }
            );
          }
        } catch (e) {}
      }
    );
    this.meerkat.register(
      'ping_server',
      (address: string, message: any, callback: Function) => {
        try {
          callback(true);
        } catch (e) {
          callback(false);
        }
      }
    );

    pouchAPI.set(HostConnect.table, this.id, {
      id: this.id,
      seed: this.meerkat.seed,
      identifier: this.meerkat.identifier,
      name,
      announce: this.meerkat.announce,
      messages: config.messages,
      connected: false,
    });
  }

  getMeerkatIdentifier() {
    return this.meerkat.identifier;
  }
}
