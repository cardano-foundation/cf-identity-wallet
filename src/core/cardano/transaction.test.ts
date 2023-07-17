import {Lucid, Network, ProtocolParameters} from "lucid-cardano";

import dotenv from "dotenv";
import { TransactionBuilder } from "./transaction";
import { Wallet } from "./wallet";
import { BLOCKFROST_PREPROD_SELF_HOSTED } from "./provider/config";
import { BlockfrostProvider } from "./provider/blockfrost";
dotenv.config();
describe("Cardano transactions", () => {
  const blockfrostUrl = BLOCKFROST_PREPROD_SELF_HOSTED;
  const network: Network = "Preprod";
  let blockfrostProvider: BlockfrostProvider;

  beforeEach(() => {
    blockfrostProvider = new BlockfrostProvider(blockfrostUrl);
  });

  test("constructor should throw an error if not provided a Lucid instance", () => {
    expect(() => new TransactionBuilder({} as Lucid)).toThrowError(
      "Invalid argument: 'lucid' must be an instance of Lucid instead of object"
    );
  });

  test("constructor should create a new instance if provided a Lucid instance", async () => {
    const blockfrost = new BlockfrostProvider(blockfrostUrl);
    const lucid = await Lucid.new(blockfrost, network);
    expect(() => new TransactionBuilder(lucid)).not.toThrow();
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

    const mockProtocolParameters: ProtocolParameters = {
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

    jest.spyOn(blockfrostProvider, "getProtocolParameters").mockImplementation(() => Promise.resolve(mockProtocolParameters));

    const protocolParameters = await blockfrostProvider.getProtocolParameters();

    expect(protocolParameters).toEqual(mockProtocolParameters);
  });
});
