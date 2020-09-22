import { LitElement } from 'lit-element';
import { Connection, Environment } from './connection-actions';
import '@aaronanderson/lwdc/wc/lwdc-form-field';
import '@aaronanderson/lwdc/wc/lwdc-select';
import '@aaronanderson/lwdc/wc/lwdc-button';
import SelectElement from '@aaronanderson/lwdc/wc/lwdc-select';
import { ETLUStore } from '../../app/store';
declare const ConnectionSelectElement_base: {
    new (...args: any[]): {
        _storeUnsubscribe: import("redux").Unsubscribe;
        connectedCallback(): void;
        disconnectedCallback(): void;
        stateChanged(_state: ETLUStore): void;
        dispatch<A extends import("redux").AnyAction>(_function: A): A;
    };
} & typeof LitElement;
export declare class ConnectionSelectElement extends ConnectionSelectElement_base {
    disabled: boolean;
    connections: Array<Connection>;
    envs: Array<Environment>;
    _connectionId?: String | undefined;
    createRenderRoot(): this;
    static get styles(): import("lit-element").CSSResult[];
    firstUpdated(): void;
    render(): import("lit-element").TemplateResult;
    set connectionId(connectionId: String | undefined);
    get connectionId(): String | undefined;
    get connectionSelect(): SelectElement<any>;
    nameSelector(c: Connection): string | undefined;
    stateChanged(state: ETLUStore): void;
}
export default ConnectionSelectElement;
