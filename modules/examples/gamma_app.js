import gl from "../gl.js";
import { vec2, vec3, mat4 } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

class GammaShader extends cs380.BaseShader {
  static get source() {
    return [
      [gl.VERTEX_SHADER, "resources/gamma.vert"],
      [gl.FRAGMENT_SHADER, "resources/gamma.frag"],
    ];
  }

  generateUniformLocations() {
    return {
      projectionMatrix: gl.getUniformLocation(
        this.program,
        "uProjectionMatrix"
      ),
      cameraTransform: gl.getUniformLocation(this.program, "uCameraTransform"),
      modelTransform: gl.getUniformLocation(this.program, "uModelTransform"),
      screenResolution: gl.getUniformLocation(this.program, "screenResolution"),
      time: gl.getUniformLocation(this.program, "time"),
      applyGammaCorrection: gl.getUniformLocation(
        this.program,
        "applyGammaCorrection"
      ),
    };
  }

  setUniforms(kv) {
    this.setUniformMat4(kv, "projectionMatrix");
    this.setUniformMat4(kv, "cameraTransform");
    this.setUniformMat4(kv, "modelTransform");
    this.setUniformVec2(kv, "screenResolution");
    this.setUniformFloat(kv, "time");
    this.setUniformInt(kv, "applyGammaCorrection");
  }
}

export default class EmptyApp extends cs380.BaseApp {
  async initialize() {
    // Initialize setting div
    const settings = document.getElementById("settings");
    settings.innerHTML = `
        <div>
        <label for="setting-gamma">Apply gamma correction</label>
        <input type="checkbox" id="setting-gamma">
        </div>
        <div>
        <a href="https://en.wikipedia.org/wiki/Gamma_correction">Gamma correction</a> converts linear RGB colors into sRGB colors for displays. Without gamma correction, linear blending of colors appears darker in the middle.
        </div>
        `;

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
    const cubeData = cs380.primitives.generateCube(2, 2, 2);
    this.mesh = cs380.Mesh.fromData(cubeData);

    const gammaShaderSources = await cs380.ShaderLoader.loadSingle(
      GammaShader.source
    );
    this.shader = new GammaShader();
    this.shader.initialize(gammaShaderSources);

    this.obj = new cs380.RenderObject(this.mesh, this.shader);
    const uniform = this.obj.uniforms;
    uniform.screenResolution = vec2.fromValues(
      gl.canvas.clientWidth,
      gl.canvas.clientHeight
    );

    cs380.utils.setCheckboxBehavior(
      "setting-gamma",
      (val) => (uniform.applyGammaCorrection = val)
    );
  }

  finalize() {
    this.mesh.finalize();
    this.shader.finalize();
  }

  update(elapsed, dt) {
    // Updates before rendering here
    vec2.set(
      this.obj.uniforms.screenResolution,
      gl.canvas.clientWidth,
      gl.canvas.clientHeight
    );
    this.obj.uniforms.time = elapsed;

    // Clear canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rest of rendering below
    this.obj.render(this.camera);
  }
}
