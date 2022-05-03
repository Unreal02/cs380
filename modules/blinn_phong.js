import gl from './gl.js'

import { vec3, vec4 } from "./cs380/gl-matrix.js"

import * as cs380 from './cs380/cs380.js'

export const LightType = {
  DIRECTIONAL: 0,
  POINT: 1,
  SPOTLIGHT: 2,
  AMBIENT: 3,
};

export class Light {
  constructor() {
    this.transform = new cs380.Transform();
    this.type = LightType.DIRECTIONAL;
    this.enabled = true;
    this.illuminance = 1;
    this.angle = Math.PI / 6;
    this.angleSmoothness = 0.1;
    this._v3 = vec3.create();
    this._v4 = vec4.create();
  }

  get pos(){
    vec3.set(this._v3, 0, 0, 0);
    vec3.transformMat4(this._v3, this._v3, this.transform.worldMatrix);
    return this._v3;
  }

  get dir() {
    vec4.set(this._v4, 0, 0, -1, 0);
    vec4.transformMat4(this._v4, this._v4, this.transform.worldMatrix);
    vec3.set(this._v3, ...this._v4);
    return this._v3;
  }

}

export class BlinnPhongShader extends cs380.BaseShader {
  static get source() {
    // Define shader codes here
    return [
      [gl.VERTEX_SHADER, "resources/blinn_phong.vert"],
      [gl.FRAGMENT_SHADER, "resources/blinn_phong.frag"],
    ];
  }

  generateUniformLocations() {
    return {
      // Below three are must-have uniform variables,
      projectionMatrix: gl.getUniformLocation(this.program, "projectionMatrix"),
      cameraTransform: gl.getUniformLocation(this.program, "cameraTransform"),
      modelTransform: gl.getUniformLocation(this.program, "modelTransform"),

      // Shader-specific uniforms
      mainColor: gl.getUniformLocation(this.program, "mainColor"),
      numLights: gl.getUniformLocation(this.program, "numLights"),
    };
  }

  setUniforms(kv) {
    this.setUniformMat4(kv, "projectionMatrix");
    this.setUniformMat4(kv, "cameraTransform");
    this.setUniformMat4(kv, "modelTransform");

    // Set shader-specific uniforms here
    this.setUniformVec3(kv, "mainColor", 1, 1, 1);

    if ('lights' in kv) {
      const lights = kv['lights'];
      const lightProperties = ['type', 'enabled', 'pos', 'illuminance', 'dir', 'angle', 'angleSmoothness'];
      const numLights = Math.min(lights.length, 10);
      gl.uniform1i(this.uniformLocations.numLights, numLights);
      for (let i=0; i < numLights; i++) {
        const light = lights[i];
        const locations = lightProperties.reduce(
            (obj, x) => {
              obj[x] = gl.getUniformLocation(this.program, `lights[${i}].${x}`);
              return obj;
            }, {}
        );
        gl.uniform1i(locations.type, light.type);
        gl.uniform1i(locations.enabled, light.enabled);
        gl.uniform3f(locations.pos, ...light.pos);
        gl.uniform3f(locations.dir, ...light.dir);
        gl.uniform1f(locations.illuminance, light.illuminance);
        gl.uniform1f(locations.angle, light.angle);
        gl.uniform1f(locations.angleSmoothness, light.angleSmoothness);
      }
    }
    else {
      gl.uniform1i(this.uniformLocations.numLights, 0);
    }
  }
}
