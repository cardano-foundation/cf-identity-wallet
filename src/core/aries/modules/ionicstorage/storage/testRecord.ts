import { BaseRecord } from "@aries-framework/core";

class TestRecord extends BaseRecord {
  testField!: string;

  readonly type = "TestRecord";
  static readonly type = "TestRecord";

  constructor(options: { id: string; testField: string; createdAt: Date }) {
    super();

    if (options) {
      this.id = options.id;
      this.testField = options.testField;
      this.createdAt = options.createdAt;
    }
  }

  public getTags() {
    return this._tags;
  }
}

export { TestRecord };
