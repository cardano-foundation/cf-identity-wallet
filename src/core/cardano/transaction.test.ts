import type { Asset } from "@meshsdk/core";
import {Blockfrost, Lucid, Network, Tx} from "lucid-cardano";

import dotenv from "dotenv";
import {TransactionBuilder} from "./transaction";
import {Wallet} from "./wallet";
import {Address, Assets} from "@dcspark/cardano-multiplatform-lib-browser";
dotenv.config();
describe("Cardano transactions", () => {

  const addressBech32 = "addr_test1qqkv0gx8jgvwmuv8mna7a4emmly4zmlj0lwmq0efj55ny8dt9gat4d3njffvnlde55dwtqyev48z8ywwqask7rsmwd9s5va3zt";
  const blockfrostUrl = "https://cardano-preview.blockfrost.io/api/v0";
  const network:Network = "Preview";

  const blockfrostKey = process.env.BLOCKFROST_PREVIEW_KEY;
  console.log("blockfrostKey");
  console.log(blockfrostKey);


  test("constructor should throw an error if not provided a Lucid instance", () => {
    expect(() => new TransactionBuilder({} as Lucid)).toThrowError("Invalid argument: 'lucid' must be an instance of Lucid instead of object");
  });

  test("constructor should create a new instance if provided a Lucid instance", async () => {
    const blockfrost = new Blockfrost(blockfrostUrl, blockfrostKey);
    const lucid = await Lucid.new(blockfrost, network);
    expect(() => new TransactionBuilder(lucid)).not.toThrow();
  });

  test("test1234", async () => {

    const walletApi = new Wallet("wallet-name");
    const blockfrost = new Blockfrost(blockfrostUrl, blockfrostKey);
    const lucid = await Lucid.new(blockfrost, network);
    const a = await TransactionBuilder.new(walletApi, network, blockfrostUrl, blockfrostKey || "previewaLIUBOHJyeervH0uRxHP5JjyIcWvC8VA")

  });

  test('buildTransaction() should return a new transaction', async () => {

    const walletApi = new Wallet("wallet-name");
    const blockfrost = new Blockfrost(blockfrostUrl, blockfrostKey);
    const lucid = await Lucid.new(blockfrost, network);
    const txBuilder = await TransactionBuilder.new(walletApi, network, blockfrostUrl, blockfrostKey || "previewaLIUBOHJyeervH0uRxHP5JjyIcWvC8VA")

    const spy = jest.spyOn(lucid, "newTx");

    const address = addressBech32;
    const assets = {lovelace: 4213243n };
    const outputs = [{ address, assets }];

    const tx = await txBuilder.buildTransaction(outputs);

    expect(tx).toBeInstanceOf(Tx);
    expect(spy).toHaveBeenCalled();
  });
});
