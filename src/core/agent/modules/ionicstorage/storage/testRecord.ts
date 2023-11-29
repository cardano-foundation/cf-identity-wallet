import { BaseRecord, TagsBase } from "@aries-framework/core";

class TestRecord extends BaseRecord {
  testField!: string;

  static readonly type = "TestRecord";
  readonly type = TestRecord.type;

  constructor(props: {
    id: string;
    testField: string;
    createdAt?: Date;
    tags?: TagsBase;
  }) {
    super();

    if (props) {
      this.id = props.id;
      this.testField = props.testField;
      this.createdAt = props.createdAt ?? new Date();
      this._tags = props.tags ?? {};
    }
  }

  getTags() {
    return this._tags;
  }
}

export { TestRecord };
