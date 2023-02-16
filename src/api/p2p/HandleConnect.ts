// @ts-ignore
import Meerkat from '@fabianbormann/meerkat';
import {PeerConnect} from './PeerConnect';
import {HostConnect} from './HostConnect';
import { PouchAPI } from '../../db/database';

export class HandleConnect {
  profile: {identifier: string; seed: string} | undefined = undefined;
  hosts: Array<HostConnect> = [];
  peers: Array<PeerConnect> = [];
  trackers: Array<string> = [];
  // trusted hosts/peers
  whitelist: Array<string> = [];

  constructor() {

    PouchAPI.get(PeerConnect.table, 'default-profile').then(profile => {
      if (profile) {
        this.profile = {
          identifier: profile.identifier,
          seed: profile.seed,
        };
      } else {
        const meerkat = new Meerkat();
        this.profile = {
          identifier: meerkat.identifier,
          seed: meerkat.seed,
        };
        PouchAPI.set(PeerConnect.table, 'default-profile', this.profile);
      }
    });

    PouchAPI.getTable(HostConnect.table).then(hostDocs => {
      if (!hostDocs) return;
      hostDocs = hostDocs.map((host: { doc: any; }) => host.doc);
      for (const [_, value] of Object.entries(hostDocs)) {
        this.restoreChannel(
            // @ts-ignore
            value.seed,
            // @ts-ignore
            value.identifier,
            // @ts-ignore
            value.name,
            // @ts-ignore
            value.announce,
            // @ts-ignore
            value.messages
        );
      }
      PouchAPI.getTable(PeerConnect.table).then(peerDocs => {
        if (!peerDocs) return;
        peerDocs = peerDocs.map((peer: { doc: any; }) => peer.doc);
        for (let i = 0; i < peerDocs.length; i++) {
          this.joinChannel(peerDocs[i].name, peerDocs[i].identifier, peerDocs[i].messages);
        }
      });
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
    name: string,
    message: string,
    username: string = ''
  ): void {
    const meerkats = this.peers;
    for (let i = 0; i < meerkats.length; i++) {
      if (meerkats[i].id === peerId) {
        meerkats[i].sendMessage(identifier, peerId, name, message, username);
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
   * Get host peers
   */
  static async getHosts() {
    const hosts = await PouchAPI.getTable(HostConnect.table);
    return hosts.map((host: { doc: any; }) => host.doc);
  }

  /**
   * Get peers
   */
  static async getPeers() {
    const peers = await PouchAPI.getTable(PeerConnect.table);
    return peers.map((peer: { doc: any; }) => peer.doc);
  }

  /**
   * Get full peer list(host+peer)   *
   */
  static async getAllPeers() {
    const hosts = await PouchAPI.getTable(HostConnect.table);
    const peers = await PouchAPI.getTable(PeerConnect.table);
    return [...hosts.map((host: { doc: any; }) => host.doc), ...peers.map((peer: { doc: any; }) => peer.doc)]
  }
}
