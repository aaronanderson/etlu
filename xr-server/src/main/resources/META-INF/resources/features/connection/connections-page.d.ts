import { ViewElement } from '../../components/etlu-view';
import '@aaronanderson/lwdc/wc/lwdc-table';
import '@aaronanderson/lwdc/wc/lwdc-action-bar';
import '@aaronanderson/lwdc/wc/lwdc-button';
import '@aaronanderson/lwdc/wc/lwdc-layout-section';
import { Connection, Environment } from './connection-actions';
import { ETLUStore } from '../../app/store';
export declare class ConnectionsPageElement extends ViewElement {
    connections: Array<Connection>;
    envs: Array<Environment>;
    editMode: boolean;
    firstUpdated(): void;
    render(): import("lit-element").TemplateResult;
    connectionRenderer(c: Connection): import("lit-element").TemplateResult;
    envRenderer(c: Connection): string | undefined;
    addConnection(e: CustomEvent): void;
    editConnection(e: CustomEvent): void;
    removeConnection(e: CustomEvent): void;
    handleEdit(e: MouseEvent): void;
    handleDone(e: MouseEvent): void;
    stateChanged(state: ETLUStore): void;
}
export default ConnectionsPageElement;
