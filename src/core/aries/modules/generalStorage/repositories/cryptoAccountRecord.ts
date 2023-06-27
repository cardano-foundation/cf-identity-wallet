import { BaseRecord } from "@aries-framework/core";

class CryptoAccountRecord extends BaseRecord {
  addresses: string[] = [];
  stakeKeys: string[] = [];

  static readonly type = "CryptoAccountRecord";
  readonly type = CryptoAccountRecord.type;

  constructor(props: { id: string; address: string; stakeKey: string }) {
    super();

    if (props) {
      this.id = props.id;
      this.addresses.push(props.address);
      this.stakeKeys.push(props.stakeKey);
    }
  }

  getTags() {
    return this._tags;
  }
}

export { CryptoAccountRecord };
