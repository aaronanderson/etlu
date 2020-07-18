import { Store, Unsubscribe, AnyAction } from 'redux';
import { combineReducers } from 'redux'
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import connection from '../features/connection/connection-reducer';
import project from '../features/project/project-reducer';
import { ConnectionState } from '../features/connection/connection-actions';
import { ProjectState } from '../features/project/project-actions';


import { openDB } from "idb";

export const intworkspaceDB = () => {
	return openDB("etluDB", 1, {
		upgrade(db, oldVersion) {
			if (oldVersion == 0) {
				let datamaskStore = db.createObjectStore('extract-datamasks', { keyPath: ['connectionId', 'dataMaskKey'] });
				datamaskStore.createIndex("lastModified", "lastModified", { unique: false });
				db.createObjectStore('load-tenant');
			}
		},
	});
}

console.log('etluDB created');

//https://stackoverflow.com/a/52171480
export const cyrb53 = function (str: string, seed = 0) {
	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
	h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const rootReducer = combineReducers({
	connection: connection,
	project: project,
})

export const store = configureStore();

export default function configureStore() {
	console.log('store created');
	const store = createStore(rootReducer, composeWithDevTools(
		applyMiddleware(thunk)
	));
	// if (process.env.NODE_ENV !== 'production' && (module as any).hot) {
	// 	(module as any).hot.accept('./reducers', () => store.replaceReducer(rootReducer))
	// }
	return store
}



export interface ETLUStore {
	connection: ConnectionState
	project: ProjectState
}



type Constructor<T> = new (...args: any[]) => T;


//exporting LitElement with it's private/protected members generates a 'TS4094 exported class expression may not be private or protected' error so define a limited interface
interface ConnectedLitElement {
	connectedCallback?(): void;
	disconnectedCallback?(): void;
}

export const connect =
	<S>(store: Store<S>) =>
		<T extends Constructor<ConnectedLitElement>>(baseElement: T) =>
			class extends baseElement {
				_storeUnsubscribe!: Unsubscribe;

				connectedCallback() {

					super.connectedCallback && super.connectedCallback();


					this._storeUnsubscribe = store.subscribe(() => this.stateChanged(store.getState()));
					this.stateChanged(store.getState());
				}

				disconnectedCallback() {
					this._storeUnsubscribe();


					super.disconnectedCallback && super.disconnectedCallback();

				}

				stateChanged(_state: S) { }

				dispatch<A extends AnyAction>(_function: A) { return store.dispatch(_function); }
			};