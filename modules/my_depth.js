import gl from "./gl.js";

import { vec3, vec4 } from "./cs380/gl-matrix.js";

import * as cs380 from "./cs380/cs380.js";
import { LightType, Light } from "./blinn_phong.js";

export class MyDepthShader extends cs380.BaseShader {
  static get source() {
    // Define shader codes here
    return [
      [gl.VERTEX_SHADER, "resources/my.vert"],
      [gl.FRAGMENT_SHADER, "resources/my_depth.frag"],
    ];
  }

  generateUniformLocations() {
    return {
      // Below three are must-have uniform variables,
      projectionMatrix: gl.getUniformLocation(this.program, "projectionMatrix"),
      cameraTransform: gl.getUniformLocation(this.program, "cameraTransform"),
      modelTransform: gl.getUniformLocation(this.program, "modelTransform"),
    };
  }

  setUniforms(kv) {
    this.setUniformMat4(kv, "projectionMatrix");
    this.setUniformMat4(kv, "cameraTransform");
    this.setUniformMat4(kv, "modelTransform");
  }
}
