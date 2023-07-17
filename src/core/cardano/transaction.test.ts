import { Blockfrost, Lucid, Network } from "lucid-cardano";

import dotenv from "dotenv";
import { TransactionBuilder } from "./transaction";
import { Wallet } from "./wallet";
dotenv.config();
describe("Cardano transactions", () => {
  const blockfrostUrl = "https://cardano-preview.blockfrost.io/api/v0";
  const network: Network = "Preview";

  const blockfrostKey = process.env.BLOCKFROST_PREVIEW_KEY || "";

  test("constructor should throw an error if not provided a Lucid instance", () => {
    expect(() => new TransactionBuilder({} as Lucid)).toThrowError(
      "Invalid argument: 'lucid' must be an instance of Lucid instead of object"
    );
  });

  test("constructor should create a new instance if provided a Lucid instance", async () => {
    const blockfrost = new Blockfrost(blockfrostUrl, blockfrostKey);
    const lucid = await Lucid.new(blockfrost, network);
    expect(() => new TransactionBuilder(lucid)).not.toThrow();
  });

  test("static new method should create an instance of TransactionBuilder", async () => {
    const walletApi = new Wallet("wallet-name");
    const txBuilder = await TransactionBuilder.new(
      walletApi,
      network,
      blockfrostUrl,
      blockfrostKey
    );
    expect(txBuilder).toBeInstanceOf(TransactionBuilder);
  });
});
