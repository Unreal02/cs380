import gl from "../gl.js";
import { vec3, mat4, quat, glMatrix } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import { SimpleShader } from "../simple_shader.js";

export default class Lab5App extends cs380.BaseApp {
  async initialize() {
    // Basic setup for camera
    const { width, height } = gl.canvas.getBoundingClientRect();
    const aspectRatio = width / height;
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 0, 8);
    mat4.perspective(
      this.camera.projectionMatrix,
      glMatrix.toRadian(45),
      aspectRatio,
      0.01,
      100
    );

    // things to finalize()
    this.thingsToClear = [];

    // SimpleOrbitControl
    const orbitControlCenter = vec3.fromValues(0, 0, 0);
    this.simpleOrbitControl = new cs380.utils.SimpleOrbitControl(
      this.camera,
      orbitControlCenter
    );
    this.thingsToClear.push(this.simpleOrbitControl);

    // TODO: initialize mesh and shader
    this.thingsToClear.push(/*mesh & shader...*/);

    // initialize picking shader & buffer
    const pickingShader = await cs380.buildShader(cs380.PickingShader);
    this.pickingBuffer = new cs380.PickingBuffer();
    this.pickingBuffer.initialize(width, height);
    this.thingsToClear.push(pickingShader, this.pickingBuffer);

    // TODO: initialize PickableObject for your solar system
    const sphereMeshData = cs380.primitives.generateSphere();
    const sphereMesh = cs380.Mesh.fromData(sphereMeshData);
    const simpleShader = await cs380.buildShader(SimpleShader);
    this.sun = new cs380.PickableObject(
      sphereMesh,
      simpleShader,
      pickingShader,
      1
    );
    this.sun.uniforms.mainColor = vec3.fromValues(0.8, 0.4, 0);
    this.earth = new cs380.PickableObject(
      sphereMesh,
      simpleShader,
      pickingShader,
      2
    );
    this.earth.transform.localScale = vec3.fromValues(0.3, 0.3, 0.3);
    this.earth.transform.setParent(this.sun.transform);
    this.earth.uniforms.mainColor = vec3.fromValues(0, 0.5, 1);
    this.moon = new cs380.PickableObject(
      sphereMesh,
      simpleShader,
      pickingShader,
      3
    );
    this.moon.transform.localScale = vec3.fromValues(0.1, 0.1, 0.1);
    this.moon.transform.setParent(this.earth.transform);
    this.moon.uniforms.mainColor = vec3.fromValues(0.7, 0.7, 0.7);
    this.camera.transform.setParent(this.sun.transform);

    // Event listener for interactions
    this.handleMouseDown = (e) => {
      // e.button = 0 if it is left mouse button
      if (e.button !== 0) return;
      this.onMouseDown(e);
    };
    gl.canvas.addEventListener("mousedown", this.handleMouseDown);

    // HTML interaction
    document.getElementById("settings").innerHTML = `
      <ul>
        <li>
          <strong>Submission:</strong> 3 screenshots with your solar system;
          the camera should move around the sun, earth, and moon, respectively.
        </li>
      </ul>
    `;

    // GL settings
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
  }

  onMouseDown(e) {
    const { left, bottom } = gl.canvas.getBoundingClientRect();
    const x = e.clientX - left;
    const y = bottom - e.clientY;

    // Object with this index has just picked
    const index = this.pickingBuffer.pick(x, y);

    // TODO : write down your code
    console.log(`onMouseDown() got index ${index}`);
    if (index == 1) {
      this.camera.transform.setParent(this.sun.transform);
    } else if (index == 2) {
      this.camera.transform.setParent(this.earth.transform);
    } else if (index == 3) {
      this.camera.transform.setParent(this.moon.transform);
    }
  }

  finalize() {
    gl.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.thingsToClear.forEach((it) => it.finalize());
    gl.disable(gl.CULL_FACE);
  }

  update(elapsed, dt) {
    // TODO: update your solar system movement here
    this.simpleOrbitControl.update(dt);
    const earthRotateSpeed = 0.2;
    const moonRotateSpeed = 0.8;
    const earthAngle = elapsed * earthRotateSpeed * 2 * Math.PI;
    const moonAngle = elapsed * moonRotateSpeed * 2 * Math.PI;
    this.earth.transform.localPosition = vec3.fromValues(
      2.5 * Math.cos(earthAngle),
      2.5 * Math.sin(earthAngle),
      0
    );
    this.moon.transform.localPosition = vec3.fromValues(
      0.5 * Math.cos(moonAngle),
      0.5 * Math.sin(moonAngle),
      0
    );

    // 1. Render picking information first
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingBuffer.fbo);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.sun.renderPicking(this.camera);
    this.earth.renderPicking(this.camera);
    this.moon.renderPicking(this.camera);

    // 2. Render real scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.sun.render(this.camera);
    this.earth.render(this.camera);
    this.moon.render(this.camera);
  }
}
