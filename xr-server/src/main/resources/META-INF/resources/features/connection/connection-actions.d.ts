export declare const FETCH_ENVIRONMENTS = "FETCH_ENVIRONMENTS";
export declare const FETCH_ENVIRONMENTS_SUCCESS = "FETCH_ENVIRONMENTS_SUCCESS";
export declare const FETCH_ENVIRONMENTS_ERROR = "FETCH_ENVIRONMENTS_ERROR";
export declare const TEST_CONNECTION = "TEST_CONNECTION";
export declare const TEST_CONNECTION_SUCCESS = "TEST_CONNECTION_SUCCESS";
export declare const TEST_CONNECTION_ERROR = "TEST_CONNECTION_ERROR";
export declare const SAVE_CONNECTION = "SAVE_CONNECTION";
export declare const SAVE_CONNECTION_SUCCESS = "SAVE_CONNECTION_SUCCESS";
export declare const SAVE_CONNECTION_ERROR = "SAVE_CONNECTION_ERROR";
export declare const READ_CONNECTION = "READ_CONNECTION";
export declare const CANCEL_CONNECTION = "CANCEL_CONNECTION";
export declare const ADD_CONNECTION = "ADD_CONNECTION";
export declare const EDIT_CONNECTION = "EDIT_CONNECTION";
export declare const REMOVE_CONNECTION = "REMOVE_CONNECTION";
export declare const FETCH_CONNECTIONS = "FETCH_CONNECTIONS";
export interface ConnectionState {
    mode: string;
    loading: boolean;
    connections: Array<Connection>;
    environments: Array<Environment>;
    targetConnection?: Connection;
    errorMessage?: string;
}
export declare const fetchEnvironments: any;
export declare const testConnection: any;
export declare const fetchConnections: any;
export declare const readConnection: any;
export declare const addConnection: any;
export declare const saveConnection: any;
export declare const editConnection: any;
export declare const removeConnection: any;
export declare const cancelConnection: any;
export interface Connection {
    id: string;
    tenant: string;
    description?: string;
    envId: string;
    account: string;
    password?: string;
    ejwt?: string;
}
export interface Credential {
    connectionId: string;
    account: string;
    password: string;
}
export interface Environment {
    id: string;
    name: string;
}
export interface TestConnectionResult {
    status: string;
    message: string;
}
export interface ConnectionEncryptResult {
    ejwt: string;
}
export declare const createUUID: () => string;
