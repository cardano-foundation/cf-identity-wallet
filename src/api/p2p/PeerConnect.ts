import {CardanoPeerConnect} from '@fabianbormann/cardano-peer-connect';
import {
  Bytes,
  Cbor,
  Cip30DataSignature,
  Paginate,
} from '@fabianbormann/cardano-peer-connect/types';
import Meerkat from '@fabianbormann/meerkat';
import {extendMoment} from 'moment-range';
import Moment from 'moment';
import {publish} from '../../utils/events';
import { PouchAPI } from '../../db/database';
// @ts-ignore
const moment = extendMoment(Moment);

export class PeerConnect extends CardanoPeerConnect {
  private meerkat: Meerkat;
  static table = 'peer';
  id: string;
  apiVersion: string = '0.1.0';
  name: string = 'idWallet';
  icon: string = 'data:image/svg+xml,%3Csvg%20xmlns...';

  identity: {address: string; seed: string} = {
    address: '',
    seed: '',
  };

  conected = false;

  constructor(
      name: string,
      config: {
        seed: string | undefined;
        identifier: string | undefined;
        announce: string[];
        messages?: string[];
      }
  ) {
    super();

    this.name = name;

    this.meerkat = new Meerkat({
      seed: config.seed || undefined,
      identifier: config.identifier,
      //announce: ["https://tracker.boostpool.io"]
      announce: [
        'ws://tracker.files.fm:7072/announce',
        'wss://tracker.openwebtorrent.com/announce',
        'wss://tracker.btorrent.xyz/',
        'https://tracker.boostpool.io',
      ],
    });

    this.id = `${name}:${config.identifier}`;

    this.meerkat.on('server', () => {
      console.log(`[info]: connected to server 💬: ${this.meerkat.identifier}`);
      PouchAPI.get(PeerConnect.table, this.id).then(peer => {
        PouchAPI.set(PeerConnect.table, this.id, {
          id: this.id,
          seed: peer.seed,
          identifier: peer.identifier,
          name,
          announce: peer.announce,
          messages: peer.messages,
          connected: true
        }).then(() => publish('updateChat'));
      });
    });

    this.meerkat.register(
        'text_receive',
        (address: string, message: {[key: string]: any}, callback: Function) => {
          try {
            console.log(`[info]: message received: ${JSON.stringify(message)}`);
            console.log(`[info]: transmitted by the server: ${address}`);

            PouchAPI.get(PeerConnect.table, this.id).then(p => {
              const newMessage = {
                preview: message?.message,
                sender: message?.sender,
                self: this.meerkat.peers[message?.sender?.address] === undefined,
                username: message?.username,
                received: true,
                sent: true,
                read: false,
                starred: false,
                date: moment.utc().format('MM-DD HH:mm:ss'),
              };
              PouchAPI.set(PeerConnect.table, this.id, {
                id: this.id,
                seed: this.meerkat.seed,
                identifier: this.meerkat.identifier,
                name,
                announce: p.announce || [],
                messages: [...p.messages, newMessage],
                connected: p.connected || false
              }).then(_ => {publish('updateChat')});
            });
          } catch (e) {
            callback(false);
          }
        }
    );


    PouchAPI.set(PeerConnect.table, this.id, {
      id: this.id,
      seed: this.meerkat.seed,
      identifier: this.meerkat.identifier,
      name,
      announce: this.meerkat.announce,
      messages: config.messages,
      connected: false
    }).then(() => {
      console.log(`[info]: store in DB peer: ${this.id}`);
    });
  }

  /**
   * Send message to host
   *
   * @param identifier - The host identifier to send the message
   * @param peerId - The peer identifier from db
   * @param name - The local channel name
   * @param message - The text message to send
   *
   */
  sendMessage(
      identifier: string,
      message: string,
      username: string = ''
  ): void {
    if (!this.meerkat) return;
    this.meerkat.rpc(
        identifier,
        'text_message',
        {
          message,
          username,
        },
        (response: boolean) => {
          try {
          } catch (e) {}
        }
    );
  }

  /**
   * Ping the server
   *
   * @param identifier - The host identifier to send the message
   * @param peerId - The peer identifier from db
   * @param name - The local channel name
   * @param message - The text message to send
   *
   */
  pingServer(identifier: string, peerId: string, name: string): void {
    if (!this.meerkat) return;

    this.meerkat.rpc(identifier, 'ping_server', {}, (response: boolean) => {
      try {
        PouchAPI.get(PeerConnect.table, this.id).then(peer => {
          PouchAPI.set(PeerConnect.table, this.id, {
            id: this.id,
            seed: this.meerkat.seed,
            identifier: this.meerkat.identifier,
            name,
            announce: peer?.announce || [],
            messages: peer?.messages || [],
            connected: response
          }).then(_ => publish('updateChat'));
        });
      } catch (e) {}
    });
  }

  getBalance(): Cbor {
    return '';
  }

  getChangeAddress(): Cbor {
    return '';
  }

  getCollateral(params?: {amount?: Cbor}): Cbor[] | null {
    return [''];
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
    return [''];
  }

  signData(addr: string, payload: Bytes): Cip30DataSignature {
    return {
      key: '',
      signature: '',
    };
  }

  signTx(tx: Cbor, partialSign: boolean): Cbor {
    return '';
  }

  submitTx(tx: Cbor): string {
    return '';
  }
}
