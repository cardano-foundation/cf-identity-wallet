import {
  Blockfrost,
  Network,
  ProtocolParameters,
  TxComplete,
} from "lucid-cardano";

import dotenv from "dotenv";
import { BLOCKFROST_PREPROD_SELF_HOSTED } from "./provider/config";
import { TransactionBuilder } from "./transaction";

dotenv.config();

const validRootPrivateKeyBech32 =
  "xprv1yprjk4zc56qg6qcqcmlsfpyflmmp5gpucrnmucclwn34hfpfddv2mr57yuwc4utzfpjyldw5cxnn6k06kr0myks9z2jpfd6pnxrswp6jfkdjrhe09cypv6mldcamc4ggqywwrpceu2cwaqwclnxjj2udgc25sp2u";

describe("Cardano transactions", () => {
  const blockfrostUrl = BLOCKFROST_PREPROD_SELF_HOSTED;
  const network: Network = "Preprod";
  let blockfrostProvider: Blockfrost;
  let mockProtocolParameters: ProtocolParameters;

  const addresses = [
    "addr_test1qrqe03xqpl2jwh3a8pgca9gjm5k8n4jgv3ytppppavvynwdt9gat4d3njffvnlde55dwtqyev48z8ywwqask7rsmwd9sa8lf7s",
    "addr_test1qp7jhfea5lr7j9f6axe5vc6pc0m9mgxxjyjxplh3qeyh869t9gat4d3njffvnlde55dwtqyev48z8ywwqask7rsmwd9s35su0w",
    "addr_test1qp699gyph5gj8c4whp62048z7w7kte2w5ghkpl36wwh5z84t9gat4d3njffvnlde55dwtqyev48z8ywwqask7rsmwd9s0pxmc2",
  ];

  const balances = [
    {
      lovelace: 42000000n,
      b0d07d45fe9514f80213f4020e5a61241458be626841cde717cb38a76e7574636f696e:
        12n,
    },
  ];

  const utxos = [
    {
      txHash:
        "39a7a284c2a0948189dc45dec670211cd4d72f7b66c5726c08d9b3df11e44d58",
      address:
        "addr1qxqs59lphg8g6qndelq8xwqn60ag3aeyfcp33c2kdp46a09re5df3pzwwmyq946axfcejy5n4x0y99wqpgtp2gd0k09qsgy6pz",
      outputIndex: 0,
      assets: {
        lovelace: 10000000n, // 10 ADA
      },
    },
  ];

  beforeEach(() => {
    blockfrostProvider = new Blockfrost(blockfrostUrl);

    mockProtocolParameters = {
      minFeeA: 44,
      minFeeB: 155381,
      maxTxSize: 16384,
      maxValSize: 5000,
      keyDeposit: 2000000n,
      poolDeposit: 500000000n,
      priceMem: 0.0577,
      priceStep: 0.0000721,
      maxTxExMem: 14000000n,
      maxTxExSteps: 10000000000n,
      coinsPerUtxoByte: 4310n,
      collateralPercentage: 150,
      maxCollateralInputs: 3,
      // eslint-disable-next-line
      // @ts-ignore
      costModels: {},
    };

    jest
      .spyOn(blockfrostProvider, "getProtocolParameters")
      .mockImplementation(() => Promise.resolve(mockProtocolParameters));
  });

  test("static new method should create an instance of TransactionBuilder", async () => {
    const txBuilder = await TransactionBuilder.new(
      validRootPrivateKeyBech32,
      network,
      blockfrostUrl
    );
    expect(txBuilder).toBeInstanceOf(TransactionBuilder);
  });

  test("build a valid transaction with change address", async () => {
    const outputs = [
      { address: addresses[0], assets: { lovelace: 2000000n } }, // 2 ADA
    ];

    jest
      .spyOn(blockfrostProvider, "getProtocolParameters")
      .mockImplementation(() => Promise.resolve(mockProtocolParameters));

    const txBuilder = await TransactionBuilder.new(
      validRootPrivateKeyBech32,
      network,
      blockfrostUrl
    );

    jest
      .spyOn(txBuilder.lucid.provider, "getUtxos")
      .mockImplementation(() => Promise.resolve(utxos));

    const tx = await txBuilder.buildTransaction(outputs, addresses[2]);

    expect(tx).toBeInstanceOf(TxComplete);

    const txJson = JSON.parse(tx.txComplete.to_json());

    expect(txJson.is_valid).toBe(true);

    // Check inputs
    expect(txJson.body.inputs[0].transaction_id).toBe(utxos[0].txHash);

    // Check outputs+fee
    const fee = BigInt(txJson.body.fee);
    let totalAdaInOutputs = 0n;
    txJson.body.outputs.map(
      (output: { amount: { coin: string } }) =>
        (totalAdaInOutputs += BigInt(output.amount.coin))
    );

    expect(totalAdaInOutputs + fee).toBe(utxos[0].assets.lovelace);
  });

  test("should throw an error if outputs value > inputs value", async () => {
    const outputs = [
      { address: addresses[0], assets: { lovelace: 20000000n } }, // 20 ADA
    ];

    const txBuilder = await TransactionBuilder.new(
      validRootPrivateKeyBech32,
      network,
      blockfrostUrl
    );

    jest
      .spyOn(txBuilder.lucid.provider, "getUtxos")
      .mockImplementation(() => Promise.resolve(utxos));

    txBuilder
      .buildTransaction(outputs)
      .catch((error) => expect(error).toBe("InputsExhaustedError"));
  });

  test("should throw an error if not enough inputs value to cover the fee", async () => {
    const outputs = [
      { address: addresses[0], assets: { lovelace: 1931948n } }, // 1.931948 ADA, expected fee 168053
    ];

    const txBuilder = await TransactionBuilder.new(
      validRootPrivateKeyBech32,
      network,
      blockfrostUrl
    );

    jest
      .spyOn(txBuilder.lucid.provider, "getUtxos")
      .mockImplementation(() => Promise.resolve(utxos));

    txBuilder
      .buildTransaction(outputs)
      .catch((error) => expect(error).toBe("InputsExhaustedError"));
  });
});
