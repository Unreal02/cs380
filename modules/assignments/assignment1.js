import gl from "../gl.js";
import { vec3, mat4 } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

export default class Assignment1 extends cs380.BaseApp {
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

    document.getElementById("settings").innerHTML = `
      <h3>Basic requirements</h3>
      <ul>
        <li>Add a background with color gradient</li>
        <li>Add 2 or more types of fractal-like natural objects</li>
        <li>Add framerate-independent natural animation</li>
        <li>Show some creativity in your scene</li>
      </ul>
    `;

    // Rest of initialization below
  }

  finalize() {
    // Finalize WebGL objects (mesh, shader, texture, ...)
  }

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
