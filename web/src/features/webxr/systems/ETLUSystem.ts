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



export class ETLUSystem extends System {

  canvas: HTMLCanvasElement;
  engine: Engine;
  activeRoom?: Room;

  constructor(world: World, attributes: Attributes) {
    super(world, attributes);
    this.canvas = attributes.canvas;
    let createDefaultEngine = () => { return new Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true }); };
    this.engine = createDefaultEngine();
  }

  init() {


    if (!this.engine) throw 'engine should not be null.';

    let lastTime = performance.now();
    this.engine.runRenderLoop(() => {
      var time = performance.now() / 1000;
      var delta = time - lastTime;
      lastTime = time;
      if (this.activeRoom && this.activeRoom.scene) {
        this.activeRoom.scene.render();
      }
      this.world.execute(delta, time);

    });

    // Resize
    window.addEventListener("resize", () => {
      this.engine.resize();
    });



  }

  execute(delta: number, time: number) {
    let sceneQuery = this.queries.rooms;
    if (sceneQuery && sceneQuery.added) {
      sceneQuery.added.forEach(entity => {
        let room = entity.getComponent(Room);
        if (room) {
          console.log("active room set", room, room.scene);
          this.activeRoom = room;
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
