import {CardanoPeerConnect} from '@fabianbormann/cardano-peer-connect';
import {Bytes, Cbor, Cip30DataSignature, Paginate,} from '@fabianbormann/cardano-peer-connect/types';
import Meerkat from '@fabianbormann/meerkat';
import {getPeer, setPeer} from '../../db';
import {extendMoment} from 'moment-range';
import Moment from 'moment';
import {publish} from '../../utils/events';
// @ts-ignore
const moment = extendMoment(Moment);

export class PeerConnect extends CardanoPeerConnect {
  private meerkat: Meerkat;
  private table = 'peer';
  id: string;
  apiVersion: string = '0.1.0';
  name: string = 'idWallet';
  icon: string = 'data:image/svg+xml,%3Csvg%20xmlns...';

  identity: {address: string; seed: string} = {
    address: '',
    seed: '',
  };

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

    this.id = `${this.table}:${name}:${config.identifier}`;

    this.meerkat.on('server', () => {
      console.log(`[info]: connected to server 💬: ${this.meerkat.identifier}`);
      getPeer(this.id).then((peer) => {
        setPeer(
            this.id,
            peer.seed,
            peer.identifier,
            name,
            peer.announce,
            peer.messages,
            true
        ).then((_) => {
          publish('updateChat');
        });
      });
    });

    this.meerkat.register(
      'text_receive',
      (address: string, message: {[key: string]: any}, callback: Function) => {
        try {
          console.log(`[info]: message received: ${JSON.stringify(message)}`);
          console.log(`[info]: transmitted by the server: ${address}`);

          getPeer(this.id).then((peer) => {
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
            setPeer(
              this.id,
              peer.seed,
              peer.identifier,
              name,
              peer.announce,
              [...peer.messages, newMessage],
              peer.connected
            ).then((_) => {
              publish('updateChat');
              callback(true);
            });
          });
        } catch (e) {
          callback(false);
        }
      }
    );

    setPeer(
      this.id,
      this.meerkat.seed,
      this.meerkat.identifier,
      name,
      this.meerkat.announce,
      config.messages
    );
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
      peerId: string,
      name: string,
      message: string,
      username: string = ''
  ): void {
    if (!this.meerkat) return;
    this.meerkat.rpc(
      identifier,
        'text_message',
        {
          message,
          username
        },
        (response: boolean) => {
          try {
          } catch (e) {
          }
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
  pingServer(
      identifier: string,
      peerId: string,
      name: string
  ): void {
    if (!this.meerkat) return;

    this.meerkat.rpc(
        identifier,
        'ping_server',
        {},
        (response: boolean) => {
          try {
            getPeer(this.id).then((peer) => {
              setPeer(
                  this.id,
                  peer.seed,
                  peer.identifier,
                  name,
                  peer.announce,
                  peer.messages,
                  response
              ).then((_) => {
                publish('updateChat');
              });
            });
          } catch (e) {
          }
        }
    );
  }

  getBalance(): Cbor {
    return '';
  }

  getChangeAddress(): Cbor {
    return '';
  }

  getCollateral(params?: { amount?: Cbor }): Cbor[] | null {
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
