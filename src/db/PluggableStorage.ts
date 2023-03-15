import {PouchStorage} from './pouchStorage';
import {IResponse} from './types';

export interface PluggableStorage {
  /*
       returns a string that identifies the type of storage being used, such as "pouchdb" or "sqlite"
     */
  getType(): string;
  init(): Promise<void>;
  set(tableName: string, id: string, value: any): Promise<IResponse>;
  get(tableName: string, id: string): Promise<IResponse>;
  remove(tableName: string, id: string): Promise<IResponse>;
  clear(): Promise<IResponse>;
  close(): Promise<IResponse>;
}

export const createPluggableStorage = (options: {
  name: string;
  type: string;
  inMemory?: boolean;
}): PluggableStorage => {
  if (options.type === 'pouchdb') {
    return new PouchStorage(options.name, options.inMemory);
  } else {
    throw new Error(`Unknown adapter: ${options.type}`);
  }
};
