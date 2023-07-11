import {Network} from "lucid-cardano";
import {Addresses} from "./addresses";
import {TransactionBuilder} from "./transaction";
import dotenv from 'dotenv';
dotenv.config();
describe("Cardano transactions", () => {

  const blockfrostUrl = "https://cardano-preview.blockfrost.io/api/v0";
  const network:Network = "Preview";


  test("should throw if an invalid mnemonic is provided", () => {
    const blockfrostKey = process.env.BLOCKFROST_PREVIEW_KEY;
    console.log("blockfrostKey");
    console.log(blockfrostKey);
    //TransactionBuilder.new()
  });
});
