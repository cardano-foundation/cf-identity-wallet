import { BaseRecord } from "@aries-framework/core";

class CryptoAccountRecord extends BaseRecord {
  value!: string;

  static readonly type = "CryptoAccountRecord";
  readonly type = CryptoAccountRecord.type;

  constructor(props: { id: string; createdAt?: Date; value: string }) {
    super();

    if (props) {
      this.id = props.id;
      this.value = props.value;
      this.createdAt = props.createdAt ?? new Date();
    }
  }

  getTags() {
    return this._tags;
  }
}

export { CryptoAccountRecord };
