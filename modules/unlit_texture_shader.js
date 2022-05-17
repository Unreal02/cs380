import gl from "./gl.js";

import * as cs380 from "./cs380/cs380.js";

export class UnlitTextureShader extends cs380.BaseShader {
  static get source() {
    // Define shader codes here
    return [
      [gl.VERTEX_SHADER, "resources/unlit_texture.vert"],
      [gl.FRAGMENT_SHADER, "resources/unlit_texture.frag"],
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
      solidColor: gl.getUniformLocation(this.program, "solidColor"),
      useColor: gl.getUniformLocation(this.program, "useColor"),
      useScreenSpace: gl.getUniformLocation(this.program, "useScreenSpace"),
    };
  }

  setUniforms(kv) {
    this.setUniformMat4(kv, "projectionMatrix");
    this.setUniformMat4(kv, "cameraTransform");
    this.setUniformMat4(kv, "modelTransform");

    // Set shader-specific uniforms here
    this.setUniformTexture(kv, "mainTexture", 0);
    this.setUniformVec3(kv, "solidColor", 1, 1, 1);
    this.setUniformInt(kv, "useColor", 0);
    this.setUniformInt(kv, "useScreenSpace", 0);
  }
}
