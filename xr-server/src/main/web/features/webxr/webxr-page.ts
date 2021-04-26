import { html, css, customElement, property } from 'lit-element';

import { ViewElement } from '../../components/etlu-view';
import '@aaronanderson/lwdc/wc/lwdc-action-bar';
import '@aaronanderson/lwdc/wc/lwdc-button';
import '@aaronanderson/lwdc/wc/lwdc-layout-section';




import { query } from 'lit-element/lib/decorators.js';

import { ETLUStore } from '../../app/store';
import { Nullable } from '@babylonjs/core/types';


@customElement('etlu-webxr-page')
export class WebXRPageElement extends ViewElement {

	@query('#renderCanvas')
	canvas?: HTMLCanvasElement;

	static get styles() : any{
		return [...super.styles, css`

			#renderCanvas {
                width: 100%;
                height: 100%;
                touch-action: none;
			}

		`];
	}



	firstUpdated() {
		this.pageTitle = 'WebXR Portal';
    let xrEvent = new CustomEvent("etlu-xr-init",{detail: {canvas: this.canvas}});
		document.dispatchEvent(xrEvent);
		console.log("xr init dispatched");

	}

	render() {

		return html`
			${this.pageTitleTemplate}

			<section class="etlu-main">
				 <canvas id="renderCanvas"></canvas>
			</section>
    `;
	}



}



export default WebXRPageElement;
