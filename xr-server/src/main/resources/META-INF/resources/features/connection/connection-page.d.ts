import { ViewElement } from '../../components/etlu-view';
import { Connection, Environment } from './connection-actions';
import { ETLUStore } from '../../app/store';
import '@aaronanderson/lwdc/wc/lwdc-form-field';
import '@aaronanderson/lwdc/wc/lwdc-text';
import '@aaronanderson/lwdc/wc/lwdc-select';
import '@aaronanderson/lwdc/wc/lwdc-form';
import '@aaronanderson/lwdc/wc/lwdc-button';
import '@aaronanderson/lwdc/wc/lwdc-action-bar';
import '@aaronanderson/lwdc/wc/lwdc-layout-section';
export declare class ConnectionPageElement extends ViewElement {
    targetConnection?: Connection;
    mode: string;
    finishLabel: string;
    envs: Array<Environment>;
    firstUpdated(): void;
    render(): import("lit-element").TemplateResult;
    get viewTemplate(): import("lit-element").TemplateResult;
    envRenderer(c?: Connection): string | undefined;
    handleEdit(e: MouseEvent): void;
    get modifyTemplate(): import("lit-element").TemplateResult;
    handleSave(e: MouseEvent): Promise<void>;
    handleTest(e: MouseEvent): Promise<void>;
    handleCancel(e: MouseEvent): void;
    stateChanged(state: ETLUStore): void;
}
export default ConnectionPageElement;
