import { html, css, customElement, property } from 'lit-element';

import { ViewElement } from '../../components/etlu-view';
import '@aaronanderson/lwdc/wc/lwdc-action-bar';
import '@aaronanderson/lwdc/wc/lwdc-button';
import '@aaronanderson/lwdc/wc/lwdc-layout-section';

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";

import {StandardMaterial} from  "@babylonjs/core/Materials/standardMaterial"

import "@babylonjs/loaders/glTF";


import "@babylonjs/core/Helpers/sceneHelpers"


import { ETLUStore } from '../../app/store';
import { Nullable } from '@babylonjs/core/types';
import { EnvironmentHelper } from '@babylonjs/core/Helpers/environmentHelper';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';

@customElement('etlu-webxr-page')
export class WebXRPageElement extends ViewElement {


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
		this.createScene();

	}

	render() {

		return html`
			${this.pageTitleTemplate}

			<section class="etlu-main">
				 <canvas id="renderCanvas"></canvas>				
			</section>
    `;
	}

	createScene() {
		if (this.shadowRoot) {
			let canvas = this.shadowRoot.getElementById("renderCanvas") as Nullable<HTMLCanvasElement | WebGLRenderingContext>;

			if (canvas) {
				let engine: Engine;
				let scene: Promise<Scene>;
				let sceneToRender: Scene;

				let createDefaultEngine = () => { return new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); };

				let createScene = async () => {

					// This creates a basic Babylon Scene object (non-mesh)
					var scene = new Scene(engine);

					// This creates and positions a free camera (non-mesh)
					var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

					// This targets the camera to scene origin
					camera.setTarget(Vector3.Zero());

					// This attaches the camera to the canvas
					camera.attachControl(canvas as HTMLElement, true);

					// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
					var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

					// Default intensity is 1. Let's dim the light a small amount
					light.intensity = 0.7;

					const blue = Color3.FromHexString("#005cb9");
					const orange = Color3.FromHexString("#f38b00");
					const green = Color3.FromHexString("#319c4c");

					// Our built-in 'sphere' shape.
					var sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);

					let sphereMaterial = new StandardMaterial("sphereMaterial", scene);

					//sphereMaterial.diffuseColor = new Color3(1, 0, 1);
					//sphereMaterial.specularColor = new Color3(0.5, 0.6, 0.87);
					//sphereMaterial.emissiveColor = new Color3(1, 1, 1);
					//sphereMaterial.ambientColor = new Color3(0.23, 0.98, 0.53);

					sphereMaterial.diffuseColor = new Color3(0, 0, 0);
					sphereMaterial.ambientColor = green;
					 sphereMaterial.emissiveColor = green;
					//sphereMaterial.emissiveColor = new Color3(0, 0, 0);
					sphere.material = sphereMaterial;

					// Move the sphere upward 1/2 its height
					sphere.position.y = 1;

					
					const environment = scene.createDefaultEnvironment({groundColor: orange, skyboxColor:blue});

					if (environment) {
						//environment.setMainColor(Color3.FromHexString("#005cb9"));
						// XR
						const xrHelper = await scene.createDefaultXRExperienceAsync({
							floorMeshes: [environment.ground as AbstractMesh]
						});

					}
					return scene;

				};

				try {
					engine = createDefaultEngine();
				} catch (e) {
					console.log("the available createEngine function failed. Creating the default engine instead");
					engine = createDefaultEngine();
				}

				if (!engine) throw 'engine should not be null.';
				scene = createScene();
				scene.then(returnedScene => {
					sceneToRender = returnedScene;
					//hack, move babylon generated CSS from LightDOM to ShadowDOM
					let styles = document.head.querySelectorAll("style");
					for (let style of Array.from(styles)) {
						if (style.innerText.startsWith(".babylonVRicon") && this.shadowRoot) {
							document.head.removeChild(style);
							this.shadowRoot.appendChild(style);
							break;
						}
					};
				});

				engine.runRenderLoop(() => {
					if (sceneToRender) {
						sceneToRender.render();
					}
				});

				// Resize
				window.addEventListener("resize", () => {
					engine.resize();
				});
			}
		}
	}

}



export default WebXRPageElement;