import { ViewElement } from '../../components/etlu-view';
import '@aaronanderson/lwdc/wc/lwdc-action-bar';
import '@aaronanderson/lwdc/wc/lwdc-button';
import '@aaronanderson/lwdc/wc/lwdc-layout-section';
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Helpers/sceneHelpers";
import { Nullable } from '@babylonjs/core/types';
export declare class WebXRPageElement extends ViewElement {
    canvas?: Nullable<HTMLCanvasElement | WebGLRenderingContext>;
    static get styles(): any;
    firstUpdated(): void;
    render(): import("lit-element").TemplateResult;
}
export default WebXRPageElement;
