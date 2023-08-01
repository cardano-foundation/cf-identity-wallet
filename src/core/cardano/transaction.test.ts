import { Blockfrost, Lucid, Network, ProtocolParameters } from "lucid-cardano";

import dotenv from "dotenv";
import { TransactionBuilder } from "./transaction";
import { Wallet } from "./wallet";
import { BLOCKFROST_PREPROD_SELF_HOSTED } from "./provider/config";
dotenv.config();
describe("Cardano transactions", () => {
  const blockfrostUrl = BLOCKFROST_PREPROD_SELF_HOSTED;
  const network: Network = "Preprod";
  let blockfrostProvider: Blockfrost;
  let mockProtocolParameters: ProtocolParameters;

  beforeEach(() => {
    blockfrostProvider = new Blockfrost(blockfrostUrl);
    mockProtocolParameters = {
      minFeeA: 1,
      minFeeB: 2,
      maxTxSize: 3,
      maxValSize: 4,
      keyDeposit: BigInt(5),
      poolDeposit: BigInt(6),
      priceMem: 7.0,
      priceStep: 8.0,
      maxTxExMem: BigInt(9),
      maxTxExSteps: BigInt(10),
      coinsPerUtxoByte: BigInt(11),
      collateralPercentage: 12,
      maxCollateralInputs: 13,
      // eslint-disable-next-line
      // @ts-ignore
      costModels: {},
    };

    jest
      .spyOn(blockfrostProvider, "getProtocolParameters")
      .mockImplementation(() => Promise.resolve(mockProtocolParameters));
  });

  test("static new method should create an instance of TransactionBuilder", async () => {
    const walletApi = new Wallet("wallet-name");
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
});
