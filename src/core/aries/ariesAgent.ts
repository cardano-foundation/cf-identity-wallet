import {
  InitConfig,
  Agent,
  AgentDependencies,
  RecordNotFoundError,
  DidsModule,
  KeyDidResolver,
  KeyType,
  DidRecord,
} from "@aries-framework/core";
import { EventEmitter } from "events";
import { CapacitorFileSystem } from "./dependencies";
import {
  IonicStorageModule,
  GeneralStorageModule,
  MiscRecord,
  MiscRecordId,
  CryptoAccountRecord,
} from "./modules";
import { HttpOutboundTransport } from "./transports";
import { LabelledKeyDidRegistrar } from "./dids";
import { GetIdentityResult, IdentityType } from "./ariesAgent.types";
import type { DIDDetails, IdentityShortDetails } from "./ariesAgent.types";
import { NetworkType } from "../cardano/addresses.types";
import { SignifyModule } from "./modules/signify";

const config: InitConfig = {
  label: "idw-agent",
  walletConfig: {
    id: "idw",
    key: "idw", // Right now, this key isn't used as we don't have encryption.
  },
  autoUpdateStorageOnStartup: true,
};

const agentDependencies: AgentDependencies = {
  FileSystem: CapacitorFileSystem,
  EventEmitterClass: EventEmitter,
  fetch: global.fetch as unknown as AgentDependencies["fetch"],
  WebSocketClass:
    global.WebSocket as unknown as AgentDependencies["WebSocketClass"],
};

// @TODO - foconnor: Once color stories in place this should be stored in DB.
const PRESET_COLORS: [string, string][] = [
  ["#92FFC0", "#47FF94"],
  ["#FFBC60", "#FFA21F"],
  ["#D9EDDF", "#ACD8B9"],
  ["#47E0FF", "#00C6EF"],
  ["#FF9780", "#FF5833"],
];

class AriesAgent {
  static readonly DID_MISSING_METHOD = "DID method missing for stored DID";
  static readonly DID_MISSING_DISPLAY_NAME =
    "DID display name missing for stored DID";
  static readonly DID_MISSING_DID_DOC =
    "DID document missing or unresolvable for stored DID";
  static readonly UNEXPECTED_DID_DOC_FORMAT =
    "DID document format is missing expected values for stored DID";

  private static instance: AriesAgent;
  private readonly agent: Agent;
  static ready = false;

  private constructor() {
    this.agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: {
        ionicStorage: new IonicStorageModule(),
        generalStorage: new GeneralStorageModule(),
        dids: new DidsModule({
          registrars: [new LabelledKeyDidRegistrar()],
          resolvers: [new KeyDidResolver()],
        }),
        signify: new SignifyModule()
      },
    });
    this.agent.registerOutboundTransport(new HttpOutboundTransport());
  }

  static get agent() {
    if (!this.instance) {
      this.instance = new AriesAgent();
    }
    return this.instance;
  }

  async start(): Promise<void> {
    await this.agent.initialize();
    await this.agent.modules.signify.start();
    AriesAgent.ready = true;
  }

  async storeMiscRecord(id: MiscRecordId, value: string) {
    await this.agent.modules.generalStorage.saveMiscRecord(
      new MiscRecord({ id, value })
    );
  }

  async getMiscRecordValueById(id: MiscRecordId): Promise<string | undefined> {
    try {
      return (await this.agent.modules.generalStorage.getMiscRecordById(id))
        .value;
    } catch (e) {
      if (e instanceof RecordNotFoundError) {
        return undefined;
      }
      throw e;
    }
  }

  async storeCryptoAccountRecord(
    id: string,
    addresses: Map<NetworkType, Map<number, Map<number, string[]>>>,
    rewardAddresses: Map<NetworkType, string[]>,
    displayName: string,
    usesIdentitySeedPhrase = false
  ): Promise<void> {
    await this.agent.modules.generalStorage.saveCryptoRecord(
      new CryptoAccountRecord({
        id,
        addresses,
        rewardAddresses,
        displayName,
        usesIdentitySeedPhrase,
      })
    );
  }

  async cryptoAccountIdentitySeedPhraseExists(): Promise<boolean> {
    return this.agent.modules.generalStorage.cryptoAccountIdentitySeedPhraseExists();
  }

  async removeCryptoAccountRecordById(id: string): Promise<void> {
    await this.agent.modules.generalStorage.removeCryptoRecordById(id);
  }

  async createIdentity(
    type: IdentityType,
    displayName: string
  ): Promise<string | undefined> {
    if (type === IdentityType.KERI) {
      // @TODO - foconnor: We need to create an Aries record here to store display name etc
      return this.agent.modules.signify.createIdentifier();
    }
    const result = await this.agent.dids.create({
      method: type,
      displayName: displayName,
      options: { keyType: KeyType.Ed25519 },
    });
    return result.didState.did;
  }

  async getIdentities(
    method?: string,
    did?: string
  ): Promise<IdentityShortDetails[]> {
    const identities: IdentityShortDetails[] = [];

    const dids = await this.agent.dids.getCreatedDids({ method, did });
    for (let i = 0; i < dids.length; i++) {
      const did = dids[i];
      const method = <IdentityType>did.getTag("method")?.toString();
      const displayName = did.getTag("displayName")?.toString();
      if (method && displayName) {
        identities.push({
          method,
          displayName,
          id: did.did,
          createdAtUTC: did.createdAt.toISOString(),
          colors: PRESET_COLORS[i % PRESET_COLORS.length],
        });
      }
    }

    if (!method && !did) {
      const aids = await this.agent.modules.signify.getIdentifiersDetailed();
      for (let i = 0; i < aids.length; i++) {
        const aid = aids[i];
        // @TODO - foconnor: We need wrapper records in Aries to map to these with display name, created at, colors etc for UI.
        identities.push({
          method: IdentityType.KERI,
          displayName: aid.name.substr(0, 10),  // @TODO - foconnor: This is not the user defined one.
          id: aid.prefix,
          createdAtUTC: aid.state.dt,
          colors: PRESET_COLORS[(i + dids.length) % PRESET_COLORS.length],
        });
      }
    }

    return identities;
  }

  async getIdentity(identifier: string): Promise<GetIdentityResult | undefined> {
    if (identifier.startsWith("did:")) {
      const storedDid = await this.agent.dids.getCreatedDids({ did: identifier });
      if (!(storedDid && storedDid.length)) {
        return undefined;
      }

      const method = <IdentityType>storedDid[0].getTag("method")?.toString();
      if (!method) {
        throw new Error(`${AriesAgent.DID_MISSING_METHOD} ${identifier}`);
      }
      if (method === IdentityType.KEY) {
        return {
          type: IdentityType.KEY,
          result: await this.getIdentityFromDidKeyRecord(storedDid[0])
        };
      }
    } else {
      // @TODO - foconnor: This is hugely inefficient but will change once we store
      // enough information in the database to map the identifiers.
      const aids = await this.agent.modules.signify.getIdentifiersDetailed();
      for (let i = 0; i < aids.length; i++) {
        const aid = aids[i];
        if (aid.prefix === identifier) {
          return {
            type: IdentityType.KERI,
            result: {
              id: aid.prefix,
              method: IdentityType.KERI,
              displayName: aid.name.substr(0, 10),  // @TODO - foconnor: This is not the user defined one.
              createdAtUTC: aid.state.dt,  // @TODO - foconnor: This is actually of the last event, so this is wrong - OK for now.
              colors: PRESET_COLORS[0],
              sequenceNumber: aid.state.s,
              priorEventSaid: aid.state.p,
              eventSaid: aid.state.d,
              eventTimestamp: aid.state.dt,
              eventType: aid.state.et,
              keySigningThreshold: aid.state.kt,
              signingKeys: aid.state.k,
              nextKeysThreshold: aid.state.nt,
              nextKeys: aid.state.n,
              backerThreshold: aid.state.bt,
              backerAids: aid.state.b,
              lastEstablishmentEvent: {
                said: aid.state.ee.d,
                sequence: aid.state.ee.s,
                backerToAdd: aid.state.ee.ba,
                backerToRemove: aid.state.ee.br,
              },
            }
          }
        }
      }
      return undefined;
    }
  }

  private async getIdentityFromDidKeyRecord(
    record: DidRecord
  ): Promise<DIDDetails> {
    const displayName = record.getTag("displayName")?.toString();
    if (!displayName) {
      throw new Error(`${AriesAgent.DID_MISSING_DISPLAY_NAME} ${record.did}`);
    }

    const didDoc = (await this.agent.dids.resolve(record.did)).didDocument;
    if (!didDoc) {
      throw new Error(`${AriesAgent.DID_MISSING_DID_DOC} ${record.did}`);
    }

    if (!(didDoc.verificationMethod && didDoc.verificationMethod.length)) {
      throw new Error(`${AriesAgent.UNEXPECTED_DID_DOC_FORMAT} ${record.did}`);
    }
    const signingKey = didDoc.verificationMethod[0];
    if (!signingKey.publicKeyBase58) {
      throw new Error(`${AriesAgent.UNEXPECTED_DID_DOC_FORMAT} ${record.did}`);
    }

    return {
      id: record.did,
      method: IdentityType.KEY,
      displayName,
      createdAtUTC: record.createdAt.toISOString(),
      colors: PRESET_COLORS[0],
      controller: record.did,
      keyType: signingKey.type.toString(),
      publicKeyBase58: signingKey.publicKeyBase58,
    };
  }
}

export { AriesAgent, agentDependencies };
