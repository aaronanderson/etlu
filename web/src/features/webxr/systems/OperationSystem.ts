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
import { OperationRoom } from '../components/OperationRoom';
import { ETLUSystem, vrIcon } from './ETLUSystem';
import { Room } from '../components/Room';

//https://doc.babylonjs.com/how_to/multi_scenes
export class OperationSystem extends System {

  execute(delta: number, time: number) {
    //console.log("OperationSystem Executed");
    let roomsQuery = this.queries.rooms;

    if (roomsQuery && roomsQuery.added) {
      roomsQuery.added.forEach(entity => {
        
        let room = entity.getComponent(Room);
        if (room) {
          this.createScene().then(returnedScene => {
            room.scene = returnedScene;
            console.log("room added", entity);          
            let etluSystem = this.world.getSystem(ETLUSystem) as ETLUSystem;
            vrIcon(etluSystem.canvas);
          });
        }


      });
    }

    if (roomsQuery && roomsQuery.removed) {
      roomsQuery.removed.forEach(entity => {
        console.log("room removed", entity);

      });
    }

  }


  createScene = async () => {
    let etluSystem = this.world.getSystem(ETLUSystem) as ETLUSystem;
    let engine = etluSystem.engine;
    let canvas = etluSystem.canvas;

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
    //var sphere = MeshBuilder.CreateBox("sphere", { height: 2, width: 4, depth: 2 }, scene);
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


    const environment = scene.createDefaultEnvironment({ groundColor: orange, skyboxColor: blue });

    if (environment) {
      //environment.setMainColor(Color3.FromHexString("#005cb9"));
      // XR
      const xrHelper = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [environment.ground as AbstractMesh]
      });

    }
    return scene;

  };


}



OperationSystem.queries = {
  rooms: {
    components: [OperationRoom],
    listen: {
      added: true,
      removed: true
    }
  }
}

