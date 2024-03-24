import { SignifyApi } from "./modules/signify/signifyApi";

class AriesAgent {
  static readonly ISSUER_AID_NAME = "issuer";
  static readonly VLEI_HOST =
    "https://dev.vlei-server.cf-keripy.metadata.dev.cf-deployments.org/oobi/";
  static readonly SCHEMA_SAID = "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao";

  private static instance: AriesAgent;

  private keriRegistryRegk;

  signifyApi!: SignifyApi;

  private constructor() {
    this.signifyApi = new SignifyApi();
  }

  static get agent() {
    if (!this.instance) {
      this.instance = new AriesAgent();
    }
    return this.instance;
  }

  async start(): Promise<void> {
    await this.signifyApi.start();
  }

  async createKeriOobi() {
    return this.signifyApi.getOobi(AriesAgent.ISSUER_AID_NAME);
  }

  async issueAcdcCredentialByOobi(url: string) {
    const aid = await this.signifyApi.resolveOobi(url);
    return this.signifyApi.issueCredential(
      AriesAgent.ISSUER_AID_NAME,
      this.keriRegistryRegk,
      AriesAgent.SCHEMA_SAID,
      aid?.response.i
    );
  }
  async initKeri(schema?: string, issuerName?: string) {
    const SAIDSchema = schema ? schema : AriesAgent.SCHEMA_SAID;
    const AIDIssuerName = issuerName ? issuerName : AriesAgent.ISSUER_AID_NAME;
    const existedIndentifier = await this.signifyApi
      .getIdentifierByName(AIDIssuerName)
      .catch(() => null);
    if (existedIndentifier) return existedIndentifier;
    const identifier = await this.signifyApi.createIdentifier(AIDIssuerName);
    await this.signifyApi.resolveOobi(AriesAgent.VLEI_HOST + SAIDSchema);
    this.keriRegistryRegk = await this.signifyApi.createRegistry(AIDIssuerName);
    return identifier;
  }
}

export { AriesAgent };
