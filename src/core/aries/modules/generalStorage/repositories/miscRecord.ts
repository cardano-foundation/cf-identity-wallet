import { BaseRecord } from "@aries-framework/core";

class MiscRecord extends BaseRecord {
  value!: string;

  static readonly type = "MiscRecord";
  readonly type = MiscRecord.type;

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

export { MiscRecord };
