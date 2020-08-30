import { Component, Types, TagComponent } from 'ecsy';
import { Scene } from '@babylonjs/core/scene';


export class Room extends Component<any> {
  scene?: Scene;
}

export class ActiveRoom extends TagComponent { }

Room.schema = {
  scene: { type: Types.Ref },
};