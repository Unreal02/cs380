import gl from "../gl.js";
import { vec3, mat4 } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

export default class EmptyApp extends cs380.BaseApp {
  async initialize() {
    // Basic setup for camera
    const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 0, 0);
    mat4.ortho(
        this.camera.projectionMatrix,
        -2 * aspectRatio,
        +2 * aspectRatio,
        -2,
        +2,
        -2,
        +2
    );

    // Rest of initialization below
    document.getElementById("settings").innerHTML = `
      <ul>  
        <li>Render an RGB triangle</li>
        <li><strong>Submission</strong>: An image of your RGB triangle.</li>
      </ul>
    `;

    // TODO: initialize RGB triangle
  }

  finalize() {
    // TODO: finalize the mesh
  }

  update(elapsed, dt) {
    // Updates before rendering here

    // Clear canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // TODO: render RGB triangle
  }
}
