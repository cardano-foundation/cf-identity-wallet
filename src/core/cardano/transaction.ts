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
    console.log("Yeeee1");
    const tx = await this.lucid.newTx();
    console.log("Yeeee2");
    try {
      for (let i = 0; i < outputs.length; i++) {
        console.log("Yeeee3");
        await tx.payToAddress(outputs[i].address, outputs[i].assets);
      }

    } catch (e) {
      console.log("error: in buildTransaction!!");
      console.log(e);
    }

    console.log("Yeeee4");
    /*
    if (changeAddress) {
      await tx.complete({ change: { address: changeAddress } });
    } else {
      await tx.complete();
    }*/

    console.log("Yeeee5");
    return tx;
  }
}

export { TransactionBuilder };
