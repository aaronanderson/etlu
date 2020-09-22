import { Store, Unsubscribe, AnyAction } from 'redux';
import { ConnectionState } from '../features/connection/connection-actions';
import { ProjectState } from '../features/project/project-actions';
export declare const intworkspaceDB: () => Promise<import("idb").IDBPDatabase<unknown>>;
export declare const cyrb53: (str: string, seed?: number) => number;
export declare const store: Store<import("redux").CombinedState<{
    connection: ConnectionState;
    project: ProjectState;
}>, AnyAction> & {
    dispatch: unknown;
};
export default function configureStore(): Store<import("redux").CombinedState<{
    connection: ConnectionState;
    project: ProjectState;
}>, AnyAction> & {
    dispatch: unknown;
};
export interface ETLUStore {
    connection: ConnectionState;
    project: ProjectState;
}
declare type Constructor<T> = new (...args: any[]) => T;
interface ConnectedLitElement {
    connectedCallback?(): void;
    disconnectedCallback?(): void;
}
export declare const connect: <S>(store: Store<S, AnyAction>) => <T extends Constructor<ConnectedLitElement>>(baseElement: T) => {
    new (...args: any[]): {
        _storeUnsubscribe: Unsubscribe;
        connectedCallback(): void;
        disconnectedCallback(): void;
        stateChanged(_state: S): void;
        dispatch<A extends AnyAction>(_function: A): A;
    };
} & T;
export {};
