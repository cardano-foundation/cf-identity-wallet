import PouchDB from 'pouchdb';
import find from 'pouchdb-find';
import {IError, IResponse} from './types';
import {GET_DOC_ERROR, GET_TABLE_ERROR, NOT_INITIALIZED_DB_ERROR, ON_INIT_DB_ERROR, SET_DOC_ERROR} from './errors';
PouchDB.plugin(find);
PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite'));
// required for unit testing
PouchDB.plugin(require('pouchdb-adapter-memory'));

export class Database {
  private dbName:string = 'database-dev';
  private db: typeof PouchDB;

  constructor(dbName?:string, memory?:boolean) {
    if (dbName) this.dbName = dbName;
    try {
      console.log("memory");
      console.log(memory);
      this.db = new PouchDB(`${this.dbName}.db`, {
        adapter: memory ? 'memory' : 'cordova-sqlite'
      });
    } catch (error: any) {
      throw {
        success: false,
        error: {
          ...error,
          description: ON_INIT_DB_ERROR,
        }
      };
    }
  }

  async getTable(tableName: string): Promise<IResponse> {
    if (!this.db)
      return {
        success: false,
        error: {
          status: 500,
          description: GET_TABLE_ERROR,
        },
      };
    const table = `${tableName}:`;
    return this.db.allDocs({
      include_docs: true,
      startkey: table,
      endkey: `${tableName}\uffff`,
    }).then((all: { rows: any[] }) => {
      return {
        success: true,
        data: all.rows
      };
    }).catch((error: { status: any; }) => {
      return {
        success: false,
        error: {
          status: error.status,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };
    });
  }

  async getIDs(): Promise<IResponse> {
    if (!this.db)
      return {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };
    return this.db.allDocs()
        .then((all: { rows: { id: string; }[] }) => {
          return {
            success: true,
            data: all.rows.map((d: {id: string}) => d.id),
          };
        })
        .catch((error:IError) => {
          return {
            success: false,
            error: {
              status: error.status,
              description: NOT_INITIALIZED_DB_ERROR,
            },
          };
        });
  }

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
  }

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
        .catch((error: IError) => {
          return {
            success: false,
            error: {
              ...error,
              description: GET_DOC_ERROR,
            },
          };
        });
  }

  async set(tableName: string, id: string, obj: any):Promise<IResponse> {
    if (!this.db)
      return {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };

    return this.db
        .put({
          _id: `${tableName}:${id}`,
          ...obj,
        })
        .then(() => {
          return {
            success: true
          };
        })
        .catch(async (error: IError) => {
          if (error.name === 'conflict' && error.status === 409) {
            return this.update(tableName, id, obj);
          } else {
            return {
              success: false,
              error: {
                ...error,
                description: SET_DOC_ERROR,
              },
            };
          }
        });
  }

  async update(tableName: string, id: string, obj: any):Promise<IResponse> {
    if (!this.db)
      return {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };
    return this.get(tableName, id).then(docToUpdate => {
      this.db
          .put({
            _id: `${tableName}:${id}`,
            _rev: docToUpdate.data._rev,
            ...obj,
          })
          .then(() => {
            return {
              success: true
            };
          })
          .catch((error: IError) => {
            return  {
              success: false,
              error: {
                ...error,
                description: GET_DOC_ERROR,
              },
            };
          });
    }).catch(error => {
      return  {
        ...error,
        description: GET_DOC_ERROR,
      };
    });
  }

  async remove(tableName: string, id: string):Promise<IResponse> {
    if (!this.db)
      return  {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };
    return this.db
        .get(`${tableName}:${id}`)
        .then((doc) => {
          this.db.remove(doc);
          return  {
            success: true
          };
        })
        .catch((error: IError) => {
          return {
            success: false,
            error: {
              ...error,
              description: GET_DOC_ERROR,
            },
          };
        });
  }

  async clear():Promise<IResponse> {
    if (!this.db)
      return  {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };
    await this.db.destroy();
    return  {
      success: true
    };
  }

  async close():Promise<IResponse> {
    if (!this.db)
      return  {
        success: false,
        error: {
          status: 500,
          description: NOT_INITIALIZED_DB_ERROR,
        },
      };
    await this.db.close();
    return  {
      success: true
    };
  }
}
