import type { Asset } from "@meshsdk/core";
import { Network } from "lucid-cardano";

import dotenv from 'dotenv';
import {TransactionBuilder} from "./transaction";
dotenv.config();
describe("Cardano transactions", () => {

  const blockfrostUrl = "https://cardano-preview.blockfrost.io/api/v0";
  const network:Network = "Preview";
  let assets: Asset[] = [];


  test("test1234", () => {
    const a = TransactionBuilder.new(undefined, network, blockfrostUrl,"")

    const blockfrostKey = process.env.BLOCKFROST_PREVIEW_KEY;
    console.log("blockfrostKey");
    console.log(blockfrostKey);
    console.log(assets);
    // TransactionBuilder.new()
  });
});
