import {
	FETCH_CONNECTIONS, ConnectionState, READ_CONNECTION, CANCEL_CONNECTION, SAVE_CONNECTION, ADD_CONNECTION, EDIT_CONNECTION, REMOVE_CONNECTION, Connection, FETCH_ENVIRONMENTS_SUCCESS, TEST_CONNECTION, TEST_CONNECTION_SUCCESS, TEST_CONNECTION_ERROR, TestConnectionResult, SAVE_CONNECTION_SUCCESS, SAVE_CONNECTION_ERROR
} from './connection-actions'

import produce from 'immer'



const initialState: ConnectionState = {
	connections: [],
	environments: [],
	mode: 'view',
	loading: false,

}

const connection = (state: ConnectionState = initialState, action: any) => {
	return produce(state, (draft: ConnectionState) => {
		//console.log("client reducer", action);
		switch (action.type) {
			case CANCEL_CONNECTION: {
				draft.mode = 'view';
				draft.targetConnection = undefined;
				break
			}
			case ADD_CONNECTION: {
				draft.mode = 'add';
				draft.targetConnection = <Connection>{};
				break
			}
			case SAVE_CONNECTION: {
				draft.loading = true;
				break
			}
			case SAVE_CONNECTION_SUCCESS: {
				draft.errorMessage = undefined;
				draft.targetConnection = action.payload.targetConnection;
				draft.connections = action.payload.connections;
				draft.loading = false;
				break
			}
			case SAVE_CONNECTION_ERROR: {
				draft.errorMessage = action.payload.error;
				draft.loading = false;
				break
			}
			case EDIT_CONNECTION: {
				draft.mode = 'edit';
				draft.targetConnection = action.payload.targetConnection;
				break
			}
			case REMOVE_CONNECTION: {
				draft.connections = action.payload.connections;
				break
			}
			case FETCH_CONNECTIONS: {
				draft.connections = action.payload.connections;
				break
			}
			case READ_CONNECTION: {
				draft.targetConnection = action.payload.connection;
				break
			}
			case FETCH_ENVIRONMENTS_SUCCESS: {
				draft.environments = action.payload.environments;
				break
			}
			case TEST_CONNECTION: {
				draft.loading = true;
				draft.targetConnection = action.payload.targetConnection;
				break
			}
			case TEST_CONNECTION_SUCCESS: {
				draft.errorMessage = undefined;
				draft.targetConnection = action.payload.targetConnection;
				draft.loading = false;
				break
			}
			case TEST_CONNECTION_ERROR: {
				draft.errorMessage = action.payload.error;
				draft.loading = false;
				break
			}
			//   return initialState
			// case CHECKOUT_FAILURE:
			//   return action.cart

			default:
				return draft
		}
	});
}



export default connection