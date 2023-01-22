import Meerkat from '@fabianbormann/meerkat';
import {PeerConnect} from './PeerConnect';
import {HostConnect} from './HostConnect';
import {
	getHostList,
	getPeerList,
	getPeerProfile,
	setPeerProfile,
} from '../../db';

export class HandleConnect {
	profile: {identifier: string; seed: string} | undefined = undefined;
	hosts: Array<HostConnect> = [];
	peers: Array<PeerConnect> = [];
	trackers: Array<string> = [];
	// trusted hosts/peers
	whitelist: Array<string> = [];

	constructor() {
		getPeerProfile('global').then((profile) => {
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
				setPeerProfile('global', meerkat.seed, meerkat.identifier, '', []);
			}
		});

		getHostList().then((hosts) => {
			if (!hosts) return;

			for (const [_, value] of Object.entries(hosts)) {
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
		});

		getPeerList().then((peers) => {
			if (!peers) return;
			for (const [_, value] of Object.entries(peers)) {
				// @ts-ignore
				this.joinChannel(value.name, value.identifier, value.messages);
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
		this.joinChannel(`${name}:peer`, host.getMeerkatIdentifier());
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
		peerId: string,
		identifier: string,
		name: string,
		message: string
	): void {
		const meerkats = [...this.hosts, ...this.peers];
		for (let i = 0; i < meerkats.length; i++) {
			if (meerkats[i].id === peerId) {
				meerkats[i].sendMessage(identifier, name, message);
			}
		}
	}
}

export const handleConnect = new HandleConnect();
