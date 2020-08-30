import { html, css, customElement, property } from 'lit-element';

import { ViewElement } from '../../components/etlu-view';
import '@aaronanderson/lwdc/wc/lwdc-action-bar';
import '@aaronanderson/lwdc/wc/lwdc-button';
import '@aaronanderson/lwdc/wc/lwdc-layout-section';



import "@babylonjs/loaders/glTF";


import "@babylonjs/core/Helpers/sceneHelpers"

import { query } from 'lit-element/lib/decorators.js';

import { ETLUStore } from '../../app/store';
import { Nullable } from '@babylonjs/core/types';
import { EnvironmentHelper } from '@babylonjs/core/Helpers/environmentHelper';
import { World } from 'ecsy';
import { ETLUSystem } from './systems/ETLUSystem';
import { OperationSystem } from './systems/OperationSystem';
import { OperationRoom } from './components/OperationRoom';
import { Room, ActiveRoom } from './components/Room';


@customElement('etlu-webxr-page')
export class WebXRPageElement extends ViewElement {

	@query('#renderCanvas')
	canvas?: Nullable<HTMLCanvasElement | WebGLRenderingContext>;

	static get styles() {
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
		const world = new World();
		world.registerSystem(ETLUSystem, { canvas: this.canvas });
		world.registerSystem(OperationSystem);
		world.registerComponent(Room);
		world.registerComponent(ActiveRoom);
		world.registerComponent(OperationRoom);

		let testOperationRoom = world.createEntity();
		testOperationRoom.addComponent(Room);
		testOperationRoom.addComponent(ActiveRoom);
		testOperationRoom.addComponent(OperationRoom);
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