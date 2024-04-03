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
  timeout = 40000,
  interval = 250
) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const notes = (await client.notifications().list()).notes;
    console.log({ notes });
    const note = notes.find((note) => note.a.r === route && note.r === false);
    if (note) {
      await client.notifications().mark(note.i);
      return note.a.d;
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
  timeout = 20000,
  interval = 250
) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const creds = await client.credentials().list();
    console.log({ creds })
    if (creds.length) {
      return creds;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error("No credential");
}

async function main() {
  await signifyReady();

  //Issuer identifier
  const issuerClient = await getClient();
  const issuerSignifyName = utils.uuid();
  const issuerAid = await createIdentifier(issuerClient, issuerSignifyName);
  console.info(
    `Issuer created: { prefix: ${issuerAid.prefix}, name: ${issuerSignifyName} }`
  );

  //Verifier identifier
  const verifierClient = await getClient();
  const verifierSignifyName = utils.uuid();
  const verifierAid = await createIdentifier(verifierClient, verifierSignifyName);
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
  console.log({ delegatorOobi });
  //Delegate
  const delegateClient = await getClient();
  const delegateSignifyName = utils.uuid();
  await waitAndGetDoneOp(
    delegateClient,
    await delegateClient
      .oobis()
      .resolve(delegatorOobi.oobis[0], delegatorSignifyName)
  );
  console.log("OOBI A resolved");
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
  // Create contacts
  await getOrCreateContact(issuerClient, "holder", delegatorOobi.oobis[0]);

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

  // Issuer & Verifier resolve QVI schema
  const QVI_SCHEMA_SAID = "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao";
  await waitAndGetDoneOp(
    issuerClient,
    await issuerClient
      .oobis()
      .resolve(
        `https://dev.vlei-server.cf-keripy.metadata.dev.cf-deployments.org/oobi/${QVI_SCHEMA_SAID}`
      )
  );
  await waitAndGetDoneOp(
    verifierClient,
    await verifierClient
      .oobis()
      .resolve(
        `https://dev.vlei-server.cf-keripy.metadata.dev.cf-deployments.org/oobi/${QVI_SCHEMA_SAID}`
      )
  );    
  console.log("Issuer & Verifier resolved the schema!");
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
      grantNotification!,
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
  console.log({ issuerGrantResponseNotification })

  const delegatorCreds = await retryGetCredentials(delegatorClient);
  console.log({ delegatorCreds });
}

main();
