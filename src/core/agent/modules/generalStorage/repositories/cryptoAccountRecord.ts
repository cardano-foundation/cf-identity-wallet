import { BaseRecord } from "@aries-framework/core";
import { NetworkType } from "../../../../cardano/addresses.types";

class CryptoAccountRecord extends BaseRecord {
  // This particular record assumes Shelley so we only care about mainnet/testnet as addresses don't vary on testnets.
  // Network Type -> Purpose -> Coin Type -> Array of addresses [index]
  addresses: Map<NetworkType, Map<number, Map<number, string[]>>> = new Map();
  rewardAddresses: Map<NetworkType, string[]> = new Map();
  displayName = "";
  usesIdentitySeedPhrase = false;

  static readonly type = "CryptoAccountRecord";
  readonly type = CryptoAccountRecord.type;

  constructor(props: {
    id: string;
    addresses: Map<NetworkType, Map<number, Map<number, string[]>>>;
    rewardAddresses: Map<NetworkType, string[]>;
    displayName: string;
    usesIdentitySeedPhrase?: boolean;
    createdAt?: Date;
  }) {
    super();

    if (props) {
      this.id = props.id;
      this.addresses = props.addresses;
      this.rewardAddresses = props.rewardAddresses;
      this.displayName = props.displayName;
      this.usesIdentitySeedPhrase = !!props.usesIdentitySeedPhrase;
      this.createdAt = props.createdAt ?? new Date();
    }
  }

  getTags() {
    return {
      ...this._tags,
      usesIdentitySeedPhrase: !!this.usesIdentitySeedPhrase,
      displayName: this.displayName,
    };
  }
}

export { CryptoAccountRecord };
