import { SignifyClient, randomPasscode, Tier, ready as signifyReady, Algos, Siger, d, messagize } from "signify-ts";
import qrcode from "qrcode-terminal";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from 'node:process';
import { SignifyApi } from "../modules/signify/signifyApi";
import { waitAndGetDoneOp } from "../modules/signify/utils";

async function getClient(): Promise<SignifyClient> {
  const client = new SignifyClient(
    SignifyApi.LOCAL_KERIA_ENDPOINT,
    randomPasscode(),
    Tier.low,
    SignifyApi.LOCAL_KERIA_BOOT_ENDPOINT
  );

  await client.boot();
  await client.connect();
  return client;
}

// @TODO - foconnor: any.
async function createIdentifier(client: SignifyClient, name: string): Promise<any> {
  const createOp = await (await client.identifiers().create(name)).op();
  await waitAndGetDoneOp(client, createOp);
  await client.identifiers().addEndRole(
    name,
    SignifyApi.DEFAULT_ROLE,
    client.agent!.pre
  );
  return client.identifiers().get(name);
}

async function waitForFirstNotification(client: SignifyClient, route: string, timeout = 5000, interval = 250) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const notes = (await client.notifications().list()).notes;
    const note = notes.find((note) => note.a.r === route && note.r === false);
    if (note) {
      await client.notifications().mark(note.i);
      return note.a.d;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error(`Notification on route ${route} not appearing after ${timeout}ms`);
}

async function main() {
  const idwOobi = process.argv[2];
  if (!idwOobi?.includes("/oobi")) {
    console.error(`Invalid OOBI argument: ${idwOobi}`);
    process.exit(1);
  }
  
  await signifyReady();
  
  const aliceClient = await getClient();
  const aliceAid = await createIdentifier(aliceClient, "alice");
  const oobiA = await aliceClient.oobis().get("alice");
  console.info(`Alice created: ${aliceAid.prefix}`);
  
  const bobClient = await getClient();
  const bobAid = await createIdentifier(bobClient, "bob");
  const oobiB = await bobClient.oobis().get("bob");
  console.info(`Bob created: ${bobAid.prefix}`);

  await waitAndGetDoneOp(aliceClient, await aliceClient.oobis().resolve(oobiB.oobis[0], "bob"));
  await waitAndGetDoneOp(bobClient, await bobClient.oobis().resolve(oobiA.oobis[0], "alice"));

  const resolveIdwOpA = await waitAndGetDoneOp(aliceClient, await aliceClient.oobis().resolve(idwOobi, "idw"));
  await waitAndGetDoneOp(bobClient, await bobClient.oobis().resolve(idwOobi, "idw"));

  console.info(`\nAlice OOBI: ${oobiA.oobis[0]}`);
  qrcode.generate(oobiA.oobis[0], { small: true });
  
  console.info(`Bob OOBI: ${oobiB.oobis[0]}`);
  qrcode.generate(oobiB.oobis[0], { small: true });

  const rl = createInterface({ input: stdin, output: stdout });
  await rl.question("After scanning the QR codes, press enter to trigger inception of the multi-sig...");

  // --> Alice creates and sends to Bob and our IDW.
  const states = [aliceAid["state"], bobAid["state"], resolveIdwOpA.response];
  console.log(`it is here as ${JSON.stringify({
    algo: Algos.group,
    mhab: aliceAid,
    isith: 3,
    nsith: 3,
    states,
    rstates: states,
  }, null, 2)}`);
  const aliceIcp = await aliceClient.identifiers().create("multisig", {
    algo: Algos.group,
    mhab: aliceAid,
    isith: 3,
    nsith: 3,
    states,
    rstates: states,
  });
  const aliceIcpOp = await aliceIcp.op();
  const aliceSerder = aliceIcp.serder;
  const aliceSigers = aliceIcp.sigs.map((sig: string) => new Siger({ qb64: sig }));

  const aliceIms = d(messagize(aliceSerder, aliceSigers));
  const aliceAtc = aliceIms.substring(aliceSerder.size);
  const aliceEmbeds = { icp: [aliceSerder, aliceAtc] };

  const smids = states.map((state) => state["i"]);
  const recp = [bobAid["state"], resolveIdwOpA.response].map((state) => state["i"]);
  await aliceClient
    .exchanges()
    .send(
      "alice",
      "multisig",
      aliceAid,
      "/multisig/icp",
      { gid: aliceSerder.pre, smids: smids, rmids: smids },
      aliceEmbeds,
      recp
    );
  
  console.info("Alice has sent out the inception event!");
   
  // --> Bob wait and join.
  const receviedMsgSaid = await waitForFirstNotification(bobClient, "/multisig/icp");
  const receivedMsg = (await bobClient.groups().getRequest(receviedMsgSaid))[0].exn;
  const receivedIcp = receivedMsg.e.icp;

  const bobIcp = await bobClient.identifiers().create("multisig", {
      algo: Algos.group,
      mhab: bobAid,
      isith: receivedIcp.kt,
      nsith: receivedIcp.nt,
      toad: parseInt(receivedIcp.bt),
      wits: receivedIcp.b,
      states,
      rstates: states,
  });
  const bobIcpOp = await bobIcp.op();
  const bobSerder = bobIcp.serder;
  const bobSigers = bobIcp.sigs.map((sig) => new Siger({ qb64: sig }));

  const bobIms = d(messagize(bobSerder, bobSigers));
  const bobAtc = bobIms.substring(bobSerder.size);
  const bobEmbeds = { icp: [bobSerder, bobAtc] };

  const bobRecp = [aliceAid["state"], resolveIdwOpA.response].map((state) => state["i"]);
  await bobClient.exchanges().send(
    "bob",
    "multisig",
    bobAid,
    "/multisig/icp",
    { gid: bobSerder.pre, smids: smids, rmids: smids },
    bobEmbeds,
    bobRecp
  );
  
  console.info("Bob has joined the multi-sig and sent his response!");

  await rl.question("Accept the multi-sig in IDW, and press enter once done...");
  rl.close();

  await waitAndGetDoneOp(aliceClient, aliceIcpOp);
  await waitAndGetDoneOp(bobClient, bobIcpOp);

  console.info("Multi-sig fully complete!")
}

void main();
