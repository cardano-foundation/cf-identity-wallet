import {assetsToValue, Blockfrost, Network, ProtocolParameters} from "lucid-cardano";

import dotenv from "dotenv";
import { TransactionBuilder } from "./transaction";
import { WalletApi } from "./walletApi";
import { BLOCKFROST_PREPROD_SELF_HOSTED } from "./provider/config";

dotenv.config();
describe("Cardano transactions", () => {
  const blockfrostUrl = BLOCKFROST_PREPROD_SELF_HOSTED;
  const network: Network = "Preprod";
  let blockfrostProvider: Blockfrost;
  let mockProtocolParameters: ProtocolParameters;

  const addresses = [
    "addr_test1qrqe03xqpl2jwh3a8pgca9gjm5k8n4jgv3ytppppavvynwdt9gat4d3njffvnlde55dwtqyev48z8ywwqask7rsmwd9sa8lf7s",
    "addr_test1qp7jhfea5lr7j9f6axe5vc6pc0m9mgxxjyjxplh3qeyh869t9gat4d3njffvnlde55dwtqyev48z8ywwqask7rsmwd9s35su0w",
    "addr_test1qp699gyph5gj8c4whp62048z7w7kte2w5ghkpl36wwh5z84t9gat4d3njffvnlde55dwtqyev48z8ywwqask7rsmwd9s0pxmc2"
  ]

  const balances = [
    {
      "lovelace": 42000000n,
      "b0d07d45fe9514f80213f4020e5a61241458be626841cde717cb38a76e7574636f696e": 12n,
    }
  ]

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
      costModels: {
      },
    };

    jest.spyOn(blockfrostProvider, "getProtocolParameters").mockImplementation(() => Promise.resolve(mockProtocolParameters));

  });

  test("static new method should create an instance of TransactionBuilder", async () => {
    const walletApi = new WalletApi({publicKeyBech32: "wallet-pub"}, blockfrostUrl);
    const txBuilder = await TransactionBuilder.new(
      walletApi,
      network,
      blockfrostUrl
    );
    expect(txBuilder).toBeInstanceOf(TransactionBuilder);
  });

  test("should mock getProtocolParameters method", async () => {

    const protocolParameters = await blockfrostProvider.getProtocolParameters();

    expect(protocolParameters).toEqual(mockProtocolParameters);
  });

  test("build a valid transaction", async () => {

    const outputs = [
      { address: addresses[0], assets: { lovelace: 1000000n } },
      { address: addresses[1], assets: { lovelace: 200n } },
    ];

    const wallet = new WalletApi({publicKeyBech32: "wallet-pub"}, blockfrostUrl);

    jest.spyOn(blockfrostProvider, "getProtocolParameters").mockImplementation(() => Promise.resolve(mockProtocolParameters));

    const value = assetsToValue(balances[0]);
    const valueHex = Buffer.from(value.to_bytes()).toString("hex");

    jest.spyOn(wallet, "getBalance").mockImplementation(() => Promise.resolve(valueHex));

    const balance = await wallet.getBalance();
    expect(balance).toBe(valueHex);

    /*
    const txBuilder = await TransactionBuilder.new(
      wallet,
      network,
      blockfrostUrl
    );

    const changeAddress = addresses[2];

    const tx = await txBuilder.buildTransaction(outputs, changeAddress);

    expect(tx).toBe(true);*/


  });
});
