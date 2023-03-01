import PouchDB from 'pouchdb';
import find from 'pouchdb-find';
import {IError, IResponse} from './types';
import {GET_DOC_ERROR, NOT_INITIALIZED_DB_ERROR, ON_INIT_DB_ERROR, SET_DOC_ERROR} from './errors';
PouchDB.plugin(find);
PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite'));

export const PouchAPI = {
  databaseName: 'database-dev',
  db: undefined as undefined | typeof PouchDB,
  init(databaseName?: string) {
    try {
      this.databaseName = databaseName || this.databaseName;
      this.db = new PouchDB(`${databaseName}.db`, {
        adapter: 'cordova-sqlite'
      });
    } catch (error: any) {
      throw {
        success: false,
        error: {
          ...error,
          description: ON_INIT_DB_ERROR,
        },
      };
    }
  },
  async getTable(tableName: string): Promise<IResponse> {
    if (!this.db)
      return {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };
    const table = `${tableName}:`;
    const all = await this.db.allDocs({
      include_docs: true,
      startkey: table,
      endkey: `${tableName}\uffff`,
    });
    return {
      success: true,
      data: all.rows
    };
  },
  async getIDs(): Promise<IResponse> {
    if (!this.db)
      return {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };
    const all = await this.db.allDocs();
    const result = all.rows.map((d: {id: string}) => d.id);
    return {
      success: true,
      data: result,
    };
  },
  async getTableIDs(tableName?: string): Promise<IResponse> {
    if (!this.db)
      return {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };
    const table = `${tableName}:`;
    const all = await this.getTable(table);
    const result = all.data.map((d: {id: string}) => d.id.replace(table, ''));

    return {
      success: true,
      data: result,
    };
  },
  async get(tableName: string, id: string): Promise<IResponse> {
    if (!this.db)
      return {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };
    return this.db
      .get(`${tableName}:${id}`)
      .then((result) => {
        return {
          success: true,
          data: result,
        };
      })
      .catch((error: {status: number; name: string}) => {
        return {
          success: false,
          error: {
            ...error,
            description: GET_DOC_ERROR,
          },
        };
      });
  },
  async set(tableName: string, id: string, obj: any):Promise<void> {
    if (!this.db)
      throw {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };

    await this.db
      .put({
        _id: `${tableName}:${id}`,
        ...obj,
      })
      .catch(async (error: {name: string; status: number}) => {
        if (error.name === 'conflict' && error.status === 409) {
          await this.update(tableName, id, obj).catch(
            (err: IResponse) => {
              throw err
            }
          );
        } else {
          throw {
            success: false,
            error: {
              ...error,
              description: SET_DOC_ERROR,
            },
          };
        }
      });
  },
  update: async function (tableName: string, id: string, obj: any):Promise<void> {
    if (!this.db)
      throw {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };
    await this.get(tableName, id).then(async docToUpdate => {
      await this.db
          .put({
            _id: `${tableName}:${id}`,
            _rev: docToUpdate.data._rev,
            ...obj,
          })
          .catch((error: IError) => {
            throw {
              success: false,
              error: {
                ...error,
                description: GET_DOC_ERROR,
              },
            };
          });
    }).catch(error => {
      throw {
        ...error,
        description: GET_DOC_ERROR,
      };
    });
  },
  async remove(tableName: string, id: string):Promise<void> {
    if (!this.db)
      throw {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };
    this.db
      .get(`${tableName}:${id}`)
      .then((doc) => {
        this.db.remove(doc);
      })
      .catch((error: {status: number; name: string}) => {
        throw {
          success: false,
          error: {
            ...error,
            description: GET_DOC_ERROR,
          },
        };
      });
  },
  async clear():Promise<void> {
    if (!this.db)
      throw {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };
    await this.db.destroy();
  },
  async close():Promise<void> {
    if (!this.db)
      throw {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };
    await this.db.close();
  },
};
