import { NetworkType } from "../../cardano/addresses.types";
import { Blockchain, CryptoAccountRecordShortDetails } from "../agent.types";
import { CryptoAccountRecord } from "../modules";
import { AgentService } from "./agentService";

class CryptoService extends AgentService {
  async storeCryptoAccountRecord(
    id: string,
    addresses: Map<NetworkType, Map<number, Map<number, string[]>>>,
    rewardAddresses: Map<NetworkType, string[]>,
    usesIdentitySeedPhrase = false
  ): Promise<void> {
    await this.agent.modules.generalStorage.saveCryptoRecord(
      new CryptoAccountRecord({
        id,
        addresses,
        rewardAddresses,
        usesIdentitySeedPhrase,
      })
    );
  }

  async getAllCryptoAccountRecord(): Promise<
    CryptoAccountRecordShortDetails[]
    > {
    const cryptoAccountRecordsShortDetails: CryptoAccountRecordShortDetails[] =
      [];
    const listRecords =
      await this.agent.modules.generalStorage.getAllCryptoRecord();

    for (let i = 0; i < listRecords.length; i++) {
      const record = listRecords[i];
      cryptoAccountRecordsShortDetails.push({
        id: record.id,
        usesIdentitySeedPhrase: record.usesIdentitySeedPhrase,
        blockchain: Blockchain.CARDANO,
        totalADAinUSD: 0,
      });
    }

    return cryptoAccountRecordsShortDetails;
  }

  async cryptoAccountIdentitySeedPhraseExists(): Promise<boolean> {
    return this.agent.modules.generalStorage.cryptoAccountIdentitySeedPhraseExists();
  }

  async removeCryptoAccountRecordById(id: string): Promise<void> {
    await this.agent.modules.generalStorage.removeCryptoRecordById(id);
  }
}

export { CryptoService };
