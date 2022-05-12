import gl from "../gl.js";
import { vec3, mat4, quat, glMatrix } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import { LightType, Light, ToonShader } from "../toon.js";

export default class Lab7App extends cs380.BaseApp {
  async initialize() {
    // Basic setup for camera
    const { width, height } = gl.canvas.getBoundingClientRect();
    const aspectRatio = width / height;
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 0, 8);
    mat4.perspective(this.camera.projectionMatrix, glMatrix.toRadian(45), aspectRatio, 0.01, 100);

    // things to finalize()
    this.thingsToClear = [];

    // SimpleOrbitControl
    const orbitControlCenter = vec3.fromValues(0, 0, 0);
    this.simpleOrbitControl = new cs380.utils.SimpleOrbitControl(this.camera, orbitControlCenter);
    this.thingsToClear.push(this.simpleOrbitControl);

    // TODO: import a mesh model
    const meshLoaderResult = await cs380.MeshLoader.load({
      suzanne: "resources/models/suzanne.obj",
    });
    const suzanneMesh = cs380.Mesh.fromData(meshLoaderResult.suzanne);

    // import ToonShader
    const toonShader = await cs380.buildShader(ToonShader);

    this.thingsToClear.push(suzanneMesh);
    this.thingsToClear.push(toonShader);

    // initialize picking shader & buffer
    const pickingShader = await cs380.buildShader(cs380.PickingShader);
    this.pickingBuffer = new cs380.PickingBuffer();
    this.pickingBuffer.initialize(width, height);
    this.thingsToClear.push(pickingShader, this.pickingBuffer);

    // initialize light sources
    this.lights = [];
    const lightDir = vec3.create();

    const light0 = new Light();
    light0.illuminance = 0.1;
    light0.type = LightType.AMBIENT;
    this.lights.push(light0);

    const light1 = new Light();
    vec3.set(lightDir, -1, -1, -1);
    light1.illuminance = 0.9;
    light1.transform.lookAt(lightDir);
    light1.type = LightType.DIRECTIONAL;
    this.lights.push(light1);

    // TODO: initialize PickableObject for the imported model
    this.suzanne = new cs380.PickableObject(suzanneMesh, toonShader, pickingShader, 1);
    this.suzanne.uniforms.mainColor = vec3.fromValues(1, 0.4, 0.3);
    this.suzanne.uniforms.lights = this.lights;

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
          <strong>Submission:</strong> Implement at least one NPR technique.
           Take two screenshots from different view, or different parameter settings, and briefly explain about your work.
        </li>
      </ul>
    `;

    // Setup GUIs
    const setInputBehavior = (id, onchange, initialize, callback) => {
      const input = document.getElementById(id);
      const callbackWrapper = () => callback(input.value); // NOTE: must parse to int/float for numeric values
      if (onchange) {
        input.onchange = callbackWrapper;
        if (initialize) input.onchange();
      } else {
        input.oninput = callbackWrapper;
        if (initialize) input.oninput();
      }
    };

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

    // write down your code for mouse interactions
    console.log(`onMouseDown() got index ${index}`);
  }

  finalize() {
    gl.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.thingsToClear.forEach((it) => it.finalize());
    gl.disable(gl.CULL_FACE);
  }

  update(elapsed, dt) {
    // TODO: update your scene here
    this.simpleOrbitControl.update(dt);

    // 1. Render picking information first
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingBuffer.fbo);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.suzanne.renderPicking(this.camera);

    // 2. Render real scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.suzanne.render(this.camera);
  }
}
