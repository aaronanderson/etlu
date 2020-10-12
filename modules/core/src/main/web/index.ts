import { World } from 'ecsy';
import { ETLUSystem } from './systems/ETLUSystem';
import { OperationSystem } from './systems/OperationSystem';
import { ControlPanelSystem } from './systems/ControlPanelSystem';
import { OperationRoom } from './components/OperationRoom';
import { Room, ActiveRoom } from './components/Room';
import { ControlPanel } from './components/ControlPanel';

//load MeshWriter at top level so it is loaded once and available everywhere.
import * as BABYLON from '@babylonjs/core/Legacy/legacy';
(<any>window).BABYLON = BABYLON;
declare const MeshWriter: any;
import './util/meshwriter';


console.log("Core Module Instanciated");

export const etluWorld = new World();

document.addEventListener("etlu-xr-init", (e: CustomEvent) => { // change here Event to CustomEvent
    console.log("Core XR Init",e.detail);
    const canvas =  e.detail.canvas;
     etluWorld.registerComponent(Room);
     etluWorld.registerComponent(ActiveRoom);
     etluWorld.registerComponent(OperationRoom);
     etluWorld.registerComponent(ControlPanel);
     etluWorld.registerSystem(ETLUSystem, { canvas: canvas });
     etluWorld.registerSystem(OperationSystem);
     etluWorld.registerSystem(ControlPanelSystem);

     let testOperationRoom = etluWorld.createEntity();
     testOperationRoom.addComponent(Room);
     testOperationRoom.addComponent(ActiveRoom);
     testOperationRoom.addComponent(OperationRoom);
     testOperationRoom.addComponent(ControlPanel);
});
