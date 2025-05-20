import {
  Query,
  StorageMessage,
  StorageService,
} from "../../storage/storage.types";
import { NotificationRoute } from "../services/keriaNotificationService.types";
import {
  NotificationRecord,
  NotificationRecordStorageProps,
} from "./notificationRecord";
import { NotificationStorage } from "./notificationStorage";

const storageService = jest.mocked<StorageService<NotificationRecord>>({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const notificationStorage = new NotificationStorage(storageService);

const id1 = "id1";
const id2 = "id2";

const notificationRecordProps: NotificationRecordStorageProps = {
  id: id1,
  createdAt: new Date(),
  a: {},
  route: NotificationRoute.ExnIpexApply,
  read: true,
  connectionId: "connectionId",
  receivingPre: "EI8fS00-AxbbqXmwoivpw-0ui0qgZtGbh8Ue-ZVbxYSX",
};
const notificationRecordA = new NotificationRecord(notificationRecordProps);

const notificationRecordB = new NotificationRecord({
  ...notificationRecordProps,
  id: id2,
});

describe("Notification Storage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should save notification record", async () => {
    storageService.save.mockResolvedValue(notificationRecordA);
    await notificationStorage.save(notificationRecordProps);
    expect(storageService.save).toBeCalledWith(notificationRecordA);
  });

  test("Should delete notification record", async () => {
    storageService.delete.mockResolvedValue();
    await notificationStorage.delete(notificationRecordA);
    expect(storageService.delete).toBeCalledWith(notificationRecordA);
  });

  test("Should delete notification record by ID", async () => {
    storageService.deleteById.mockResolvedValue();
    await notificationStorage.deleteById(notificationRecordA.id);
    expect(storageService.deleteById).toBeCalledWith(notificationRecordA.id);
  });

  test("Should update notification record", async () => {
    storageService.update.mockResolvedValue();
    await notificationStorage.update(notificationRecordA);
    expect(storageService.update).toBeCalledWith(notificationRecordA);
  });

  test("Should find notification record by ID", async () => {
    storageService.findById.mockResolvedValue(notificationRecordA);
    const result = await notificationStorage.findById(notificationRecordA.id);
    expect(result).toEqual(notificationRecordA);
  });

  test("Can find expected notification by ID", async () => {
    storageService.findById.mockResolvedValue(notificationRecordA);
    const result = await notificationStorage.findExpectedById(
      notificationRecordA.id
    );
    expect(result).toEqual(notificationRecordA);
  });

  test("Should throw for missing expected notification", async () => {
    storageService.findById.mockResolvedValue(null);
    await expect(
      notificationStorage.findExpectedById(notificationRecordA.id)
    ).rejects.toThrowError(StorageMessage.RECORD_DOES_NOT_EXIST_ERROR_MSG);
  });

  test("Should find all notification records by query", async () => {
    const query: Query<NotificationRecord> = {
      filter: {
        title: "title",
      },
      sort: {
        createdAt: "desc",
      },
      limit: 10,
    };
    const records = [notificationRecordA, notificationRecordB];
    storageService.findAllByQuery.mockResolvedValue(records);
    const result = await notificationStorage.findAllByQuery(query);
    expect(result).toEqual(records);
  });

  test("Should get all notification records", async () => {
    const records = [notificationRecordA, notificationRecordB];
    storageService.getAll.mockResolvedValue(records);
    const result = await notificationStorage.getAll();
    expect(result).toEqual(records);
  });

  // tests error
  test("Should handle saving error", async () => {
    storageService.save.mockRejectedValue(new Error("Saving error"));
    await expect(
      notificationStorage.save(notificationRecordProps)
    ).rejects.toThrow("Saving error");
  });

  test("Should handle deleting error", async () => {
    storageService.delete.mockRejectedValue(new Error("Deleting error"));
    await expect(
      notificationStorage.delete(notificationRecordA)
    ).rejects.toThrow("Deleting error");
  });

  test("Should handle updating error", async () => {
    storageService.update.mockRejectedValue(new Error("Updating error"));
    await expect(
      notificationStorage.update(notificationRecordA)
    ).rejects.toThrow("Updating error");
  });

  test("Should handle finding error", async () => {
    storageService.findById.mockRejectedValue(new Error("Finding error"));
    await expect(
      notificationStorage.findById(notificationRecordA.id)
    ).rejects.toThrow("Finding error");
  });

  test("Should handle not found", async () => {
    storageService.findById.mockResolvedValue(null);
    const result = await notificationStorage.findById("nonexistentId");
    expect(result).toBeNull();
  });

  test("Should handle empty result", async () => {
    storageService.findAllByQuery.mockResolvedValue([]);
    const result = await notificationStorage.findAllByQuery({ filter: {} });
    expect(result).toEqual([]);
  });

  test("Should handle empty result for getAll", async () => {
    storageService.getAll.mockResolvedValue([]);
    const result = await notificationStorage.getAll();
    expect(result).toEqual([]);
  });
});
