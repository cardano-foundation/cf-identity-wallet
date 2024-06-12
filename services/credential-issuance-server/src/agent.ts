import { SignifyApi } from "./modules/signify/signifyApi";
import { NotificationRoute } from "./modules/signify/signifyApi.type";

class Agent {
  static readonly ISSUER_AID_NAME = "issuer";
  static readonly VLEI_HOST =
    "https://dev.vlei-server.cf-keripy.metadata.dev.cf-deployments.org/oobi/";
  static readonly SCHEMA_SAID = "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao";

  private static instance: Agent;

  private keriRegistryRegk;

  signifyApi!: SignifyApi;

  private constructor() {
    this.signifyApi = new SignifyApi();
  }

  static get agent() {
    if (!this.instance) {
      this.instance = new Agent();
    }
    return this.instance;
  }

  async start(): Promise<void> {
    await this.signifyApi.start();
  }

  async createKeriOobi() {
    return `${await this.signifyApi.getOobi(
      Agent.ISSUER_AID_NAME
    )}?name=CF%20Credential%20Issuance`;
  }

  async resolveOobi(url: string) {
    return this.signifyApi.resolveOobi(url);
  }

  async issueAcdcCredentialByAid(schemaSaid, aid, name?) {
    return this.signifyApi.issueCredential(
      Agent.ISSUER_AID_NAME,
      this.keriRegistryRegk,
      schemaSaid,
      aid,
      name
    );
  }

  async requestDisclosure(schemaSaid, aid, attributes) {
    return this.signifyApi.requestDisclosure(
      Agent.ISSUER_AID_NAME,
      schemaSaid,
      aid,
      attributes
    );
  }

  async contacts() {
    return this.signifyApi.contacts();
  }
  async onNotificationKeriStateChanged() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const notifications = await this.signifyApi.getNotifications();
      for (const notif of notifications.notes) {
        await this.processNotification(notif);
      }
      await new Promise((rs) => {
        setTimeout(() => {
          rs(true);
        }, 2000);
      });
    }
  }

  private async processNotification(notif: any) {
    if (
      Object.values(NotificationRoute).includes(
        notif.a.r as NotificationRoute
      ) &&
      !notif.r
    ) {
      switch (notif.a.r) {
        case NotificationRoute.ExnIpexOffer: {
          const msg = await this.signifyApi.getExchangeMsg(notif.a.d!);
          await this.signifyApi.agreeToAcdcFromOffer(
            Agent.ISSUER_AID_NAME,
            msg.exn.d,
            msg.exn.i
          );
          break;
        }
        default:
          break;
      }
    }
    await this.signifyApi.deleteNotification(notif.i);
  }
  async initKeri(issuerName?: string) {
    this.onNotificationKeriStateChanged();
    const AIDIssuerName = issuerName ? issuerName : Agent.ISSUER_AID_NAME;
    const existedIndentifier = await this.signifyApi
      .getIdentifierByName(AIDIssuerName)
      .catch(() => null);
    if (existedIndentifier) return existedIndentifier;
    const identifier = await this.signifyApi.createIdentifier(AIDIssuerName);
    this.keriRegistryRegk = await this.signifyApi.createRegistry(AIDIssuerName);
    return identifier;
  }
}

export { Agent };
