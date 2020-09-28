import { Router } from '@vaadin/router'

export const FETCH_ENVIRONMENTS = 'FETCH_ENVIRONMENTS'
export const FETCH_ENVIRONMENTS_SUCCESS = 'FETCH_ENVIRONMENTS_SUCCESS'
export const FETCH_ENVIRONMENTS_ERROR = 'FETCH_ENVIRONMENTS_ERROR'


export const TEST_CONNECTION = 'TEST_CONNECTION'
export const TEST_CONNECTION_SUCCESS = 'TEST_CONNECTION_SUCCESS'
export const TEST_CONNECTION_ERROR = 'TEST_CONNECTION_ERROR'

export const SAVE_CONNECTION = 'SAVE_CONNECTION'
export const SAVE_CONNECTION_SUCCESS = 'SAVE_CONNECTION_SUCCESS'
export const SAVE_CONNECTION_ERROR = 'SAVE_CONNECTION_ERROR'

export const READ_CONNECTION = 'READ_CONNECTION'
export const CANCEL_CONNECTION = 'CANCEL_CONNECTION'
export const ADD_CONNECTION = 'ADD_CONNECTION'
export const EDIT_CONNECTION = 'EDIT_CONNECTION'
export const REMOVE_CONNECTION = 'REMOVE_CONNECTION'


export const FETCH_CONNECTIONS = 'FETCH_CONNECTIONS'



export interface ConnectionState {
	mode: string;
	loading: boolean;
	connections: Array<Connection>;
	environments: Array<Environment>;
	targetConnection?: Connection;
	errorMessage?: string;
}


export const fetchEnvironments: any = () => async (dispatch: any, getState: any) => {

	//lazy load
	if (getState().connection.environments.length == 0) {
		dispatch({ type: FETCH_ENVIRONMENTS });

		try {
			const response = await fetch("/api/connection/envs", {
				method: 'GET'
			});
			const environments: Array<Environment> = await response.json();
			if (!response.ok) {
				throw Error(response.statusText);
			}
			//console.log('Success:', JSON.stringify(result));
			dispatch({ type: FETCH_ENVIRONMENTS_SUCCESS, payload: { environments: environments } })
		} catch (error) {
			console.error('Error:', error);
			dispatch({ type: FETCH_ENVIRONMENTS_ERROR, payload: { error: error } })
		}
	}


}


export const testConnection: any = (connection: Connection) => async (dispatch: any) => {
	//console.log("testConnection");
	dispatch({ type: TEST_CONNECTION, payload: { targetConnection: connection } });

	try {
		const response = await fetch("/api/connection/test", {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(connection)
		});
		const result: TestConnectionResult = await response.json();
		if (!response.ok) {
			throw Error(response.statusText);
		}
		if (result.status != "ok") {
			throw Error(result.message);
		}
		//console.log('Success:', JSON.stringify(result));
		dispatch({ type: TEST_CONNECTION_SUCCESS, payload: { targetConnection: connection } })
	} catch (error) {
		console.error('Error:', error);
		dispatch({ type: TEST_CONNECTION_ERROR, payload: { error: error } })
	}


}

export const fetchConnections: any = () => async (dispatch: any) => {
	//console.log("fetchConnections");
	let connectionsValue = window.localStorage.getItem('connections');
	let connections = connectionsValue ? JSON.parse(connectionsValue) : {};
	dispatch({ type: FETCH_CONNECTIONS, payload: { connections: Object.values(connections) } })
}

export const readConnection: any = (connectionId: string) => async (dispatch: any) => {
	let connectionsValue = window.localStorage.getItem('connections');
	let connections = connectionsValue ? JSON.parse(connectionsValue) : {};
	let connection = connections[connectionId];
	dispatch({ type: READ_CONNECTION, payload: { connection: connection } });
}

export const addConnection: any = () => async (dispatch: any) => {
	dispatch({ type: ADD_CONNECTION });
	Router.go('/connection');
}

export const saveConnection: any = (connection: Connection) => async (dispatch: any) => {
	dispatch({ type: SAVE_CONNECTION, payload: { connection: connection } });
	try {
		const response = await fetch("/api/connection/ejwt", {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(connection)
		});
		const result: ConnectionEncryptResult = await response.json();
		if (!response.ok) {
			throw Error(response.statusText);
		}
		connection.ejwt = result.ejwt;
		connection.password = undefined;
		//console.log('Success:', JSON.stringify(result));
		let connectionsValue = window.localStorage.getItem('connections');
		let connections = connectionsValue ? JSON.parse(connectionsValue) : {};
		connections[connection.id] = connection;
		window.localStorage.setItem('connections', JSON.stringify(connections));
		dispatch({ type: SAVE_CONNECTION_SUCCESS, payload: { targetConnection: connection, connections: Object.values(connections) } });
	} catch (error) {
		console.error('Error:', error);
		dispatch({ type: SAVE_CONNECTION_ERROR, payload: { error: error } })
	}



}

export const editConnection: any = (connectionId: string) => async (dispatch: any) => {
	let connectionsValue = window.localStorage.getItem('connections');
	let connections = connectionsValue ? JSON.parse(connectionsValue) : {};
	let connection = connections[connectionId];
	dispatch({ type: EDIT_CONNECTION, payload: { targetConnection: connection } });
	Router.go(`/connection/${connectionId}`);
}

export const removeConnection: any = (connectionId: string) => async (dispatch: any) => {
	let connectionsValue = window.localStorage.getItem('connections');
	let connections = connectionsValue ? JSON.parse(connectionsValue) : {};
	delete connections[connectionId];
	window.localStorage.setItem('connections', JSON.stringify(connections));
	dispatch({ type: REMOVE_CONNECTION, payload: { connections: Object.values(connections) } });
}

export const cancelConnection: any = () => async (dispatch: any) => {
	dispatch({ type: CANCEL_CONNECTION });
	Router.go('/connections');
}



export interface Connection {
	id: string
	tenant: string;
	description?: string;
	envId: string;
	account: string;
	password?: string;
	ejwt?: string;

}

export interface Credential {
	connectionId: string
	account: string;
	password: string;

}

export interface Environment {
	id: string
	name: string
}

export interface TestConnectionResult {
	status: string
	message: string
}

export interface ConnectionEncryptResult {
	ejwt: string
}

export const createUUID = function () {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (dt + Math.random() * 16) % 16 | 0;
		dt = Math.floor(dt / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
}
