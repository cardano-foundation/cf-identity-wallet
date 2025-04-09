import { randomPasscode, ready as signifyReady } from "signify-ts";
import { config } from "./config";
import { SignifyApi } from "./modules/signify/signifyApi";
import { NotificationRoute } from "./modules/signify/signifyApi.type";
import { readFile, writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import path from "path";

class Agent {
  static readonly ISSUER_AID_NAME = "issuer";
  static readonly HOLDER_AID_NAME = "holder";
  static readonly QVI_SCHEMA_SAID =
    "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao";
  static readonly RARE_EVO_DEMO_SCHEMA_SAID =
    "EJxnJdxkHbRw2wVFNe4IUOPLt8fEtg9Sr3WyTjlgKoIb";
  static readonly LE_SCHEMA_SAID =
    "ENPXp1vQzRF6JwIuS-mp2U8Uf1MoADoP_GqQ62VsDZWY";

  private static keriRegistryRegk;
  private static keriIssuerRegistryRegk;

  private static signifyApi = new SignifyApi();
  private static signifyApiIssuer = new SignifyApi();

  private static issuerAid;
  private static holderAid;
  private static qviCredentialId;

  static async start(): Promise<void> {
    await signifyReady();
    let bran;
    let issuerBran;
    const bransFilePath = "./data/brans.json";
    const dirPath = path.dirname(bransFilePath);
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
    if (!existsSync(bransFilePath)) {
      // Create new file if the file doesn't exist
      await writeFile(bransFilePath, "");
    }
    const bransFileContent = await readFile(bransFilePath, "utf8");
    if (
      !bransFileContent.includes("bran") &&
      !bransFileContent.includes("issuerBran")
    ) {
      // Write file content if it's empty
      bran = randomPasscode();
      issuerBran = randomPasscode();
      await writeFile(
        bransFilePath,
        JSON.stringify({
          bran,
          issuerBran,
        })
      );
    } else {
      const bransData = JSON.parse(bransFileContent);
      bran = bransData.bran;
      issuerBran = bransData.issuerBran;
    }
    if (bran && issuerBran) {
      await Agent.signifyApi.start(bran);
      await Agent.signifyApiIssuer.start(issuerBran);
    }
  }

  static async createKeriOobi() {
    return `${await Agent.signifyApi.getOobi(
      Agent.HOLDER_AID_NAME
    )}?name=CF%20Credential%20Issuance`;
  }

  static async resolveOobi(url: string) {
    return Agent.signifyApi.resolveOobi(url);
  }

  static async issueAcdcCredentialByAid(schemaSaid, aid, attribute) {
    if (schemaSaid === Agent.LE_SCHEMA_SAID) {
      return Agent.signifyApi.leChainedCredential(
        Agent.qviCredentialId,
        Agent.keriRegistryRegk,
        Agent.holderAid.name,
        aid,
        attribute
      );
    }

    return Agent.signifyApi.issueCredential(
      Agent.HOLDER_AID_NAME,
      Agent.keriRegistryRegk,
      schemaSaid,
      aid,
      attribute
    );
  }

  static async requestDisclosure(schemaSaid, aid, attributes) {
    return Agent.signifyApi.requestDisclosure(
      Agent.HOLDER_AID_NAME,
      schemaSaid,
      aid,
      attributes
    );
  }

  static async contacts() {
    return Agent.signifyApi.contacts();
  }

  static async deleteContact(id: string) {
    return Agent.signifyApi.deleteContact(id);
  }

  static async contactCredentials(contactId: string) {
    const issuer = await Agent.signifyApi.getIdentifierByName(
      Agent.HOLDER_AID_NAME
    );
    return Agent.signifyApi.contactCredentials(issuer.prefix, contactId);
  }

  static async revokeCredential(credentialId: string, holder: string) {
    return Agent.signifyApi.revokeCredential(
      Agent.HOLDER_AID_NAME,
      holder,
      credentialId
    );
  }

  static async pollNotifications() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const notifications = await Agent.signifyApi.getNotifications();
      for (const notif of notifications.notes) {
        await Agent.processNotification(notif);
      }
      await new Promise((rs) => {
        setTimeout(() => {
          rs(true);
        }, 2000);
      });
    }
  }

  private static async processNotification(notif: any) {
    switch (notif.a.r) {
      case NotificationRoute.ExnIpexOffer: {
        const msg = await Agent.signifyApi.getExchangeMsg(notif.a.d!);
        await Agent.signifyApi.agreeToAcdcFromOffer(
          Agent.HOLDER_AID_NAME,
          msg.exn.d,
          msg.exn.i
        );
        break;
      }
      default:
        break;
    }
    await Agent.signifyApi.deleteNotification(notif.i);
  }

  static async initKeri(): Promise<void> {
    /* eslint-disable no-console */
    const existingKeriIssuerRegistryRegk = await Agent.signifyApiIssuer
      .getRegistry(Agent.ISSUER_AID_NAME)
      .catch((e) => {
        console.error(e);
        return undefined;
      });
    const existingKeriRegistryRegk = await Agent.signifyApi
      .getRegistry(Agent.HOLDER_AID_NAME)
      .catch((e) => {
        console.error(e);
        return undefined;
      });
    // Issuer
    if (existingKeriIssuerRegistryRegk) {
      Agent.keriIssuerRegistryRegk = existingKeriIssuerRegistryRegk;
    } else {
      await Agent.signifyApiIssuer
        .createIdentifier(Agent.ISSUER_AID_NAME)
        .catch((e) => console.error(e));
      Agent.keriIssuerRegistryRegk = await Agent.signifyApiIssuer
        .createRegistry(Agent.ISSUER_AID_NAME)
        .catch((e) => console.error(e));
    }

    // Holder
    if (existingKeriRegistryRegk) {
      Agent.keriRegistryRegk = existingKeriRegistryRegk;
    } else {
      await Agent.signifyApi
        .createIdentifier(Agent.HOLDER_AID_NAME)
        .catch((e) => console.error(e));
      await Agent.signifyApi.addIndexerRole(Agent.HOLDER_AID_NAME);
      Agent.keriRegistryRegk = await Agent.signifyApi
        .createRegistry(Agent.HOLDER_AID_NAME)
        .catch((e) => console.error(e));
    }

    await Agent.createQVICredential().catch((e) => console.error(e));

    Agent.pollNotifications();
  }

  static async createQVICredential() {
    Agent.issuerAid = await Agent.signifyApiIssuer.getIdentifierByName(
      Agent.ISSUER_AID_NAME
    );
    Agent.holderAid = await Agent.signifyApi.getIdentifierByName(
      Agent.HOLDER_AID_NAME
    );
    const issuerAidOobi = await Agent.signifyApiIssuer.getOobi(
      Agent.issuerAid.name
    );
    const holderAidOobi = await Agent.signifyApi.getOobi(Agent.holderAid.name);
    await Agent.signifyApi.resolveOobi(issuerAidOobi);
    await Agent.signifyApiIssuer.resolveOobi(holderAidOobi);

    const qviCredentialId = await Agent.signifyApiIssuer.issueQVICredential(
      Agent.issuerAid.name,
      Agent.keriIssuerRegistryRegk,
      Agent.holderAid.prefix
    );

    Agent.qviCredentialId = qviCredentialId;

    // wait for notification
    const getHolderNotifications = async () => {
      let holderNotifications = await Agent.signifyApi.getNotifications();

      while (!holderNotifications.total) {
        holderNotifications = await Agent.signifyApi.getNotifications();
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      return holderNotifications;
    };

    const grantNotification = (await getHolderNotifications()).notes[0];

    // resolve schema
    await Agent.signifyApi.resolveOobi(
      `${config.oobiEndpoint}/oobi/${Agent.QVI_SCHEMA_SAID}`
    );

    // holder IPEX admit
    await Agent.signifyApi.admitCredential(
      Agent.holderAid.name,
      grantNotification.a.d!,
      Agent.issuerAid.prefix
    );
    await Agent.signifyApi.deleteNotification(grantNotification.i);
  }
}

export { Agent };
