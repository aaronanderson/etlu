import { Component, Types, TagComponent } from 'ecsy';
import { Scene } from '@babylonjs/core/scene';
import { AssetContainer } from '@babylonjs/core/assetContainer';

//https://doc.babylonjs.com/how_to/multi_scenes
export class Room extends Component<any> {

  //https://doc.babylonjs.com/how_to/how_to_use_assetcontainer
  //"This can be used to add/remove all objects in a scene without the need to exit WebVR"
  assetContainer?: AssetContainer;
}

Room.schema = {
  assetContainer: { type: Types.Ref },
};

export class ActiveRoom extends TagComponent { }