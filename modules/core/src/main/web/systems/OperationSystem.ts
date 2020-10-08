import { World, System, Attributes } from 'ecsy';

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color3, Space, Axis } from "@babylonjs/core/Maths/math";
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
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';
import { AssetContainer } from '@babylonjs/core/assetContainer';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import { ExecuteCodeAction } from '@babylonjs/core/Actions/directActions';
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

import { AdvancedDynamicTexture, Grid, Rectangle, Control, TextBlock, Button  } from '@babylonjs/gui/2D';

export class OperationSystem extends System {

  execute(delta: number, time: number) {
    //console.log("OperationSystem Executed");
    let roomsQuery = this.queries.rooms;

    if (roomsQuery && roomsQuery.added) {
      roomsQuery.added.forEach(entity => {

        let room = entity.getMutableComponent(Room);
        if (room) {
          room.assetContainer = this.createAssetContainer();
          console.log("room added", entity);
        }


      });
    }

    if (roomsQuery && roomsQuery.removed) {
      roomsQuery.removed.forEach(entity => {
        console.log("room removed", entity);

      });
    }

  }


  createAssetContainer() {
    let etluSystem = this.world.getSystem(ETLUSystem) as ETLUSystem;
    let engine = etluSystem.engine;
    let canvas = etluSystem.canvas;
    let scene = etluSystem.scene;
    let camera = etluSystem.camera;
    let assetContainer = new AssetContainer(scene);

    const blue = Color3.FromHexString("#005cb9");
    const orange = Color3.FromHexString("#f38b00");
    const green = Color3.FromHexString("#319c4c");



    //{ groundColor: orange, skyboxColor: blue }

    // This creates and positions a free camera (non-mesh)
    // var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    // scene.removeCamera(camera);
    // assetContainer.cameras.push(camera);

    // // This targets the camera to scene origin
    // camera.setTarget(Vector3.Zero());

    // // This attaches the camera to the canvas
    // camera.attachControl(canvas as HTMLElement, true);



    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    scene.removeLight(light);
    assetContainer.lights.push(light);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;



    // Our built-in 'sphere' shape.
    //var sphere = MeshBuilder.CreateBox("sphere", { height: 2, width: 4, depth: 2 }, scene);
    var sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
    scene.removeMesh(sphere);
    assetContainer.meshes.push(sphere);
    sphere.id = 'sphereID1';

    let sphereMaterial = new StandardMaterial("sphereMaterial", scene);
    scene.removeMaterial(sphereMaterial);
    assetContainer.materials.push(sphereMaterial);

    //sphereMaterial.diffuseColor = new Color3(1, 0, 1);
    //sphereMaterial.specularColor = new Color3(0.5, 0.6, 0.87);
    //sphereMaterial.emissiveColor = new Color3(1, 1, 1);
    //sphereMaterial.ambientColor = new Color3(0.23, 0.98, 0.53);

    sphereMaterial.diffuseColor = new Color3(0, 0, 0);
    sphereMaterial.ambientColor = green;
    sphereMaterial.emissiveColor = green;
    //sphereMaterial.emissiveColor = new Color3(0, 0, 0);
    sphere.material = sphereMaterial;
    sphere.position.y = 1;
    sphere.isPickable = true;

    sphere.actionManager = new ActionManager(scene);
    sphere.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickDownTrigger, (mesh) => {
        console.log(`sphere clicked`);
      })
    );


    //const Writer  =  MeshWriter(scene, { scale: .5});//'default-font':'RobotoMono-Regular',
    const Writer  =  MeshWriter(scene, { 'default-font':'RobotoMono-Regular', scale: 1, debug: true});//
    const text1     = new Writer(                                     // Inserts text into scene, per options
                   "ETLU!",
                   {
                       "anchor": "center",
                       "letter-height": 1,
                       "letter-thickness": .1,
                       "color": "#FFF",
                       "position": {
                           "z": -3

                     }
                    }
             );
    const textMesh  = text1.getMesh();
    textMesh.rotate(Axis.X, -Math.PI/8, Space.WORLD);
    //textMesh.position.y = -1;
     scene.removeMesh(textMesh);
     assetContainer.meshes.push(textMesh);
     //textMesh.material = sphereMaterial;

     SceneLoader.LoadAssetContainer("./core/assets/", "wd-icon-upload-cloud.glb", scene, (container) =>  {
          //assetContainer.meshes.push(container.meshes[0]);
          container.meshes[1].position.y = 3;
          container.meshes[1].position.x = 0;
          container.meshes[1].rotate(Axis.X, -Math.PI/2, Space.WORLD);
          container.meshes[1].rotate(Axis.Y, -Math.PI/4, Space.WORLD);
          container.meshes[1].isPickable = true;
          container.meshes[1].actionManager = new ActionManager(scene);
          container.meshes[1].actionManager.registerAction( new ExecuteCodeAction(ActionManager.OnPickDownTrigger, (mesh) => {
              console.log(`uploadCloudIcon clicked`);
            })
          );
          container.meshes[1].id = 'uploadCloudIcon';
          assetContainer.meshes.push(container.meshes[1]);
          assetContainer.addAllToScene();
        //container.meshes[0].material = sphereMaterial;
        //assetContainer.meshes.push(container.meshes);
        //assetContainer.materials.push(container.materials);
});

 var guiPlane = MeshBuilder.CreatePlane("guiPlane", {width: 1, height: 3}, scene);
 scene.removeMesh(guiPlane);
 assetContainer.meshes.push(guiPlane);
 guiPlane.position.x = 1.75;
 guiPlane.position.y = 0;
 guiPlane.position.z = 5;
 guiPlane.parent = camera;

 const advancedTexture2 = AdvancedDynamicTexture.CreateForMesh(
   guiPlane,
   1024,
   1024,
   false
 );

let grid = new Grid();
//grid.addColumnDefinition(100, true);
grid.addColumnDefinition(0.5);
grid.addColumnDefinition(0.5);
//grid.addColumnDefinition(100, true);
grid.addRowDefinition(0.25);
grid.addRowDefinition(0.25);
grid.addRowDefinition(0.25);
grid.addRowDefinition(0.25);

let rect = new Rectangle("Test1");
rect.background = "green";
rect.thickness = 0;
grid.addControl(rect, 0, 0);

  // let dlTexture = new Texture('core/assets/wd-icon-download.svg', scene, false, false);
  // dlTexture.hasAlpha = true;
  // scene.removeTexture(dlTexture);
  // assetContainer.textures.push(dlTexture);


const svgFilePath = 'https://design.workdaycdn.com/beta/assets/web-icons/system@0.11.16/svg/wd-icon-x.svg';
const parser = new DOMParser();
const serializer = new XMLSerializer();
  // Fetch the file from the server.
  fetch(svgFilePath)
    .then(response => response.text())
    .then(text => {
      const parsed = parser.parseFromString(text, 'text/html');
      const svg = parsed.querySelector('svg');
      svg.setAttribute("fill","red");
      const s = serializer.serializeToString(svg);
      const svgURI = "data:image/svg+xml;base64," + window.btoa(s);
      console.log("svg",svg, svgURI);
      let testButton = Button.CreateImageWithCenterTextButton(
        "but",
        "Click Me",
        svgURI
      );
      grid.addControl(testButton, 0, 0);
    });



rect = new Rectangle("Test2");
rect.background = "blue";
rect.thickness = 0;
grid.addControl(rect, 0, 1);


rect = new Rectangle("Test3");
rect.background = "red";
rect.thickness = 0;
grid.addControl(rect, 1, 0);

rect = new Rectangle("Test4");
rect.background = "purple";
rect.thickness = 0;
grid.addControl(rect, 1, 1);

advancedTexture2.addControl(grid);

// panel.blockLayout = true;
// for (var index = 0; index < 30; index++) {
// var button = new BABYLON.GUI.Button3D("click me");
// panel.addControl(button);
// }
// panel.blockLayout = false;

        // scene.onPointerObservable.add((pointerInfo) => {
        //   switch (pointerInfo.type) {
        //     case PointerEventTypes.POINTERDOWN:
        //       var pickResult = pointerInfo.pickInfo;
        //       if (pickResult && pickResult.hit) {
        //         let pickedMesh = pickResult.pickedMesh;
        //
        //         // if (pickedMesh.name == "testdome_mesh") return;
        //         // if (_prevPickedMesh == pickedMesh.name) return;
        //         // _prevPickedMesh = pickedMesh.name;
        //
        //         if (pickedMesh) {
        //           console.log('Mesh Picked', pickedMesh.name, pickedMesh.id);
        //         }
        //       }
        //       break;
        //     case PointerEventTypes.POINTERPICK:
        //       break;
        //   }
        //
        // });






    console.log("scene setup complete");
    return assetContainer;



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
