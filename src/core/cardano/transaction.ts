import { Blockfrost, Lucid, Network, Tx, WalletApi } from "lucid-cardano";

class TransactionBuilder {
  private lucid: Lucid;
  private constructor(lucid: Lucid) {
    this.lucid = lucid;
  }
  static async new(
    apiWallet: WalletApi,
    network: Network,
    url: string
  ): Promise<TransactionBuilder> {
    const blockfrost = new Blockfrost(url);

    const lucid = await Lucid.new(blockfrost, network);
    lucid.selectWallet(apiWallet);

    return new TransactionBuilder(lucid);
  }
  async buildTransaction(
    outputs: { address: string; assets: { [unit: string]: bigint } }[],
    changeAddress?: string
  ): Promise<Tx> {
    const tx = await this.lucid.newTx();
    for (let i = 0; i < outputs.length; i++) {
      await tx.payToAddress(outputs[i].address, outputs[i].assets);
    }

    if (changeAddress) {
      await tx.complete({ change: { address: changeAddress } });
    } else {
      await tx.complete();
    }

    return tx;
  }
}

export { TransactionBuilder };
