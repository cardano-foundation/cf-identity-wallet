import {
  SignifyClient,
  randomPasscode,
  Tier,
  ready as signifyReady,
  Algos,
  Siger,
  d,
  messagize,
  Serder,
} from "signify-ts";
import qrcode from "qrcode-terminal";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { SignifyApi } from "../modules/signify/signifyApi";
import { waitAndGetDoneOp } from "../modules/signify/utils";
import { utils } from "@aries-framework/core";
import { config } from "../config";

const credServer =
  "https://dev.credentials.cf-keripy.metadata.dev.cf-deployments.org";
async function getClient(): Promise<SignifyClient> {
  const client = new SignifyClient(
    SignifyApi.LOCAL_KERIA_ENDPOINT,
    randomPasscode(),
    Tier.low,
    SignifyApi.LOCAL_KERIA_BOOT_ENDPOINT
  );
  const result = await client.boot();
  await client.connect();
  return client;
}

async function createIdentifier(
  client: SignifyClient,
  name: string
): Promise<any> {
  const createOp = await (await client.identifiers().create(name)).op();
  await waitAndGetDoneOp(client, createOp);
  await client
    .identifiers()
    .addEndRole(name, SignifyApi.DEFAULT_ROLE, client.agent!.pre);
  return client.identifiers().get(name);
}

async function waitForFirstNotification(
  client: SignifyClient,
  route: string,
  timeout = 20000,
  interval = 250
) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const notes = (await client.notifications().list()).notes;
    const note = notes.find((note) => note.a.r === route && note.r === false);
    if (note) {
      console.log({ note })
      await client.notifications().mark(note.i);
      return {
        said: note.a.d,
        id: note.i,
      };
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error(
    `Notification on route ${route} not appearing after ${timeout}ms`
  );
}

async function getOrCreateContact(
  client: SignifyClient,
  name: string,
  oobi: string
): Promise<string> {
  const list = await client.contacts().list(undefined, "alias", `^${name}$`);
  if (list.length > 0) {
    const contact = list[0];
    if (contact.oobi === oobi) {
      return contact.id;
    }
  }
  let op = await client.oobis().resolve(oobi, name);
  op = await waitAndGetDoneOp(client, op);
  return op.response.i;
}

async function retryGetCredentials(
  client: SignifyClient,
  timeout = 60000,
  interval = 250
) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const creds = await client.credentials().list();
    console.log({ creds });
    if (creds.length) {
      return creds;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error("No credential");
}

async function createProfile(name) {
  const client = await getClient();
  const signifyName = utils.uuid();
  const aid = await createIdentifier(client, signifyName);
  const oobi = await client.oobis().get(signifyName, "agent");
  console.info(
    `${name} created: { prefix: ${aid.prefix}, name: ${signifyName} }`
  );
  return {
    client,
    signifyName,
    aid,
    oobi,
  };
}

async function main() {
  console.time("Time");
  await signifyReady();

  //Issuer identifier
  const issuerClient = await getClient();
  const issuerSignifyName = utils.uuid();
  const issuerAid = await createIdentifier(issuerClient, issuerSignifyName);
  const issuerOobi = await issuerClient.oobis().get(issuerSignifyName, "agent");
  console.info(
    `Issuer created: { prefix: ${issuerAid.prefix}, name: ${issuerSignifyName} }`
  );

  //Verifier identifier
  const verifierClient = await getClient();
  const verifierSignifyName = utils.uuid();
  const verifierAid = await createIdentifier(
    verifierClient,
    verifierSignifyName
  );
  const verifierOobi = await verifierClient
    .oobis()
    .get(verifierSignifyName, "agent");
  console.info(
    `Verifier created: { prefix: ${verifierAid.prefix}, name: ${verifierSignifyName} }`
  );

  //Unauthorize identifier
  const johnDoeClient = await getClient();
  const johnDoeSignifyName = utils.uuid();
  const johnDoeAid = await createIdentifier(johnDoeClient, johnDoeSignifyName);
  console.info(
    `John Doe created: { prefix: ${johnDoeAid.prefix}, name: ${johnDoeSignifyName} }`
  );

  //Delegator
  const delegatorClient = await getClient();
  const delegatorSignifyName = utils.uuid();
  const delegatorAid = await createIdentifier(
    delegatorClient,
    delegatorSignifyName
  );
  const delegatorIdentifier = await delegatorClient
    .identifiers()
    .get(delegatorSignifyName);
  const delegatorOobi = await delegatorClient
    .oobis()
    .get(delegatorSignifyName, "agent");
  console.info(
    `Delegator created: { prefix: ${delegatorAid.prefix}, name: ${delegatorSignifyName} }`
  );

  //Delegate
  const delegateClient = await getClient();
  const delegateSignifyName = utils.uuid();
  await waitAndGetDoneOp(
    delegateClient,
    await delegateClient
      .oobis()
      .resolve(delegatorOobi.oobis[0], delegatorSignifyName)
  );
  const createDelegateResult = await delegateClient
    .identifiers()
    .create(delegateSignifyName, { delpre: delegatorAid.prefix });
  await createDelegateResult.op();
  const delegateAid = await delegateClient
    .identifiers()
    .get(delegateSignifyName);
  console.info(
    `Delegate created: { prefix: ${delegateAid.prefix}, name: ${delegateSignifyName} }`
  );

  // Delegator client approves delegation
  const anchor = {
    i: delegateAid.prefix,
    s: "0",
    d: delegateAid.prefix,
  };
  const ixnResult1 = await delegatorClient
    .identifiers()
    .interact(delegatorSignifyName, anchor);
  await waitAndGetDoneOp(delegatorClient, await ixnResult1.op());
  console.log("Delegator approved delegation");
  await delegateClient
    .identifiers()
    .addEndRole(
      delegateSignifyName,
      SignifyApi.DEFAULT_ROLE,
      delegateClient.agent!.pre
    );
  await delegateClient
    .identifiers()
    .get(delegateSignifyName);  
  const delegateOobi = await delegateClient
    .oobis()
    .get(delegateSignifyName, "agent");
  
  // Create contacts
  await Promise.all([
    getOrCreateContact(issuerClient, "holder", delegatorOobi.oobis[0]),
    getOrCreateContact(issuerClient, "verifier", verifierOobi.oobis[0]),
    getOrCreateContact(delegatorClient, "issuer", issuerOobi.oobis[0]),
    getOrCreateContact(delegatorClient, "verifier", verifierOobi.oobis[0]),
    getOrCreateContact(verifierClient, "holder", delegatorOobi.oobis[0]),
    getOrCreateContact(verifierClient, "issuer", issuerOobi.oobis[0]),
    getOrCreateContact(verifierClient, "holder", delegateOobi.oobis[0]),
    getOrCreateContact(delegateClient, "verifier", verifierOobi.oobis[0]),
  ]);

  // resolve QVI schema
  const QVI_SCHEMA_SAID = "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao";
  await Promise.all([
    waitAndGetDoneOp(
      issuerClient,
      await issuerClient
        .oobis()
        .resolve(`${credServer}/oobi/${QVI_SCHEMA_SAID}`)
    ),
    waitAndGetDoneOp(
      delegatorClient,
      await delegatorClient
        .oobis()
        .resolve(`${credServer}/oobi/${QVI_SCHEMA_SAID}`)
    ),
    waitAndGetDoneOp(
      verifierClient,
      await verifierClient
        .oobis()
        .resolve(`${credServer}/oobi/${QVI_SCHEMA_SAID}`)
    ),
    waitAndGetDoneOp(
      delegateClient,
      await delegateClient
        .oobis()
        .resolve(`${credServer}/oobi/${QVI_SCHEMA_SAID}`)
    ),
  ]);
  console.log("Resolved the QVI schema!");
  const registryName = "vLEI-test-registry";
  const regResult = await issuerClient
    .registries()
    .create({ name: issuerSignifyName, registryName: registryName });
  await waitAndGetDoneOp(issuerClient, await regResult.op());
  const registries = await issuerClient.registries().list(issuerAid.name);
  const registry: { name: string; regk: string } = registries[0];
  console.log("Issuer created the registry!");

  //Issue
  const issResult = await issuerClient.credentials().issue({
    issuerName: issuerAid.name,
    registryId: registry.regk,
    schemaId: QVI_SCHEMA_SAID,
    recipient: delegatorAid.prefix,
    data: {
      LEI: "5493001KJTIIGC8Y1R17",
    },
  });
  await waitAndGetDoneOp(issuerClient, issResult.op);
  const qviCredentialId = issResult.acdc.ked.d as string;
  console.log("issued!");

  //issuer IPEX grant
  const issuerCredential = (await issuerClient.credentials().list())[0];
  console.log("got credential!");
  const [grant, gsigs, gend] = await issuerClient.ipex().grant({
    senderName: issuerAid.name,
    acdc: new Serder(issuerCredential.sad),
    anc: new Serder(issuerCredential.anc),
    iss: new Serder(issuerCredential.iss),
    ancAttachment: issuerCredential.ancAttachment,
    recipient: delegatorAid.prefix,
    datetime: new Date().toISOString().replace("Z", "000+00:00"),
  });

  const grantResult = await issuerClient
    .ipex()
    .submitGrant(issuerAid.name, grant, gsigs, gend, [delegatorAid.prefix]);
  await waitAndGetDoneOp(issuerClient, grantResult);
  console.log({ grantResult });

  //delegator IPEX admit
  const grantNotification = await waitForFirstNotification(
    delegatorClient,
    "/exn/ipex/grant"
  );
  console.log({ grantNotification });
  const [admit, sigs, aend] = await delegatorClient
    .ipex()
    .admit(
      delegatorAid.name,
      "",
      grantNotification.said!,
      new Date().toISOString().replace("Z", "000+00:00")
    );
  const admitOp = await delegatorClient
    .ipex()
    .submitAdmit(delegatorAid.name, admit, sigs, aend, [issuerAid.prefix]);
  await waitAndGetDoneOp(delegatorClient, admitOp);

  // issuer IPEX grant response
  const issuerGrantResponseNotification = await waitForFirstNotification(
    issuerClient,
    "/exn/ipex/admit"
  );
  console.log({ issuerGrantResponseNotification });

  const delegatorCreds = await retryGetCredentials(delegatorClient);
  console.log({ delegatorCreds });

  //Delegator IPEX present
  const credential = delegatorCreds[0];
  const [grant2, gsigs2, gend2] = await delegatorClient.ipex().grant({
    senderName: delegatorAid.name,
    recipient: verifierAid.prefix,
    acdc: new Serder(credential.sad),
    anc: new Serder(credential.anc),
    iss: new Serder(credential.iss),
    acdcAttachment: credential.atc,
    ancAttachment: credential.ancatc,
    issAttachment: credential.issAtc,
    datetime: new Date().toISOString().replace("Z", "000+00:00"),
  });

  await waitAndGetDoneOp(
    delegatorClient,
    await delegatorClient
      .ipex()
      .submitGrant(delegatorAid.name, grant2, gsigs2, gend2, [
        verifierAid.prefix,
      ])
  );
  console.log("Delegator presented!");

  //Verifier receives IPEX grant from delegator
  const verifierGrantNotification = await waitForFirstNotification(
    verifierClient,
    "/exn/ipex/grant"
  );
  console.log({ verifierGrantNotification });
  const [admit3, sigs3, aend3] = await verifierClient
    .ipex()
    .admit(
      verifierAid.name,
      "",
      verifierGrantNotification.said!,
      new Date().toISOString().replace("Z", "000+00:00")
    );
  console.log(`admit!`)
  await waitAndGetDoneOp(
    delegatorClient,
    await verifierClient
      .ipex()
      .submitAdmit(verifierAid.name, admit3, sigs3, aend3, [
        delegatorAid.prefix,
      ])
  );
  console.log(`op done!`, { verifierGrantNotification })
  // await verifierClient.notifications().mark(verifierGrantNotification.id);
  // await verifierClient.notifications().delete(verifierGrantNotification.id);
  // console.log(`noti deleted!`)
  const verifierCreds = await retryGetCredentials(verifierClient);
  console.log({ verifierCreds });

  console.timeEnd("Time");
}

main();
