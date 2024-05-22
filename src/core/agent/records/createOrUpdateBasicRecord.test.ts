import { createOrUpdateBasicRecord } from "./createOrUpdateBasicRecord";
import { BasicRecord } from "./basicRecord";
import { Agent } from "../agent";

jest.mock("../agent", () => ({
  Agent: {
    agent: {
      basicStorage: {
        findById: jest.fn(),
        update: jest.fn(),
        save: jest.fn(),
      },
    },
  },
}));

describe("Create or update basic record", () => {
  test("Should create basic record", async () => {
    const record = {
      id: "id",
      content: {
        key: "value",
      },
    };
    await createOrUpdateBasicRecord(new BasicRecord(record));
    const save = Agent.agent.basicStorage.save as jest.Mock;
    expect(save).toBeCalledWith(expect.objectContaining(record));
  });

  test("Should update basic record", async () => {
    const record = {
      id: "id",
      content: {
        key: "value",
      },
    };
    Agent.agent.basicStorage.findById = jest.fn().mockResolvedValue(record);
    await createOrUpdateBasicRecord(new BasicRecord(record));
    const update = Agent.agent.basicStorage.update as jest.Mock;
    expect(update).toBeCalledWith(expect.objectContaining(record));
  });
});
