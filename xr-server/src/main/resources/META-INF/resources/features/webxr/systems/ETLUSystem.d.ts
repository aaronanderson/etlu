import { World, System, Attributes } from 'ecsy';
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Nullable } from '@babylonjs/core/types';
import { Room } from '../components/Room';
import { EnvironmentHelper } from '@babylonjs/core/Helpers/environmentHelper';
import { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience';
export declare class ETLUSystem extends System {
    canvas: HTMLCanvasElement;
    engine: Engine;
    scene: Scene;
    camera?: FreeCamera;
    environment?: Nullable<EnvironmentHelper>;
    xr?: WebXRDefaultExperience;
    activeRoom?: Room;
    constructor(world: World, attributes: Attributes);
    init(): void;
    renderLoop(): void;
    execute(delta: number, time: number): void;
}
export declare function vrIcon(canvas: HTMLCanvasElement): void;
