import { Buffer } from "buffer";
import {
  Paginate,
  Cip30DataSignature,
  IWalletInfo,
} from "@fabianbormann/cardano-peer-connect/dist/src/types";
import { CardanoPeerConnect } from "@fabianbormann/cardano-peer-connect";
import { Agent } from "../../agent/agent";
import {
  PeerConnectSigningEvent,
  PeerConnectionEventTypes,
  PeerConnectionError,
  TxSignError,
} from "./peerConnection.types";
import { CoreEventEmitter } from "../../agent/event";
import { PeerConnection } from "./peerConnection";

class IdentityWalletConnect extends CardanoPeerConnect {
  private selectedAid: string;
  private eventEmitter: CoreEventEmitter;
  static readonly MAX_SIGN_TIME = 3600000;
  static readonly TIMEOUT_INTERVAL = 1000;
  getKeriIdentifier: () => Promise<{ id: string; oobi: string }>;
  signKeri: (
    identifier: string,
    payload: string
  ) => Promise<string | { error: PeerConnectionError }>;
  signKeriInception: (
    identifier: string,
    payload: string
  ) => Promise<string | { error: PeerConnectionError }>;
  verifySignature: (
    identifier: string,
    oobi: string,
    payload: string,
    signature: string
  ) => Promise<string | { error: PeerConnectionError }>;
  verifyKeriInteraction: (
    identifier: string,
    oobi: string,
    payload: string,
    sequencer: string
  ) => Promise<string | { error: PeerConnectionError }>;
  disable: () => void;

  constructor(
    walletInfo: IWalletInfo,
    seed: string | null,
    announce: string[],
    selectedAid: string,
    eventService: CoreEventEmitter,
    discoverySeed?: string | null
  ) {
    super(walletInfo, {
      seed: seed,
      announce: announce,
      discoverySeed: discoverySeed,
      logLevel: "info",
    });
    this.selectedAid = selectedAid;
    this.eventEmitter = eventService;

    this.getKeriIdentifier = async (): Promise<{
      id: string;
      oobi: string;
    }> => {
      const identifier = await Agent.agent.identifiers.getIdentifier(
        this.selectedAid
      );
      return {
        id: this.selectedAid,
        oobi: await Agent.agent.connections.getOobi(identifier.id),
      };
    };

    this.signKeri = async (
      identifier: string,
      payload: string
    ): Promise<string | { error: PeerConnectionError }> => {
      let approved: boolean | undefined = undefined;
      // Closure that updates approved variable
      const approvalCallback = (approvalStatus: boolean) => {
        approved = approvalStatus;
      };
      this.eventEmitter.emit<PeerConnectSigningEvent>({
        type: PeerConnectionEventTypes.PeerConnectSign,
        payload: {
          identifier,
          payload,
          approvalCallback,
        },
      });
      const startTime = Date.now();
      // Wait until approved is true or false
      while (approved === undefined) {
        await new Promise((resolve) =>
          setTimeout(resolve, IdentityWalletConnect.TIMEOUT_INTERVAL)
        );
        if (Date.now() > startTime + IdentityWalletConnect.MAX_SIGN_TIME) {
          return { error: TxSignError.TimeOut };
        }
      }
      if (approved) {
        return (await Agent.agent.identifiers.getSigner(identifier)).sign(
          Buffer.from(payload)
        ).qb64;
      } else {
        return { error: TxSignError.UserDeclined };
      }
    };

    this.verifySignature = async (
      identifier: string,
      oobi: string,
      payload: string,
      signature: string
    ): Promise<string | { error: PeerConnectionError }> => {
      // TODO: verify
      // check if oobi is me or contacts
      // Get last kel
      // const reqVerfer = await getRemoteVerfer(reqAid);
      // const keyManager = await getKeyManager(serverAid);
      return "";
    };

    this.verifyKeriInteraction = async (
      identifier: string,
      oobi: string,
      payload: string,
      sequencer: string
    ): Promise<string | { error: PeerConnectionError }> => {
      // TODO: verify
      // check if oobi is me or contacts
      // Get last kel
      // const reqVerfer = await getRemoteVerfer(reqAid);
      // const keyManager = await getKeyManager(serverAid);
      //await Agent.agent.identifiers.
      //await this.props.signifyClient.keyStates().get(connection.id)
      return "";
    };

    this.signKeriInception = async (
      identifier: string,
      payload: string
    ): Promise<string | { error: PeerConnectionError }> => {
      let approved: boolean | undefined = undefined;
      // Closure that updates approved variable
      const approvalCallback = (approvalStatus: boolean) => {
        approved = approvalStatus;
      };
      this.eventEmitter.emit<PeerConnectSigningEvent>({
        type: PeerConnectionEventTypes.PeerConnectSign,
        payload: {
          identifier,
          payload,
          inception: true,
          approvalCallback,
        },
      });
      const startTime = Date.now();
      // Wait until approved is true or false
      while (approved === undefined) {
        await new Promise((resolve) =>
          setTimeout(resolve, IdentityWalletConnect.TIMEOUT_INTERVAL)
        );
        if (Date.now() > startTime + IdentityWalletConnect.MAX_SIGN_TIME) {
          return { error: TxSignError.TimeOut };
        }
      }
      if (approved) {
        return await Agent.agent.identifiers.createInteractionEvent(
          identifier,
          payload
        );
      } else {
        return { error: TxSignError.UserDeclined };
      }
    };

    this.disable = (): void => {
      PeerConnection.peerConnection.disconnectDApp(null, false);
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
