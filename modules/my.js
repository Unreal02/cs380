import gl from "./gl.js";

import { vec3, vec4 } from "./cs380/gl-matrix.js";

import * as cs380 from "./cs380/cs380.js";
import { LightType, Light } from "./blinn_phong.js";

export class Material {
  constructor(color = [1, 1, 1]) {
    this.ambientColor = color;
    this.diffuseColor = color;
    this.specularColor = color;
    this.shininess = 100;
    this.toon = false;
    this.perlin = false;
  }
}

export class MyShader extends cs380.BaseShader {
  static get source() {
    // Define shader codes here
    return [
      [gl.VERTEX_SHADER, "resources/my.vert"],
      [gl.FRAGMENT_SHADER, "resources/my.frag"],
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

    // lights
    if ("lights" in kv) {
      const lights = kv["lights"];
      const lightProperties = [
        "type",
        "enabled",
        "pos",
        "illuminance",
        "dir",
        "angle",
        "angleSmoothness",
      ];
      const numLights = Math.min(lights.length, 10);
      gl.uniform1i(this.uniformLocations.numLights, numLights);
      for (let i = 0; i < numLights; i++) {
        const light = lights[i];
        const locations = lightProperties.reduce((obj, x) => {
          obj[x] = gl.getUniformLocation(this.program, `lights[${i}].${x}`);
          return obj;
        }, {});
        gl.uniform1i(locations.type, light.type);
        gl.uniform1i(locations.enabled, light.enabled);
        gl.uniform3f(locations.pos, ...light.pos);
        gl.uniform3f(locations.dir, ...light.dir);
        gl.uniform3f(locations.illuminance, ...light.illuminance);
        gl.uniform1f(locations.angle, light.angle);
        gl.uniform1f(locations.angleSmoothness, light.angleSmoothness);
      }
    } else {
      gl.uniform1i(this.uniformLocations.numLights, 0);
    }

    // material
    let material = new Material();
    if ("material" in kv) material = kv["material"];
    else {
      material.ambientColor = kv["mainColor"];
      material.diffuseColor = kv["mainColor"];
      material.specularColor = kv["mainColor"];
      material.toon = false;
      material.perlin = false;
    }
    const materialProperties = [
      "ambientColor",
      "diffuseColor",
      "specularColor",
      "shininess",
      "toon",
      "perlin",
    ];
    const location = materialProperties.reduce((obj, x) => {
      obj[x] = gl.getUniformLocation(this.program, `material.${x}`);
      return obj;
    }, {});
    gl.uniform3f(location.ambientColor, ...material.ambientColor);
    gl.uniform3f(location.diffuseColor, ...material.diffuseColor);
    gl.uniform3f(location.specularColor, ...material.specularColor);
    gl.uniform1f(location.shininess, material.shininess);
    gl.uniform1i(location.toon, material.toon ? 1 : 0);
    gl.uniform1i(location.perlin, material.perlin ? 1 : 0);
  }
}
