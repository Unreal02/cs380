import { mat4 } from "./gl-matrix.js";
import { Transform } from "./transform.js";

export class Camera {
  constructor() {
    this.transform = new Transform();
    this.projectionMatrix = mat4.create();
  }

  get worldMatrix() {
    return this.transform.worldMatrix;
  }
}
