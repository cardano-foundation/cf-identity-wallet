import Meerkat from '@fabianbormann/meerkat';
import {getHost, setHost} from '../../db';
import {extendMoment} from 'moment-range';
import Moment from 'moment';
import {publish} from "../../utils/events";
// @ts-ignore
const moment = extendMoment(Moment);

export class HostConnect {
  private table = 'host';
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
    this.id = `${this.table}:${name}:${this.meerkat.identifier}`;

    //console.log(`Share this address ${this.meerkat.address()} with your clients`);
    let connected = false;
    this.meerkat.on('connections', (clients) => {
      console.log(`[info]: connections: ${clients}`);
      if (!connected) {
        connected = true;
        console.log(`[info]: server ready: ${this.meerkat.identifier}`);
        // TODO: store clients

        // TODO: remove store messages in server
        if (clients) {
          getHost(this.id).then((host) => {
            setHost(
              this.id,
              host.seed,
              host.identifier,
              name,
              host.announce,
              host.messages,
              true
            ).then((_) => {
              console.log(
                  `[info]: the server is ready with address 💬: ${this.meerkat.identifier}`
              );
              publish('updateChat');
            });
          });
        } else {
          getHost(this.id).then((host) => {
            setHost(
              this.id,
              host.seed,
              host.identifier,
              name,
              host.announce,
              host.messages,
              false
            ).then((_) => {
              console.log(`[info]: loading server... 💬`);
              publish('updateChat');
            });
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
                {...message, sender: {address, publicKey: this.meerkat.peers[key].publicKey}},
                (response: boolean) => {
                  console.log(`[info]: message transmitted to: ${key}`);
                }
            );
          }
        } catch (e) {
        }
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

    setHost(
        this.id,
        this.meerkat.seed,
        this.meerkat.identifier,
        name,
        this.meerkat.announce,
        config.messages
    );
  }

  getMeerkatIdentifier() {
    return this.meerkat.identifier;
  }
}
