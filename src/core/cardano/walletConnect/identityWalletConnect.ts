import { Buffer } from "buffer";
import {
  Paginate,
  Cip30DataSignature,
  IWalletInfo,
} from "@fabianbormann/cardano-peer-connect/dist/src/types";
import { CardanoPeerConnect } from "@fabianbormann/cardano-peer-connect";
import { AriesAgent } from "../../agent/agent";
import { IdentifierType } from "../../agent/services/identifierService.types";

class IdentityWalletConnect extends CardanoPeerConnect {
  getIdentifierId: () => Promise<string>;
  signDataWithIdentifier: (
    identifierId: string,
    payload: string
  ) => Promise<string>;
  generateOobi: (identifierId: string) => Promise<string>;

  constructor(
    walletInfo: IWalletInfo,
    seed: string | null,
    announce: string[],
    discoverySeed?: string | null
  ) {
    super(walletInfo, {
      seed: seed,
      announce: announce,
      discoverySeed: discoverySeed,
      logLevel: "info",
    });

    this.getIdentifierId = async (): Promise<string> => {
      const identifiers = await AriesAgent.agent.identifiers.getIdentifiers();
      if (identifiers && identifiers.length > 0) {
        for (const identifier of identifiers) {
          if (identifier.method === IdentifierType.KERI) {
            return identifier.id;
          }
        }
        throw new Error("No KERI identifier stored");
      } else {
        throw new Error("No identifier stored");
      }
    };

    this.signDataWithIdentifier = async (
      identifierId: string,
      payload: string
    ): Promise<string> => {
      const signer = await AriesAgent.agent.identifiers.getSigner(identifierId);
      return signer.sign(Buffer.from(payload)).qb64;
    };

    this.generateOobi = async (identifierId: string): Promise<string> => {
      const identifier = await AriesAgent.agent.identifiers.getIdentifier(
        identifierId
      );

      if (identifier?.result.signifyName) {
        return await AriesAgent.agent.connections.getKeriOobi(
          identifier?.result.signifyName
        );
      }

      return "";
    };
  }

  protected getNetworkId(): Promise<number> {
    throw new Error("Method not implemented.");
  }
  protected getUtxos(
    amount?: string | undefined,
    paginate?: Paginate | undefined
  ): Promise<string[] | null> {
    throw new Error("Method not implemented.");
  }
  protected getCollateral(
    params?: { amount?: string | undefined } | undefined
  ): Promise<string[] | null> {
    throw new Error("Method not implemented.");
  }
  protected getBalance(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  protected getUsedAddresses(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  protected getUnusedAddresses(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  protected getChangeAddress(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  protected async getRewardAddresses(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  protected signTx(tx: string, partialSign: boolean): Promise<string> {
    throw new Error("Method not implemented.");
  }
  protected async signData(
    addr: string,
    payload: string
  ): Promise<Cip30DataSignature> {
    throw new Error("Method not implemented.");
  }
  protected submitTx(tx: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
}

export { IdentityWalletConnect };
