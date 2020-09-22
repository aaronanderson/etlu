import { World, System, Attributes } from 'ecsy';

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';

import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial"
import { Nullable } from '@babylonjs/core/types';
import { ActiveRoom, Room } from '../components/Room';
import { EnvironmentHelper } from '@babylonjs/core/Helpers/environmentHelper';
import { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience';



//import "@babylonjs/core/Debug/debugLayer"; 
//import "@babylonjs/inspector"; 



export class ETLUSystem extends System {

  canvas: HTMLCanvasElement;
  engine: Engine;
  scene: Scene;
  camera?: FreeCamera;
  environment?: Nullable<EnvironmentHelper>;
  xr?: WebXRDefaultExperience;
  activeRoom?: Room;

  constructor(world: World, attributes: Attributes) {
    super(world, attributes);
    this.canvas = attributes.canvas;
    let createDefaultEngine = () => { return new Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true }); };
    this.engine = createDefaultEngine();
    this.scene = new Scene(this.engine);

    //this.scene.debugLayer.show();

  }

  init() {

    if (!this.engine) throw 'engine should not be null.';

    // Resize
    window.addEventListener("resize", () => {
      this.engine.resize();
    });

    //camera needs to be created before XR setup
    // This creates and positions a free camera (non-mesh)
    this.camera = new FreeCamera("camera", new Vector3(0, 5, -10), this.scene);

    // This targets the camera to scene origin
    this.camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    this.camera.attachControl(this.canvas as HTMLElement, true);


    //this.environment = this.scene.createDefaultEnvironment();
    const blue = Color3.FromHexString("#005cb9");
    const orange = Color3.FromHexString("#f38b00");

    this.environment = this.scene.createDefaultEnvironment({ groundColor: orange, skyboxColor: blue });

    if (this.environment) {
      //environment.setMainColor(Color3.FromHexString("#005cb9"));
      // XR
      this.scene.createDefaultXRExperienceAsync({
        floorMeshes: [this.environment.ground as AbstractMesh]
      }).then(xr => {
        this.xr = xr
        vrIcon(this.canvas);
        console.log("XR complete");

      });

    }
    this.renderLoop();

  }

  renderLoop() {
    console.log("starting render loop");
    let lastTime = performance.now();
    this.engine.runRenderLoop(() => {
      var time = performance.now() / 1000;
      var delta = time - lastTime;
      lastTime = time;
      if (this.activeRoom) {
        this.scene.render();
      }
      this.world.execute(delta, time);
    });
  }

  execute(delta: number, time: number) {
    let sceneQuery = this.queries.rooms;
    if (sceneQuery && sceneQuery.added) {
      sceneQuery.added.forEach(entity => {
        let room = entity.getComponent(Room);
        if (room) {
          console.log("active room set", room, room.assetContainer);
          this.activeRoom = room;
          if (this.activeRoom.assetContainer) {
            this.activeRoom.assetContainer.addAllToScene();   
              // This targets the camera to scene origin
              if (this.camera){
                this.camera.position = new Vector3(0, 5, -10);
                this.camera.setTarget(Vector3.Zero());
              }        
            console.log("scene updated with active room");
          }
        }
      });

    }
  }
}


ETLUSystem.queries = {
  rooms: {
    components: [ActiveRoom],
    listen: {
      added: true,
      removed: true
    }
  }
}



export function vrIcon(canvas: HTMLCanvasElement) {
  //hack, move babylon generated CSS from LightDOM to ShadowDOM
  let styles = document.head.querySelectorAll("style");
  for (let style of Array.from(styles)) {
    if (style.innerText.startsWith(".babylonVRicon") && canvas.parentElement) {
      document.head.removeChild(style);
      canvas.parentElement.appendChild(style);
      break;
    }
  }
}
