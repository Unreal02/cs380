import gl from "../gl.js";
import { vec3, mat4, quat, glMatrix, vec2 } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import { SimpleShader } from "../simple_shader.js";

export default class Lab4App extends cs380.BaseApp {
  async initialize() {
    // Basic setup for camera
    const { width, height } = gl.canvas.getBoundingClientRect();
    const aspectRatio = width / height;
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 0, 8);
    this.camera.transform.lookAt(vec3.fromValues(-0, -0, -8));
    mat4.perspective(
      this.camera.projectionMatrix,
      glMatrix.toRadian(45),
      aspectRatio,
      0.01,
      100
    );

    // things to finalize()
    this.thingsToClear = [];

    // initialize mesh and shader
    const cubeMeshData = cs380.primitives.generateCube();
    const cubeMesh = cs380.Mesh.fromData(cubeMeshData);
    const sphereMeshData = cs380.primitives.generateSphere();
    const sphereMesh = cs380.Mesh.fromData(sphereMeshData);
    const simpleShader = await cs380.buildShader(SimpleShader);

    this.thingsToClear.push(cubeMesh, sphereMesh, simpleShader);

    // initialize picking shader & buffer
    const pickingShader = await cs380.buildShader(cs380.PickingShader);
    this.pickingBuffer = new cs380.PickingBuffer();
    this.pickingBuffer.initialize(width, height);
    this.thingsToClear.push(pickingShader, this.pickingBuffer);

    // TODO : add Pickable cube
    this.sphere = new cs380.PickableObject(
      sphereMesh,
      simpleShader,
      pickingShader,
      1
    );
    this.cube = new cs380.PickableObject(
      cubeMesh,
      simpleShader,
      pickingShader,
      2
    );
    this.sphere.transform.localPosition = [1, 1, 0];
    this.cube.transform.localPosition = [-1, -1, 0];
    quat.setAxisAngle(
      this.cube.transform.localRotation,
      vec3.normalize(vec3.create(), vec3.fromValues(1, 1, 0)),
      Math.PI / 4
    );

    // TODO : add your own transformations for sphere and cube

    // Event listener for interactions
    this.handleKeyDown = (e) => {
      // e.repeat is true when the key has been helded for a while
      if (e.repeat) return;
      this.onKeyDown(e.key);
    };
    this.handleMouseDown = (e) => {
      // e.button = 0 if it is left mouse button
      if (e.button !== 0) return;
      this.onMouseDown(e);
    };
    document.addEventListener("keydown", this.handleKeyDown);
    gl.canvas.addEventListener("mousedown", this.handleMouseDown);

    // HTML interaction
    document.getElementById("settings").innerHTML = `
      <ul>
        <li>
          <strong>Submission:</strong> A picture that contains transformed sphere and cube.
        </li>
      </ul>
    `;

    // GL settings
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
  }

  onKeyDown(key) {
    // TODO : write down your transformation code
    console.log(`key down: ${key}`);
    if (key == "s") this.sphere.transform.localScale = [1.5, 0.7, 1];
    else if (key == "ArrowUp") {
      const pos = this.cube.transform.localPosition;
      vec3.add(this.cube.transform.localPosition, pos, [0, 0.2, 0]);
    } else if (key == "ArrowDown") {
      const pos = this.cube.transform.localPosition;
      vec3.add(this.cube.transform.localPosition, pos, [0, -0.2, 0]);
    } else if (key == "ArrowLeft") {
      const pos = this.cube.transform.localPosition;
      vec3.add(this.cube.transform.localPosition, pos, [-0.2, 0, 0]);
    } else if (key == "ArrowRight") {
      const pos = this.cube.transform.localPosition;
      vec3.add(this.cube.transform.localPosition, pos, [0.2, 0, 0]);
    }
  }

  onMouseDown(e) {
    const { left, bottom } = gl.canvas.getBoundingClientRect();
    const x = e.clientX - left;
    const y = bottom - e.clientY;

    // Object with this index has just picked
    const index = this.pickingBuffer.pick(x, y);

    // TODO : write down your transformation code
    console.log(`onMouseDown() got index ${index}`);

    if (index == 1) {
      quat.setAxisAngle(
        this.sphere.transform.localRotation,
        vec3.normalize(vec3.create(), vec3.fromValues(0.2, 0.2, 1)),
        Math.PI / 6
      );
    } else if (index == 2) {
      const scale = this.cube.transform.localScale;
      vec3.add(this.cube.transform.localScale, scale, [0.2, 0.2, 0.2]);
    }
  }

  finalize() {
    document.removeEventListener("keydown", this.handleKeyDown);
    gl.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.thingsToClear.forEach((it) => it.finalize());
  }

  update(elapsed, dt) {
    // 1. Render picking information first
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingBuffer.fbo);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // TODO : call renderPicking() for the PickableObject
    this.sphere.renderPicking(this.camera);
    this.cube.renderPicking(this.camera);

    // 2. Render real scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.sphere.render(this.camera);
    this.cube.render(this.camera);
  }
}
