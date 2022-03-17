import gl from "./gl.js";
import { vec3, mat4 } from "./cs380/gl-matrix.js";

import * as cs380 from "./cs380/cs380.js";

export default class EmptyApp extends cs380.BaseApp {
  async initialize() {
    // Basic setup for camera
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 0, 5);
    mat4.perspective(
      this.camera.projectionMatrix,
      (45 * Math.PI) / 180,
      gl.canvas.clientWidth / gl.canvas.clientHeight,
      0.01,
      100
    );

    // Rest of initialization below
  }

  finalize() {}

  update(elapsed, dt) {
    // Updates before rendering here

    // Clear canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rest of rendering below
  }
}
