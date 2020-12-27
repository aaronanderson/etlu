import { World, System, Attributes } from 'ecsy';
import { ETLUSystem } from './ETLUSystem';
import { AssetContainer } from '@babylonjs/core/assetContainer';
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { AdvancedDynamicTexture, Grid, Rectangle, Control, TextBlock, Button, TextWrapping  } from '@babylonjs/gui/2D';
import {svgIcon} from '../util/svg';
import xIcon from '@workday/canvas-system-icons-web/dist/svg/wd-icon-x.svg';
import growIcon from '@workday/canvas-system-icons-web/dist/svg/wd-icon-grow.svg';
import shrinkIcon from '@workday/canvas-system-icons-web/dist/svg/wd-icon-shrink.svg';

export class ControlPanelSystem extends System {

  init() {
    let etluSystem = this.world.getSystem(ETLUSystem) as ETLUSystem;
    let scene = etluSystem.scene;
    let camera = etluSystem.camera;
    let assetContainer = new AssetContainer(scene);


    const guiPlane = MeshBuilder.CreatePlane("guiPlane" ,{width: 1, height: 2}, scene); //
    scene.removeMesh(guiPlane);
    assetContainer.meshes.push(guiPlane);
    guiPlane.position.x = 1.75;
    guiPlane.position.y = 0;
    guiPlane.position.z = 5;
    guiPlane.parent = camera;

    const advancedTexture2 = AdvancedDynamicTexture.CreateForMesh(guiPlane);//,1024, 1024

   let grid = new Grid();
   grid.addColumnDefinition(.15);
   grid.addColumnDefinition(.7);
   grid.addColumnDefinition(.15);
   //grid.addColumnDefinition(0.5);
   //grid.addColumnDefinition(0.5);
   //grid.addRowDefinition(0.25);
   grid.addRowDefinition(.1);
   grid.addRowDefinition(.15);
   grid.addRowDefinition(.75);



     // let dlTexture = new Texture('core/assets/wd-icon-download.svg', scene, false, false);
     // dlTexture.hasAlpha = true;
     // scene.removeTexture(dlTexture);
     // assetContainer.textures.push(dlTexture);

   svgIcon(xIcon, {color:"white", viewBox:"-8 -3 40 40"}).then((xIconURI)=>{
     console.log("xIcon", xIconURI);
     let testButton = Button.CreateImageWithCenterTextButton(
       "but",
       "Click Me",
       xIconURI
     );
     testButton.width = "50%";
     //testButton.image.width = "50%";
     testButton.stretch = Image.STRETCH_UNIFORM;
     testButton.textBlock.textVerticalAlignment =   Control.VERTICAL_ALIGNMENT_BOTTOM;
     testButton.textBlock.fontSize=50;
     //testButton.textBlock.textWrapping = TextWrapping.WordWrap;

     grid.addControl(testButton, 1, 1);

   }) ;

   svgIcon(shrinkIcon, { color: "white", viewBox : "2 2 20 20"}).then((xIconURI)=>{
     let testButton = Button.CreateImageOnlyButton(
       "but",
       xIconURI
     );

     testButton.stretch = Image.STRETCH_UNIFORM;
     //testButton.image.stretch = Image.STRETCH_UNIFORM;
     grid.addControl(testButton, 0, 2);

   }) ;


   //const svgFilePath = 'https://design.workdaycdn.com/beta/assets/web-icons/system@0.11.16/svg/wd-icon-x.svg';


   let rect = new Rectangle("Test1");
   rect.background = "red";
   rect.thickness = 0;
   grid.addControl(rect, 0, 0);

   rect = new Rectangle("Test2");
   rect.background = "blue";
   rect.thickness = 0;
   grid.addControl(rect, 0, 1);

   rect = new Rectangle("Test3");
   rect.background = "green";
   rect.thickness = 0;
   grid.addControl(rect, 0, 2);

   rect = new Rectangle("Test4");
   rect.background = "blue";
   rect.thickness = 0;
   grid.addControl(rect, 1, 0);

   rect = new Rectangle("Test5");
   rect.background = "green";
   rect.thickness = 0;
   grid.addControl(rect, 1, 1);

   rect = new Rectangle("Test6");
   rect.background = "red";
   rect.thickness = 0;
   grid.addControl(rect, 1, 2);

   rect = new Rectangle("Test7");
   rect.background = "green";
   rect.thickness = 0;
   grid.addControl(rect, 2, 0);

   rect = new Rectangle("Test8");
   rect.background = "red";
   rect.thickness = 0;
   grid.addControl(rect, 2, 1);

   rect = new Rectangle("Test9");
   rect.background = "blue";
   rect.thickness = 0;
   grid.addControl(rect, 2, 2);

   advancedTexture2.addControl(grid);

   assetContainer.addAllToScene();
  }

  execute(delta: number, time: number) {
  }

}
