import {
	createPopup,
	extractKeyHash,
	getAddress,
	getBalance,
	getCollateral,
	getNetwork,
	getRewardAddress,
	getUtxos,
	isWhitelisted,
	submitTx,
	verifyPayload,
	verifyTx,
} from '../extension';
import {Messaging} from './messaging';
import {APIError, METHOD, POPUP, SENDER, TARGET} from './config';
import {get, set} from '../../db/storage';
import Meerkat from '@fabianbormann/meerkat';
import {
	getAccountFromDb,
	getNetworkFromDb,
	getSettingsFromDb,
	updateAccountByNameAndNetworkInDb,
	updateAccountByNetworkInDb,
} from '../../db';
import {setAccount} from '../../store/actions';
import {extendMoment} from 'moment-range';
import Moment from 'moment';
// @ts-ignore
const moment = extendMoment(Moment);

const app = Messaging.createBackgroundController();

/**
 * listens to requests from the web context
 */

app.add(METHOD.getBalance, (request, sendResponse) => {
	getBalance()
		.then((value) => {
			sendResponse({
				// @ts-ignore
				id: request.id,
				// @ts-ignore
				data: Buffer.from(value.to_bytes(), 'hex').toString('hex'),
				target: TARGET,
				sender: SENDER.extension,
			});
		})
		.catch((e) => {
			sendResponse({
				// @ts-ignore
				id: request.id,
				error: e,
				target: TARGET,
				sender: SENDER.extension,
			});
		});
});

app.add(METHOD.enable, async (request, sendResponse) => {
	// @ts-ignore
	isWhitelisted(request.origin)
		.then(async (whitelisted) => {
			// @ts-ignore
			if (whitelisted) {
				sendResponse({
					// @ts-ignore
					id: request.id,
					data: true,
					target: TARGET,
					sender: SENDER.extension,
				});
			} else {
				const response = await createPopup(POPUP.internal)
					.then((tab) => Messaging.sendToPopupInternal(tab, request))
					.then((response) => response);
				if (response.data === true) {
					sendResponse({
						// @ts-ignore
						id: request.id,
						data: true,
						target: TARGET,
						sender: SENDER.extension,
					});
				} else if (response.error) {
					sendResponse({
						// @ts-ignore
						id: request.id,
						error: response.error,
						target: TARGET,
						sender: SENDER.extension,
					});
				} else {
					sendResponse({
						// @ts-ignore
						id: request.id,
						error: APIError.InternalError,
						target: TARGET,
						sender: SENDER.extension,
					});
				}
			}
		})
		.catch(() =>
			sendResponse({
				// @ts-ignore
				id: request.id,
				error: APIError.InternalError,
				target: TARGET,
				sender: SENDER.extension,
			})
		);
});

app.add(METHOD.isEnabled, (request, sendResponse) => {
	// @ts-ignore
	isWhitelisted(request.origin)
		.then((whitelisted) => {
			sendResponse({
				// @ts-ignore
				id: request.id,
				data: whitelisted,
				target: TARGET,
				sender: SENDER.extension,
			});
		})
		.catch(() => {
			sendResponse({
				// @ts-ignore
				id: request.id,
				error: APIError.InternalError,
				target: TARGET,
				sender: SENDER.extension,
			});
		});
});

app.add(METHOD.getAddress, async (request, sendResponse) => {
	const address = await getAddress();
	// @ts-ignore
	if (address) {
		sendResponse({
			// @ts-ignore
			id: request.id,
			data: address,
			target: TARGET,
			sender: SENDER.extension,
		});
	} else {
		sendResponse({
			// @ts-ignore
			id: request.id,
			error: APIError.InternalError,
			target: TARGET,
			sender: SENDER.extension,
		});
	}
});

app.add(METHOD.getRewardAddress, async (request, sendResponse) => {
	try {
		const address = await getRewardAddress();
		// @ts-ignore
		if (address) {
			sendResponse({
				// @ts-ignore
				id: request.id,
				data: address,
				target: TARGET,
				sender: SENDER.extension,
			});
		} else {
			sendResponse({
				// @ts-ignore
				id: request.id,
				error: APIError.InternalError,
				target: TARGET,
				sender: SENDER.extension,
			});
		}
	} catch (e) {
		sendResponse({
			// @ts-ignore
			id: request.id,
			error: APIError.InternalError,
			target: TARGET,
			sender: SENDER.extension,
		});
	}
});

app.add(METHOD.getUtxos, (request, sendResponse) => {
	// @ts-ignore
	getUtxos(request.data.amount, request.data.paginate)
		.then((utxos) => {
			// @ts-ignore
			utxos = utxos
				? // @ts-ignore
				  utxos.map((utxo) =>
						Buffer.from(utxo.to_bytes(), 'hex').toString('hex')
				  )
				: null;
			sendResponse({
				// @ts-ignore
				id: request.id,
				data: utxos,
				target: TARGET,
				sender: SENDER.extension,
			});
		})
		.catch((e) => {
			sendResponse({
				// @ts-ignore
				id: request.id,
				error: e,
				target: TARGET,
				sender: SENDER.extension,
			});
		});
});

app.add(METHOD.getCollateral, (request, sendResponse) => {
	getCollateral()
		.then((utxos) => {
			// @ts-ignore
			utxos = utxos.map((utxo) =>
				Buffer.from(utxo.to_bytes(), 'hex').toString('hex')
			);
			sendResponse({
				// @ts-ignore
				id: request.id,
				data: utxos,
				target: TARGET,
				sender: SENDER.extension,
			});
		})
		.catch((e) => {
			sendResponse({
				// @ts-ignore
				id: request.id,
				error: e,
				target: TARGET,
				sender: SENDER.extension,
			});
		});
});

app.add(METHOD.submitTx, (request, sendResponse) => {
	// @ts-ignore
	submitTx(request.data)
		.then((txHash) => {
			sendResponse({
				// @ts-ignore
				id: request.id,
				data: txHash,
				target: TARGET,
				sender: SENDER.extension,
			});
		})
		.catch((e) => {
			sendResponse({
				// @ts-ignore
				id: request.id,
				target: TARGET,
				error: e,
				sender: SENDER.extension,
			});
		});
});

app.add(METHOD.isWhitelisted, async (request, sendResponse) => {
	// @ts-ignore
	const whitelisted = await isWhitelisted(request.origin);
	// @ts-ignore
	if (whitelisted) {
		sendResponse({
			data: whitelisted,
			target: TARGET,
			sender: SENDER.extension,
		});
	} else {
		sendResponse({
			error: APIError.Refused,
			target: TARGET,
			sender: SENDER.extension,
		});
	}
});

app.add(METHOD.getNetworkId, async (request, sendResponse) => {
	const networkMap = {mainnet: 1, testnet: 0};
	const network = await getNetwork();
	// @ts-ignore
	if (network)
		sendResponse({
			// @ts-ignore
			id: request.id,
			// @ts-ignore
			data: networkMap[network.id],
			target: TARGET,
			sender: SENDER.extension,
		});
	else
		sendResponse({
			// @ts-ignore
			id: request.id,
			error: APIError.InternalError,
			target: TARGET,
			sender: SENDER.extension,
		});
});

app.add(METHOD.signData, async (request, sendResponse) => {
	try {
		// @ts-ignore
		verifyPayload(request.data.payload);
		// @ts-ignore
		await extractKeyHash(request.data.address);

		const response = await createPopup(POPUP.internal)
			.then((tab) => Messaging.sendToPopupInternal(tab, request))
			.then((response) => response);

		if (response.data) {
			sendResponse({
				// @ts-ignore
				id: request.id,
				data: response.data,
				target: TARGET,
				sender: SENDER.extension,
			});
		} else if (response.error) {
			sendResponse({
				// @ts-ignore
				id: request.id,
				error: response.error,
				target: TARGET,
				sender: SENDER.extension,
			});
		} else {
			sendResponse({
				// @ts-ignore
				id: request.id,
				error: APIError.InternalError,
				target: TARGET,
				sender: SENDER.extension,
			});
		}
	} catch (e) {
		sendResponse({
			// @ts-ignore
			id: request.id,
			error: e,
			target: TARGET,
			sender: SENDER.extension,
		});
	}
});

app.add(METHOD.signTx, async (request, sendResponse) => {
	try {
		// @ts-ignore
		await verifyTx(request.data.tx);
		const response = await createPopup(POPUP.internal)
			.then((tab) => Messaging.sendToPopupInternal(tab, request))
			.then((response) => response);

		if (response.data) {
			sendResponse({
				// @ts-ignore
				id: request.id,
				data: response.data,
				target: TARGET,
				sender: SENDER.extension,
			});
		} else if (response.error) {
			sendResponse({
				// @ts-ignore
				id: request.id,
				error: response.error,
				target: TARGET,
				sender: SENDER.extension,
			});
		} else {
			sendResponse({
				// @ts-ignore
				id: request.id,
				error: APIError.InternalError,
				target: TARGET,
				sender: SENDER.extension,
			});
		}
	} catch (e) {
		sendResponse({
			// @ts-ignore
			id: request.id,
			error: e,
			target: TARGET,
			sender: SENDER.extension,
		});
	}
});

export let p2p_servers_dict = {};
export let p2p_servers_list = [];
export let p2p_clients_dict = {};
export let p2p_clients_list = [];
app.add(METHOD.sendMessageP2P, async (request, sendResponse) => {
	try {
		console.log('METHOD.sendMessageP2P');
		console.log('request3');
		console.log(request);

		// @ts-ignore
		if (!request || !request?.room?.name?.length) {
			console.log('Not name in request.room');
			console.log(request);
			return;
		}

		// @ts-ignore
		const clientAddress = request?.room?.clientAddress || '';
		// @ts-ignore
		const message = request?.message || '';

		let meerkat = new Meerkat({identifier: clientAddress || ''});

		meerkat.announce = ['https://pro.passwordchaos.gimbalabs.io/'];

		console.log('new meerkat');

		meerkat.on('server', () => {
			console.log(
				`[info]: SendMessage-> connected to server: ${clientAddress}`
			);
			meerkat.rpc(
				clientAddress,
				'message',
				{message},
				(response: (arg0: string) => void) => {
					console.log(`Message sent :${message}`);
					console.log(`To server :${clientAddress}`);
					console.log(`By user :${meerkat.address()}`);
					//response(`Message sent: ${message}`);
					meerkat.close();
					console.log(`Connection is closed`);
				}
			);
		});

		console.log('sendResponse_');

		console.log('p2p_servers_dict');
		console.log(p2p_servers_dict);
		sendResponse({
			// @ts-ignore
			id: 'Send message done',
			target: TARGET,
			sender: SENDER.extension,
		});
	} catch (e) {}
});

app.add(METHOD.joinServerP2P, async (request, sendResponse) => {
	try {
		console.log('METHOD.joinServerP2P');
		console.log('request2');
		console.log(request);

		// @ts-ignore
		if (!request || !request?.room?.name?.length) {
			console.log('Not name in request.room');
			console.log(request);
			return;
		}

		// @ts-ignore
		const roomName = request?.room?.name || '';
		// @ts-ignore
		let clientAddress = request?.room?.clientAddress || '';
		// @ts-ignore
		const accountName = request?.accountName || '';
		// @ts-ignore
		const network = request?.network || '';

		let meerkat: Meerkat;
		// @ts-ignore
		if (p2p_clients_dict[roomName] === undefined) {
			console.log('new meerkat0');
			meerkat = new Meerkat({identifier: clientAddress || ''});
		} else {
			console.log('get meerkat0');
			// @ts-ignore
			console.log(p2p_clients_dict[roomName]);
			// @ts-ignore
			meerkat = p2p_clients_dict[roomName];
			clientAddress = meerkat.address();
		}

		meerkat.announce = ['https://pro.passwordchaos.gimbalabs.io/'];

		meerkat.on('server', () => {
			console.log('[info]: connected to server');

			getAccountFromDb().then((account) => {
				let acc = account[network];
				let clientRooms = acc?.rooms?.client || {};
				clientRooms[roomName] = {
					...clientRooms,
					name: roomName,
					seed: meerkat.seed,
					clientAddress: clientAddress,
					connected: true,
				};
				acc.rooms.client = clientRooms;
				updateAccountByNameAndNetworkInDb(network, accountName, acc);
				setAccount(acc);
			});
		});

		meerkat.register(
			'message',
			(address: any, args: any, callback: (arg0: string) => void) => {
				console.log(
					`[info]:joinServerP2P message rpc call invoked by address ${address} into window.cardano`
				);

				getAccountFromDb().then((account) => {
					let acc = account[network];
					let serverRooms = acc?.rooms?.server || {};

					let serverName = Object.keys(serverRooms).find((sname) => {
						return serverRooms[sname].seed === meerkat.seed;
					});

					if (!serverName) return;

					serverRooms[serverName] = {
						...serverRooms[serverName],
						messages: serverRooms[serverName]?.messages?.length
							? [...serverRooms[serverName]?.messages, args]
							: [args],
					};
					acc.rooms.server = serverRooms;

					updateAccountByNameAndNetworkInDb(network, accountName, acc);
					setAccount(acc);
				});
				callback('callback from message in joinServerP2P');
			}
		);
		// Update background state
		// @ts-ignore
		p2p_clients_dict[roomName] = meerkat;
		console.log('p2p_clients_dict in localStorage');
		console.log(p2p_clients_dict);
		//await set("cardano-peers-client", p2p_clients_dict);

		sendResponse({
			// @ts-ignore
			id: 'room joined',
			target: TARGET,
			sender: SENDER.extension,
		});
	} catch (e) {
		sendResponse({
			// @ts-ignore
			id: 'request.error',
			error: e,
			target: TARGET,
			sender: SENDER.extension,
		});
	}
});

//app.add(METHOD.loadP2P, async (request, sendResponse) => {
app.add(METHOD.createServerP2P, async (request, sendResponse) => {
	console.log('METHOD.createServerP2P');
	console.log('request1');
	console.log(request);

	// @ts-ignore
	if (!request || !request?.room?.name?.length) {
		console.log('Not name in request.room');
		console.log(request);
		return;
	}

	// @ts-ignore
	const roomName = request?.room?.name || '';
	// @ts-ignore
	const accountName = request?.accountName || '';
	// @ts-ignore
	const network = request?.network || '';

	try {
		let meerkat: Meerkat;
		// @ts-ignore
		if (p2p_servers_dict[roomName] === undefined) {
			meerkat = new Meerkat();
		} else {
			// @ts-ignore
			meerkat = p2p_servers_dict[roomName];
		}

		meerkat.announce = ['https://pro.passwordchaos.gimbalabs.io/'];

		let connected = false;
		let updatedAccount = {};
		meerkat.on('connections', (clients: number) => {
			if (clients === 0 && connected === false) {
				connected = true;
				console.log('[info]: server ready');
				getAccountFromDb(accountName).then((account) => {
					let acc = account[network];
					let serverRooms = acc?.rooms?.server || {};
					serverRooms[roomName] = {
						...serverRooms,
						name: roomName,
						seed: meerkat.seed,
						clientAddress: meerkat.address(),
						connected: true,
						numClients: clients,
					};
					acc.rooms.server = serverRooms;

					updateAccountByNameAndNetworkInDb(network, accountName, acc);
					updatedAccount = acc;
					setAccount(acc);
				});
			}
			console.log(`[info]: ${clients} clients connected in room ${roomName}`);
		});

		meerkat.register(
			'message',
			(address: any, args: any, callback: (arg0: string) => void) => {
				console.log(
					`[info]:createServerP2P message rpc call invoked by address ${address} into window.cardano`
				);

				getAccountFromDb(accountName).then((account) => {
					let acc = account[network];
					let serverRooms = acc?.rooms?.server || {};

					let serverName = Object.keys(serverRooms).find((sname) => {
						return serverRooms[sname].seed === meerkat.seed;
					});

					if (!serverName) return;

					const newMessage = {
						sender: address,
						text: args,
						time: moment.utc().format('YYYY-MM-DD H:mm:ss'),
					};
					serverRooms[serverName] = {
						...serverRooms[serverName],
						messages: serverRooms[serverName]?.messages?.length
							? [...serverRooms[serverName]?.messages, newMessage]
							: [newMessage],
					};
					acc.rooms.server = serverRooms;

					updateAccountByNameAndNetworkInDb(network, accountName, acc);
					updatedAccount = acc;
					setAccount(acc);
				});

				callback('callback from message');
			}
		);

		// Update background state
		// @ts-ignore
		p2p_servers_dict[roomName] = meerkat;
		console.log('try to save in localStorage');
		console.log(p2p_servers_dict);
		//await set("cardano-peers-server", p2p_servers_dict);

		sendResponse({
			// @ts-ignore
			id: 'room created',
			target: TARGET,
			sender: SENDER.extension,
			updatedAccount,
		});
	} catch (e) {
		console.log('Error in loadP2P bg');
		console.log(e);
		sendResponse({
			// @ts-ignore
			id: 'request.id',
			error: e,
			target: TARGET,
			sender: SENDER.extension,
		});
	}
});

app.add(METHOD.removeServerP2P, async (request, sendResponse) => {
	try {
		console.log('METHOD.removeServerP2P');
		console.log('request4');
		console.log(request);

		// @ts-ignore
		if (!request || !request?.room?.name?.length) {
			console.log('Not name in request.room');
			console.log(request);
			return;
		}

		// @ts-ignore
		const roomName = request?.room?.name || '';

		// @ts-ignore
		if (p2p_servers_dict[roomName] !== undefined) {
			// @ts-ignore
			let meerkat: Meerkat = p2p_servers_dict[roomName];

			// @ts-ignore
			delete p2p_servers_dict[roomName];
			meerkat.close();
			console.log(`[info]: The server closed is: ${roomName}`);

			sendResponse({
				// @ts-ignore
				id: 'room removed',
				target: TARGET,
				sender: SENDER.extension,
			});
		}
	} catch (e) {
		sendResponse({
			// @ts-ignore
			id: 'request.error',
			error: e,
			target: TARGET,
			sender: SENDER.extension,
		});
	}
});
app.add(METHOD.removeJoinedP2P, async (request, sendResponse) => {
	try {
		console.log('METHOD.removeServerP2P');
		console.log('request4');
		console.log(request);

		// @ts-ignore
		if (!request || !request?.room?.name?.length) {
			console.log('Not name in request.room');
			console.log(request);
			return;
		}

		// @ts-ignore
		const roomName = request?.room?.name || '';

		// @ts-ignore
		if (p2p_clients_dict[roomName] !== undefined) {
			// @ts-ignore
			let meerkat: Meerkat = p2p_clients_dict[roomName];

			// @ts-ignore
			delete p2p_clients_dict[roomName];
			meerkat.close();
			console.log(`[info]: The server closed is: ${roomName}`);

			sendResponse({
				// @ts-ignore
				id: 'room removed',
				target: TARGET,
				sender: SENDER.extension,
			});
		}
	} catch (e) {
		sendResponse({
			// @ts-ignore
			id: 'request.error',
			error: e,
			target: TARGET,
			sender: SENDER.extension,
		});
	}
});

app.listen();

//delete localStorage globalModel

// @ts-ignore
/*
chrome.runtime.onStartup.addListener(function () {
    const entry = Object.keys(extensionStorage).find((l) =>
        l.includes('globalModel')
    );
    // @ts-ignore
    extensionStorage.removeItem(entry);
});
const entry = Object.keys(extensionStorage).find((l) => l.includes('globalModel'));
// @ts-ignore
extensionStorage.removeItem(entry);

 */
