import type { Asset } from "@meshsdk/core";


import dotenv from 'dotenv';
dotenv.config();
describe("Cardano transactions", () => {

  const blockfrostUrl = "https://cardano-preview.blockfrost.io/api/v0";
  const network = "Preview";
  let assets: Asset[] = [];

  test("test1234", () => {
    const blockfrostKey = process.env.BLOCKFROST_PREVIEW_KEY;
    console.log("blockfrostKey");
    console.log(blockfrostKey);
    console.log(assets);
    // TransactionBuilder.new()
  });
});
