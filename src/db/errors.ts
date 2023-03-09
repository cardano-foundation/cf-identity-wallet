export const ON_INIT_DB_ERROR = 'Error on init PouchDb';
export const NOT_INITIALIZED_DB_ERROR = 'PouchDb not initialized';
export const GET_TABLE_ERROR = 'Error on get table';
export const GET_DOC_ERROR = 'Error on get doc';
export const GET_IDS_ERROR = 'Error on get ids';
export const SET_DOC_ERROR = 'Error on set doc';
export const NOT_VALID_ID_DOC_ERROR = 'Not valid doc ID';
export const NOT_VALID_TABLE_NAME_ERROR = 'Not valid table name';
export const NULL_OR_EMPTY_DOC_ERROR = 'Error on null or empty doc';
export const UPDATE_DOC_ERROR = 'Error on update doc';
export const REMOVE_DOC_ERROR = 'Error on remove doc';
export const CLEAR_DOC_ERROR = 'Error on clear database';
export const CLOSE_DOC_ERROR = 'Error on close database';

export const ERROR_CODES = {
  400: {
    name: 'bad request',
    description:
      'The request could not be understood by the database due to malformed syntax',
  },
  404: {
    name: 'not found',
    description: 'The database has not found anything matching the Request-URI',
  },
  408: {
    name: 'request timeout',
    description:
      'The client did not produce a request within the time that the database was prepared to wait',
  },
  409: {
    name: 'conflict',
    description:
      'the request could not be completed due to a conflict with the current state of the resource',
  },
  500: {
    name: 'internal database error',
    description:
      'The database encountered an unexpected condition which prevented it from fulfilling the request',
  },
  503: {
    name: 'database unavailable',
    description:
      'The database is currently unable to handle the request due to a temporary overloading or maintenance of the database',
  },
};
