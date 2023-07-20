import { Blockfrost, Lucid, Network, Tx, WalletApi } from "lucid-cardano";
import {Bip32PrivateKey} from "@dcspark/cardano-multiplatform-lib-browser";
import {TxComplete} from "lucid-cardano/types/src/lucid/tx_complete";

class TransactionBuilder {
  lucid: Lucid;
  private constructor(lucid: Lucid) {
    this.lucid = lucid;
  }
  static async new(
    bech32Bip32PrivateKey: string,
    network: Network,
    url: string
  ): Promise<TransactionBuilder> {

    const rootPrivateKey = Bip32PrivateKey.from_bech32(bech32Bip32PrivateKey);
    const bech32PrivateKey = rootPrivateKey.to_raw_key().to_bech32();

    const blockfrost = new Blockfrost(url);
    const lucid = await Lucid.new(blockfrost, network);
    lucid.selectWalletFromPrivateKey(bech32PrivateKey);

    return new TransactionBuilder(lucid);
  }
  async buildTransaction(
    outputs: { address: string; assets: { [unit: string]: bigint } }[],
    changeAddress?: string
  ): Promise<TxComplete> {

    const tx = await this.lucid.newTx();

    for (let i = 0; i < outputs.length; i++) {
      await tx.payToAddress(outputs[i].address, outputs[i].assets);
    }

    if (changeAddress) {
      return await tx.complete({ change: { address: changeAddress } });
    } else {
      return await tx.complete();
    }

  }
}

export { TransactionBuilder };
