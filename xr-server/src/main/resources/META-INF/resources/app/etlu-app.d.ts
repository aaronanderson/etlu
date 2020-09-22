import { LitElement } from 'lit-element';
import '../features/connection/connections-page';
import '../features/connection/connection-page';
import '../features/project/projects-page';
import '../features/project/project-page';
import '../features/webxr/webxr-page';
import '@aaronanderson/lwdc/wc/lwdc-tooltip';
import '@aaronanderson/lwdc/wc/lwdc-fonts';
import '@aaronanderson/lwdc/wc/lwdc-header';
import '@aaronanderson/lwdc/wc/lwdc-side-panel';
import '@aaronanderson/lwdc/wc/lwdc-icon';
import '@aaronanderson/lwdc/wc/lwdc-env-label';
import '@aaronanderson/lwdc/wc/lwdc-button';
import '@aaronanderson/lwdc/wc/lwdc-modal';
export declare class AppElement extends LitElement {
    opened: boolean;
    firstUpdated(): void;
    static get styles(): import("lit-element").CSSResult[];
    render(): import("lit-element").TemplateResult;
    get sidePanelContent(): import("lit-element").TemplateResult;
    updated(changedProperties: Map<string, any>): void;
}
export default AppElement;
