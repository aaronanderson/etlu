import { System } from 'ecsy';
import { AssetContainer } from '@babylonjs/core/assetContainer';
export declare class OperationSystem extends System {
    execute(delta: number, time: number): void;
    createAssetContainer(): AssetContainer;
}
