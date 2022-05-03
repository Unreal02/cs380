import gl from "../gl.js";
import { vec3, mat4, quat, glMatrix } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import { SimpleShader } from "../simple_shader.js";
import { LightType, Light, BlinnPhongShader } from "../blinn_phong.js";

export default class Lab6App extends cs380.BaseApp {
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
    )
    ;

    // things to finalize()
    this.thingsToClear = [];

    
    // SimpleOrbitControl
    const orbitControlCenter = vec3.fromValues(0, 0, 0);
    this.simpleOrbitControl = new cs380.utils.SimpleOrbitControl(
      this.camera,
      orbitControlCenter
    );
    this.thingsToClear.push(this.simpleOrbitControl);

    // generate a sphere
    const sphereMeshData = cs380.primitives.generateSphere();
    const sphereMesh = cs380.Mesh.fromData(sphereMeshData);

    // TODO: import a mesh model

    const simpleShader = await cs380.buildShader(SimpleShader);
    // TODO: import BlinnPhongShader

    this.thingsToClear.push(sphereMesh);
    this.thingsToClear.push(simpleShader);
    this.thingsToClear.push(/*mesh & shader...*/);
    
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
    
    // initialize a sphere Object
    this.sphere = new cs380.PickableObject(
        sphereMesh, 
        simpleShader,
        pickingShader,
        1
    );
    vec3.set(this.sphere.transform.localPosition, -1.2, 0, 0);
    vec3.set(this.sphere.transform.localScale, 0.7, 0.7, 0.7);
    this.sphere.uniforms.lights = this.lights; 

    // TODO: initialize PickableObject or RenderObject for the imported model
    
    // Event listener for interactions
    this.handleMouseDown = (e) => {
      // e.button = 0 if it is left mouse button
      if (e.button !== 0) return;
      this.onMouseDown(e);
    };
    gl.canvas.addEventListener("mousedown", this.handleMouseDown);

    // HTML interaction
    document.getElementById("settings").innerHTML = `  
      <label for="setting-ambient">Ambient Light</label>
      <input type="range" min=0 max=1 value=0.1 step=0.01 id="setting-ambient">
      <label for="setting-illuminance">Directional Light Illuminance</label>
      <input type="range" min=0 max=1 value=0.9 step=0.01 id="setting-illuminance">
      
      <ul>
        <li>
          <strong>Submission:</strong> Take a screenshot 
           so that ambient, diffuse, and specular reflections are well recognized.
        </li>
      </ul>
    `;
    
    // Setup GUIs
    const setInputBehavior = (id, onchange, initialize, callback) => {
      const input = document.getElementById(id);
      const callbackWrapper = 
          () => callback(input.value); // NOTE: must parse to int/float for numeric values
      if (onchange) {
        input.onchange = callbackWrapper;
        if (initialize) input.onchange();
      } else {
        input.oninput = callbackWrapper;
        if (initialize) input.oninput();
      }
    }
    setInputBehavior('setting-ambient', true, true,
        (val) => { this.lights[0].illuminance=val;});
    setInputBehavior('setting-illuminance', true, true,
        (val) => { this.lights[1].illuminance=val;});
    
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

    // write down your code for interactoins
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

    this.sphere.renderPicking(this.camera);

    // 2. Render real scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    this.sphere.render(this.camera);
  }
}
