// @ts-ignore
import Meerkat from '@fabianbormann/meerkat';
import {PeerConnect} from './PeerConnect';
import {HostConnect} from './HostConnect';
import {publish} from '../../utils/events';
import { pouchAPI } from '../../components/AppWrapper';

export class HandleConnect {
  profile: {identifier: string; seed: string} | undefined = undefined;
  hosts: Array<HostConnect> = [];
  peers: Array<PeerConnect> = [];
  trackers: Array<string> = [];
  // trusted hosts/peers
  whitelist: Array<string> = [];

  constructor() {
    pouchAPI.get(PeerConnect.table, 'default-profile')
      .then((profile) => {
        if (profile.success) {
          this.profile = {
            identifier: profile.data.identifier,
            seed: profile.data.seed,
          };
        } else {
          const meerkat = new Meerkat();
          this.profile = {
            identifier: meerkat.identifier,
            seed: meerkat.seed,
          };
          pouchAPI.set(PeerConnect.table, 'default-profile', this.profile);
        }
      });

    pouchAPI.getTable(HostConnect.table).then((hostDocs) => {
      if (!hostDocs) return;
      const hostsList = hostDocs.data.map((host: {doc: any}) => host.doc);
      for (let i = 0; i < hostsList.length; i++) {
        this.restoreChannel(
            hostsList[i].seed,
            hostsList[i].identifier,
            hostsList[i].name,
            hostsList[i].announce,
            hostsList[i].messages
        );
      }
    });

    pouchAPI.getTable(PeerConnect.table).then((peerDocs) => {
      if (!peerDocs) return;
      const peersList = peerDocs.data
        .filter((peer: { doc: { name: string }; }) => peer.doc.name !== undefined)
        .map((peer: {doc: any}) => peer.doc);

      for (let i = 0; i < peersList.length; i++) {
        this.joinChannel(
            peersList[i].name,
            peersList[i].identifier,
            peersList[i].messages
        );
      }
    });
  }

  /**
   * Add a new torrent tracker endpoint for peers discovering
   *
   * @param tracker - The tracker url
   *
   * @example "https://pro.passwordchaos.gimbalabs.io/"
   */
  addTracker(tracker: string): void {
    if (this.trackers.includes(tracker)) return;

    // update global trackers list
    this.trackers = [...this.trackers, tracker];
  }

  /**
   * Create a new channel/server.
   *
   * @param name - The channel object
   *
   */
  createChannel(name: string): void {
    if (!name || this.hosts.some((c) => c.name === name)) return;
    const host = new HostConnect(name, {
      seed: undefined,
      identifier: undefined,
      announce: this.trackers,
    });
    this.hosts = [...this.hosts, host];
    this.joinChannel(name, host.getMeerkatIdentifier());
  }

  /**
   * Restore an existing channel.
   *
   * @param seed - The channel seed
   * @param name - The channel name
   * @param messages - The channel messages
   *
   */
  restoreChannel(
    seed: string,
    identifier: string,
    name: string,
    announce: string[],
    messages: string[]
  ): void {
    // if( !name || this.hosts.some(c => c.name === name)) return;
    const host = new HostConnect(name, {
      seed,
      identifier,
      announce,
      messages,
    });
    this.hosts = [...this.hosts, host];
  }

  /**
   * Join an existing channel.
   *
   * @param name - The chat name
   * @param hostIdentifier - The server address identifier
   *
   */
  joinChannel(
    name: string,
    hostIdentifier: string,
    messages: string[] = []
  ): void {

    const peer = new PeerConnect(name, {
      seed: this.profile?.seed,
      identifier: hostIdentifier,
      announce: this.trackers,
      messages,
    });

    this.peers = [...this.peers, peer];
  }

  /**
   * Send a text message
   *
   * @param peerId - The peer id
   * @param identifier - The host identifier to send the message
   * @param name - The local channel name
   * @param message - The text message to send
   *
   */
  sendMessage(
    identifier: string,
    peerId: string,
    message: string,
    username: string = ''
  ): void {
    const meerkats = this.peers;
    for (let i = 0; i < meerkats.length; i++) {
      if (meerkats[i].id === peerId) {
        meerkats[i].sendMessage(identifier, message, username);
        break;
      }
    }
  }

  /**
   * Ping the server
   *
   * @param peerId - The peer id
   * @param identifier - The host identifier to send the message
   * @param name - The local channel name
   *
   */
  pingServer(identifier: string, peerId: string, name: string): void {
    const meerkats = this.peers;
    for (let i = 0; i < meerkats.length; i++) {
      if (meerkats[i].id === peerId) {
        meerkats[i].pingServer(identifier, peerId, name);
        break;
      }
    }
  }

  /**
   * Get any peers
   */
  static async getPeer(tableName: string, id: string) {
    return await pouchAPI.get(tableName, id);
  }

  /**
   * Get host peers
   */
  static async getHosts() {
    const hosts = await pouchAPI.getTable(HostConnect.table);
    return hosts.data?.map((host: {doc: any}) => host.doc) || [];
  }

  /**
   * Get peers
   */
  static async getPeers() {
    const peers = await pouchAPI.getTable(PeerConnect.table);
    return peers.data?.map((peer: {doc: any}) => peer.doc) || [];
  }

  /**
   * Remove peer
   */
  static async removePeer(id: string) {
    await pouchAPI.remove(PeerConnect.table, id);
  }

  /**
   * Remove host
   */
  static async removeHost(id: string) {
    await pouchAPI.remove(HostConnect.table, id);
  }

  /**
   * Get full peer list(host+peer)   *
   */
  static async getAllPeers() {
    const hosts = await pouchAPI.getTable(HostConnect.table);
    const peers = await pouchAPI.getTable(PeerConnect.table);
    return [
      ...hosts.data.map((host: {doc: any}) => host.doc),
      ...peers.data.map((peer: {doc: any}) => peer.doc),
    ];
  }
}
