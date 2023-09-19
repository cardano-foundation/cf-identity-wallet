interface StorageObject {
  name: string;
  value: Record<string, unknown> | string;
  tags: Record<string, unknown>;
  category: string;
}

export type { StorageObject };
