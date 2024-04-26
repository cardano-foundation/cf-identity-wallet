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
  timeout = 5000,
  interval = 250
) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const notes = (await client.notifications().list()).notes;
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

async function rotateIdentifier(client: SignifyClient, identifierName: string) {
  const icpResult1 = await client.identifiers().rotate(identifierName);
  const op = await icpResult1.op();
  await waitAndGetDoneOp(client, op);
  return await client.identifiers().get(identifierName);
}

async function rotateMultisig(
  client: SignifyClient,
  rstates,
  recpState,
  exn?: any
) {
  const rotatedMultisigIcp = await client
    .identifiers()
    .rotate("multisig", { states: rstates, rstates });
  const op = await rotatedMultisigIcp.op();

  const serder = rotatedMultisigIcp.serder;
  const sigs = rotatedMultisigIcp.sigs;
  const sigers = sigs.map((sig) => new Siger({ qb64: sig }));

  const ims = d(messagize(serder, sigers));
  const atc = ims.substring(serder.size);
  const rembeds = {
    rot: [serder, atc],
  };

  const smids = exn ? exn.a.smids : rstates.map((state) => state["i"]);
  const recp = recpState.map((state) => state["i"]); //[aid2State, aid3State].map((state) => state["i"]);
  return {
    op,
    serder,
    smids,
    rembeds,
    recp,
  };
}

async function main() {
  await signifyReady();

  const aliceClient = await getClient();
  let aliceAid = await createIdentifier(aliceClient, "alice");
  const oobiA = await aliceClient.oobis().get("alice");
  console.info(`Alice created: ${aliceAid.prefix}`);

  const bobClient = await getClient();
  let bobAid = await createIdentifier(bobClient, "bob");
  const oobiB = await bobClient.oobis().get("bob");
  console.info(`Bob created: ${bobAid.prefix}`);

  const charlieClient = await getClient();
  let charlieAid = await createIdentifier(charlieClient, "charlie");
  const oobiC = await charlieClient.oobis().get("charlie");
  console.info(`Charlie created: ${charlieAid.prefix}`);

  const daveClient = await getClient();
  let daveAid = await createIdentifier(daveClient, "dave");
  const oobiD = await daveClient.oobis().get("dave");
  console.info(`Dave created: ${daveAid.prefix}`);

  //Alice resolves other oobis
  await waitAndGetDoneOp(
    aliceClient,
    await aliceClient.oobis().resolve(oobiB.oobis[0], "bob")
  );
  await waitAndGetDoneOp(
    aliceClient,
    await aliceClient.oobis().resolve(oobiC.oobis[0], "charlie")
  );
  await waitAndGetDoneOp(
    aliceClient,
    await aliceClient.oobis().resolve(oobiD.oobis[0], "dave")
  );
  //Bob resolves other oobis
  await waitAndGetDoneOp(
    bobClient,
    await bobClient.oobis().resolve(oobiA.oobis[0], "alice")
  );
  await waitAndGetDoneOp(
    bobClient,
    await bobClient.oobis().resolve(oobiC.oobis[0], "charlie")
  );
  await waitAndGetDoneOp(
    bobClient,
    await bobClient.oobis().resolve(oobiD.oobis[0], "dave")
  );
  //Charlie resolves other oobis
  await waitAndGetDoneOp(
    charlieClient,
    await charlieClient.oobis().resolve(oobiA.oobis[0], "alice")
  );
  await waitAndGetDoneOp(
    charlieClient,
    await charlieClient.oobis().resolve(oobiB.oobis[0], "bob")
  );

  //Dave resolves other oobis
  await waitAndGetDoneOp(
    daveClient,
    await daveClient.oobis().resolve(oobiA.oobis[0], "alice")
  );
  await waitAndGetDoneOp(
    daveClient,
    await daveClient.oobis().resolve(oobiB.oobis[0], "bob")
  );
  // --> Alice creates and sends to Bob and our IDW.
  const states = [aliceAid["state"], bobAid["state"], charlieAid["state"]];
  const aliceIcp = await aliceClient.identifiers().create("multisig", {
    algo: Algos.group,
    mhab: aliceAid,
    isith: 2,
    nsith: 2,
    states,
    rstates: states,
  });
  const aliceIcpOp = await aliceIcp.op();
  const aliceSerder = aliceIcp.serder;
  const aliceSigers = aliceIcp.sigs.map(
    (sig: string) => new Siger({ qb64: sig })
  );

  const aliceIms = d(messagize(aliceSerder, aliceSigers));
  const aliceAtc = aliceIms.substring(aliceSerder.size);
  const aliceEmbeds = { icp: [aliceSerder, aliceAtc] };

  let smids = states.map((state) => state["i"]);
  let recp = [bobAid["state"], charlieAid["state"]].map((state) => state["i"]);
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
  const receviedMsgSaid = await waitForFirstNotification(
    bobClient,
    "/multisig/icp"
  );
  const receivedMsg = (await bobClient.groups().getRequest(receviedMsgSaid))[0]
    .exn;
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

  const bobRecp = [aliceAid["state"], charlieAid["state"]].map(
    (state) => state["i"]
  );
  await bobClient
    .exchanges()
    .send(
      "bob",
      "multisig",
      bobAid,
      "/multisig/icp",
      { gid: bobSerder.pre, smids: smids, rmids: smids },
      bobEmbeds,
      bobRecp
    );

  console.info("Bob has joined the multi-sig and sent his response!");

  // --> Charlie wait and join.
  const charlieReceviedMsgSaid = await waitForFirstNotification(
    charlieClient,
    "/multisig/icp"
  );
  const charlieReceivedMsg = (
    await charlieClient.groups().getRequest(charlieReceviedMsgSaid)
  )[0].exn;
  const charlieReceivedIcp = charlieReceivedMsg.e.icp;

  const charlieIcp = await charlieClient.identifiers().create("multisig", {
    algo: Algos.group,
    mhab: charlieAid,
    isith: charlieReceivedIcp.kt,
    nsith: charlieReceivedIcp.nt,
    toad: parseInt(charlieReceivedIcp.bt),
    wits: charlieReceivedIcp.b,
    states,
    rstates: states,
  });
  const charlieIcpOp = await charlieIcp.op();
  const charlieSerder = charlieIcp.serder;
  const charlieSigers = charlieIcp.sigs.map((sig) => new Siger({ qb64: sig }));

  const charlieIms = d(messagize(charlieSerder, charlieSigers));
  const charlieAtc = charlieIms.substring(charlieSerder.size);
  const charlieEmbeds = { icp: [charlieSerder, charlieAtc] };

  const charlieRecp = [aliceAid["state"], bobAid["state"]].map(
    (state) => state["i"]
  );
  await charlieClient
    .exchanges()
    .send(
      "charlie",
      "multisig",
      charlieAid,
      "/multisig/icp",
      { gid: charlieSerder.pre, smids: smids, rmids: smids },
      charlieEmbeds,
      charlieRecp
    );

  console.info("Charlie has joined the multi-sig and sent his response!");

  await waitAndGetDoneOp(aliceClient, aliceIcpOp);
  await waitAndGetDoneOp(bobClient, bobIcpOp);
  await waitAndGetDoneOp(charlieClient, charlieIcpOp);

  const aliceIdentifiers = await aliceClient.identifiers().list();
  const multisigAid = aliceIdentifiers.aids.find((aid) => aid.group);
  const multisig = await aliceClient.identifiers().get(multisigAid.name);
  console.info("Multi-sig fully complete!", { multisig });

  //Rotate
  const nextSequence = (Number(multisig.state.s) + 1).toString();

  aliceAid = await rotateIdentifier(aliceClient, "alice");
  bobAid = await rotateIdentifier(bobClient, "bob");
  charlieAid = await rotateIdentifier(charlieClient, "charlie");
  daveAid = await rotateIdentifier(daveClient, "dave");

  let op1 = await aliceClient.keyStates().query(aliceAid.prefix, nextSequence);
  op1 = await waitAndGetDoneOp(aliceClient, op1);
  const aid1State = op1["response"];

  let op2 = await bobClient.keyStates().query(bobAid.prefix, nextSequence);
  op2 = await waitAndGetDoneOp(bobClient, op2);
  const aid2State = op2["response"];

  // let op3 = await charlieClient.keyStates().query(charlieAid.prefix, nextSequence);
  // op3= await waitAndGetDoneOp(charlieClient, op3);
  // const aid3State = op3["response"];

  let op3 = await daveClient.keyStates().query(daveAid.prefix, nextSequence);
  op3 = await waitAndGetDoneOp(daveClient, op3);
  const aid3State = op3["response"];

  console.log({ aid1State, aid2State, aid3State });
  const rstates = [aid1State, aid2State, aid3State];

  //Alice rotates the multisig
  const aliceRotateMultisig = await rotateMultisig(aliceClient, rstates, [
    aid2State,
    aid3State,
  ]);
  op1 = aliceRotateMultisig.op;
  let serder = aliceRotateMultisig.serder;
  let rembeds = aliceRotateMultisig.rembeds;
  smids = aliceRotateMultisig.smids;
  recp = aliceRotateMultisig.recp;
  console.log({ recp });

  await aliceClient
    .exchanges()
    .send(
      "alice",
      "multisig",
      aliceAid,
      "/multisig/rot",
      { gid: serder.pre, smids: smids, rmids: smids },
      rembeds,
      recp
    );

  console.log("Alice initiates rotation event, waiting for others to join...");

  //Bob check for notification and join the rotation event
  let msgSaid = await waitForFirstNotification(
    bobClient,
    "/multisig/rot",
    30000
  );
  await new Promise((resolve) => setTimeout(resolve, 5000));
  let exn = (await bobClient.groups().getRequest(msgSaid))[0].exn;
  console.log("Bob received exchange message to join the rotation event");
  const bobRotateMultisig = await rotateMultisig(
    bobClient,
    rstates,
    [aid1State, aid3State],
    exn
  );
  op2 = bobRotateMultisig.op;
  serder = bobRotateMultisig.serder;
  rembeds = bobRotateMultisig.rembeds;
  smids = bobRotateMultisig.smids;
  recp = bobRotateMultisig.recp;
  await bobClient
    .exchanges()
    .send(
      "bob",
      "multisig",
      bobAid,
      "/multisig/ixn",
      { gid: serder.pre, smids: smids, rmids: smids },
      rembeds,
      recp
    );
  console.log("Bob joins rotation event, waiting for others...");

  // Third memeber check for notifications and join the rotation event
  // msgSaid = await waitForFirstNotification(charlieClient, "/multisig/rot");
  msgSaid = await waitForFirstNotification(daveClient, "/multisig/rot");
  console.log(
    "Third member received exchange message to join the rotation event"
  );
  // exn = (await charlieClient.groups().getRequest(msgSaid))[0].exn;
  // const thirdMemberRotateMultisig = await rotateMultisig(
  //   charlieClient,
  //   rstates,
  //   [aid1State, aid2State],
  //   exn
  // );

  // op3 = thirdMemberRotateMultisig.op;
  // serder = thirdMemberRotateMultisig.serder;
  // rembeds = thirdMemberRotateMultisig.rembeds;
  // smids = thirdMemberRotateMultisig.smids;
  // recp = thirdMemberRotateMultisig.recp;

  // await charlieClient
  //   .exchanges()
  //   .send(
  //     "charlie",
  //     "multisig",
  //     charlieAid,
  //     "/multisig/ixn",
  //     { gid: serder.pre, smids: smids, rmids: smids },
  //     rembeds,
  //     recp
  //   );
  exn = (await daveClient.groups().getRequest(msgSaid))[0].exn;

  const rot = new Serder(exn.e.rot);
  const keeper = await daveClient.manager!.get(daveAid);
  const sigs = keeper.sign(rot.raw);
  const daveJoinMultisig = await daveClient.groups()
    .join("multisig", rot, sigs, exn.a?.gid as string, smids, smids);
  const daveOp = daveJoinMultisig.op;
  await daveClient
    .exchanges()
    .send(
      "dave",
      "multisig",
      daveAid,
      "/multisig/rot",
      { gid: serder.pre, smids: smids, rmids: smids },
      rembeds,
      recp
    );

  const daveIdentifiers = await daveClient.identifiers().list();
  console.log("Third member joins rotation event!");
  // Check for completion
  await waitAndGetDoneOp(aliceClient, op1, 30000);
  await waitAndGetDoneOp(bobClient, op2, 30000);
  // await waitAndGetDoneOp(charlieClient, op3, 30000);
  await waitAndGetDoneOp(daveClient, daveOp, 30000);
  console.log({ daveIdentifiers })
  console.log("Multisig rotation completed!");
}

void main();
