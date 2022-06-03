import gl from "./gl.js";

import * as cs380 from "./cs380/cs380.js";

export class MyPipShader extends cs380.BaseShader {
  static get source() {
    // Define shader codes here
    return [
      [gl.VERTEX_SHADER, "resources/unlit_texture.vert"],
      [gl.FRAGMENT_SHADER, "resources/my_effect.frag"],
    ];
  }

  generateUniformLocations() {
    return {
      // Below three are must-have uniform variables,
      projectionMatrix: gl.getUniformLocation(this.program, "projectionMatrix"),
      cameraTransform: gl.getUniformLocation(this.program, "cameraTransform"),
      modelTransform: gl.getUniformLocation(this.program, "modelTransform"),

      // Shader-specific uniforms
      mainTexture: gl.getUniformLocation(this.program, "mainTexture"),
      depthTexture: gl.getUniformLocation(this.program, "depthTexture"),
      bigTexture: gl.getUniformLocation(this.program, "bigTexture"),
      solidColor: gl.getUniformLocation(this.program, "solidColor"),
      useColor: gl.getUniformLocation(this.program, "useColor"),
      useScreenSpace: gl.getUniformLocation(this.program, "useScreenSpace"),
      width: gl.getUniformLocation(this.program, "width"),
      height: gl.getUniformLocation(this.program, "height"),
      cameraEffect: gl.getUniformLocation(this.program, "cameraEffect"),
    };
  }

  setUniforms(kv) {
    this.setUniformMat4(kv, "projectionMatrix");
    this.setUniformMat4(kv, "cameraTransform");
    this.setUniformMat4(kv, "modelTransform");

    // Set shader-specific uniforms here
    this.setUniformTexture(kv, "mainTexture", 0);
    this.setUniformTexture(kv, "depthTexture", 1);
    this.setUniformTexture(kv, "bigTexture", 2);
    this.setUniformVec3(kv, "solidColor", 1, 1, 1);
    this.setUniformInt(kv, "useColor", 0);
    this.setUniformInt(kv, "useScreenSpace", 0);
    this.setUniformFloat(kv, "width", 0);
    this.setUniformFloat(kv, "height", 0);
    this.setUniformInt(kv, "cameraEffect", 0);
  }
}
