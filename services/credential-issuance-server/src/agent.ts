import { SignifyApi } from "./modules/signify/signifyApi";

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

  async requestDisclosure(schemaSaid, aid) {
    return this.signifyApi.requestDisclosure(
      Agent.ISSUER_AID_NAME,
      schemaSaid,
      aid
    );
  }

  async contacts() {
    return this.signifyApi.contacts();
  }
  async initKeri(issuerName?: string) {
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
