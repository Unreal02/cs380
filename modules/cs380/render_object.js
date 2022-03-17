import gl from "../gl.js";
import { vec3, mat4 } from "./gl-matrix.js";

import { Transform } from "./transform.js";

export class RenderObject {
  constructor(mesh, shader) {
    this.transform = new Transform();
    this.mesh = mesh;
    this.shader = shader;
    this.uniforms = {
      modelTransform: mat4.create(),
      cameraTransform: mat4.create(),
      projectionMatrix: mat4.create(),
    };
  }

  setTransforms(cam) {
    mat4.copy(this.uniforms.modelTransform, this.transform.worldMatrix);
    mat4.copy(this.uniforms.cameraTransform, cam.worldMatrix);
    mat4.copy(this.uniforms.projectionMatrix, cam.projectionMatrix);
  }

  render(cam, shader = null) {
    if (!shader) shader = this.shader;
    if (!this.mesh.initialized || !this.shader.initialized) return;

    gl.useProgram(shader.program);
    this.setTransforms(cam);
    shader.setUniforms(this.uniforms);
    gl.bindVertexArray(this.mesh.vao);
    if (this.mesh.hasIndex) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vbo);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.ibo);
      gl.drawElements(
        this.mesh.drawMode,
        this.mesh.numElements,
        gl.UNSIGNED_SHORT,
        0
      );
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vbo);
      gl.drawArrays(this.mesh.drawMode, 0, this.mesh.numElements);
    }
    gl.bindVertexArray(null);
  }
}
