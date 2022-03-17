import gl from "../gl.js";

import * as cs380 from "../cs380/cs380.js";
import { vec3, mat4, quat } from "../cs380/gl-matrix.js";

import { SolidShader } from "../solid_shader.js";

export default class ExampleApp extends cs380.BaseApp {
  async initialize() {
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
    // Using utils.SimpleOrbitControl for camera movement
    const orbitControlCenter = vec3.fromValues(0, 0, 0);
    this.simpleOrbitControl = new cs380.utils.SimpleOrbitControl(
      this.camera,
      orbitControlCenter
    );

    this.thingsToClear = [];
    this.backgroundColor = vec3.fromValues(0, 0, 0);

    // 1. Render primitives
    // 1-1. initialize mesh
    const cubeMeshData = cs380.primitives.generateCube();
    const cubeMesh = cs380.Mesh.fromData(cubeMeshData);

    this.thingsToClear.push(cubeMesh); // Mesh creates buffers - needs finalization

    // 1-2. initialize shader
    const solidShader = await cs380.buildShader(SolidShader);

    this.thingsToClear.push(solidShader); // Shader creates a GL program - needs finalization

    // 1-3. create RenderObject
    const cubeObject = new cs380.RenderObject(cubeMesh, solidShader);
    const cubeObjectColor = vec3.fromValues(1, 1, 1);
    vec3.set(cubeObject.transform.localPosition, -1, 0, 0); // Put at (-1, 0, 0);
    cubeObject.uniforms.mainColor = cubeObjectColor; // Assign uniform variable 'mainColor'
    this.cubeObject = cubeObject;

    // 2. Render .obj models
    // 2-1. load mesh
    const meshLoaderResult = await cs380.MeshLoader.load({
      bunny: "resources/models/bunny.obj",
    });
    const bunnyMesh = cs380.Mesh.fromData(meshLoaderResult.bunny);

    this.thingsToClear.push(bunnyMesh); // Mesh creates buffers - needs finalization

    // 2-2. initialize shader
    //   (reusing solidShader from 1-2)

    // 2-3. create RenderObject
    const bunnyObject = new cs380.RenderObject(bunnyMesh, solidShader);
    const bunnyObjectColor = vec3.fromValues(1, 1, 1);
    vec3.set(bunnyObject.transform.localPosition, 1, 0, 0); // Put at (1, 0, 0);
    vec3.set(bunnyObject.transform.localScale, 0.5, 0.5, 0.5); // Shrink by half;
    bunnyObject.uniforms.mainColor = bunnyObjectColor; // Assign uniform variable 'mainColor'
    this.bunnyObject = bunnyObject;

    // 3. Create HTML inputs
    const settings = document.getElementById("settings");
    settings.innerHTML = `
        <div>
        <label for="setting-bg-color">Background color</label>
        <input type="color" id="setting-bg-color" value="#000000">
        </div>
        <div>
        <label for="setting-cube-color">Cube color</label>
        <input type="color" id="setting-cube-color" value="#ffffff">
        </div>
        <div>
        <label for="setting-bunny-color">Bunny color</label>
        <input type="color" id="setting-bunny-color" value="#ffffff">
        </div>
        <div>
        Rotate camera by click-and-drag, zoom by mouse wheel. 
        </div>`;

    cs380.utils.setInputBehavior("setting-bg-color", (val) =>
      cs380.utils.hexToRGB(this.backgroundColor, val)
    );

    cs380.utils.setInputBehavior("setting-cube-color", (val) =>
      cs380.utils.hexToRGB(cubeObjectColor, val)
    );

    cs380.utils.setInputBehavior("setting-bunny-color", (val) =>
      cs380.utils.hexToRGB(bunnyObjectColor, val)
    );
  }

  finalize() {
    for (const thing of this.thingsToClear) {
      thing.finalize();
    }
  }

  update(elapsed, dt) {
    // Updates before rendering here

    // SimpleOrbitControl update
    this.simpleOrbitControl.update(dt);

    // 4. Rotate bunny
    quat.rotateY(
      // See glMatrix documentation
      this.bunnyObject.transform.localRotation,
      this.bunnyObject.transform.localRotation,
      ((90 * Math.PI) / 180) * dt // 90 degrees per seconds
    );

    // Clear canvas
    gl.clearColor(...this.backgroundColor, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Render objects
    this.cubeObject.render(this.camera);
    this.bunnyObject.render(this.camera);
  }
}
