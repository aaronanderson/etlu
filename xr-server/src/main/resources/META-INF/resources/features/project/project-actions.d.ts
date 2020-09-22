export declare const FETCH_ENVIRONMENTS = "FETCH_ENVIRONMENTS";
export declare const FETCH_ENVIRONMENTS_SUCCESS = "FETCH_ENVIRONMENTS_SUCCESS";
export declare const FETCH_ENVIRONMENTS_ERROR = "FETCH_ENVIRONMENTS_ERROR";
export declare const TEST_PROJECT = "TEST_PROJECT";
export declare const TEST_PROJECT_SUCCESS = "TEST_PROJECT_SUCCESS";
export declare const TEST_PROJECT_ERROR = "TEST_PROJECT_ERROR";
export declare const SAVE_PROJECT = "SAVE_PROJECT";
export declare const SAVE_PROJECT_SUCCESS = "SAVE_PROJECT_SUCCESS";
export declare const SAVE_PROJECT_ERROR = "SAVE_PROJECT_ERROR";
export declare const READ_PROJECT = "READ_PROJECT";
export declare const CANCEL_PROJECT = "CANCEL_PROJECT";
export declare const ADD_PROJECT = "ADD_PROJECT";
export declare const EDIT_PROJECT = "EDIT_PROJECT";
export declare const REMOVE_PROJECT = "REMOVE_PROJECT";
export declare const FETCH_PROJECTS = "FETCH_PROJECTS";
export interface ProjectState {
    mode: string;
    loading: boolean;
    projects: Array<Project>;
    environments: Array<Environment>;
    targetProject?: Project;
    errorMessage?: string;
}
export declare const fetchEnvironments: any;
export declare const testProject: any;
export declare const fetchProjects: any;
export declare const readProject: any;
export declare const addProject: any;
export declare const saveProject: any;
export declare const editProject: any;
export declare const removeProject: any;
export declare const cancelProject: any;
export interface Project {
    id: string;
    tenant: string;
    description?: string;
    envId: string;
    account: string;
    password?: string;
    ejwt?: string;
}
export interface Credential {
    projectId: string;
    account: string;
    password: string;
}
export interface Environment {
    id: string;
    name: string;
}
export interface TestProjectResult {
    status: string;
    message: string;
}
export interface ProjectEncryptResult {
    ejwt: string;
}
export declare const createUUID: () => string;
