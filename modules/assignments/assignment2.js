import gl from "../gl.js";
import { vec3, mat4, quat, glMatrix } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import { SimpleShader } from "../simple_shader.js";
import { generateCube } from "../cs380/primitives.js";

export default class Assignment2 extends cs380.BaseApp {
  async initialize() {
    // Basic setup for camera
    const { width, height } = gl.canvas.getBoundingClientRect();
    const aspectRatio = width / height;
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 0, 5);
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
    this.simpleOrbitControl = new cs380.utils.SimpleOrbitControl(this.camera, [0, 0, 0]);
    this.thingsToClear.push(this.simpleOrbitControl);

    // initialize shader & buffer
    const simpleShader = await cs380.buildShader(SimpleShader);
    const pickingShader = await cs380.buildShader(cs380.PickingShader);
    this.pickingBuffer = new cs380.PickingBuffer();
    this.pickingBuffer.initialize(width, height);
    this.thingsToClear.push(simpleShader, pickingShader, this.pickingBuffer);

    // background (not pickable)
    const bgSize = 16;
    const bgMesh = new cs380.Mesh();
    this.background = new cs380.RenderObject(bgMesh, simpleShader);
    this.background.transform.localPosition = [0, 0, -bgSize / 2];
    const bgPlane = cs380.Mesh.fromData(cs380.primitives.generatePlane(bgSize, bgSize));
    this.thingsToClear.push(bgMesh, bgPlane);
    this.bgList = [];

    // add background component
    const addBackgroundComponent = (name, x, y, z) => {
      this[name] = new cs380.RenderObject(bgPlane, simpleShader);
      this[name].transform.setParent(this.background.transform);
      this[name].transform.localPosition = [x, y, z];
      this[name].uniforms.mainColor = [0.5, 1, 1];
      this.bgList.push(this[name]);
    };

    // background
    addBackgroundComponent("bgB", 0, 0, -bgSize / 2);
    quat.rotateX(this.bgB.transform.localRotation, quat.create(), Math.PI);
    addBackgroundComponent("bgL", -bgSize / 2, 0, 0);
    quat.rotateY(this.bgL.transform.localRotation, quat.create(), -Math.PI / 2);
    addBackgroundComponent("bgR", bgSize / 2, 0, 0);
    quat.rotateY(this.bgR.transform.localRotation, quat.create(), Math.PI / 2);
    addBackgroundComponent("bgU", 0, bgSize / 2, 0);
    quat.rotateX(this.bgU.transform.localRotation, quat.create(), -Math.PI / 2);
    addBackgroundComponent("bgD", 0, -bgSize / 2, 0);
    quat.rotateX(this.bgD.transform.localRotation, quat.create(), Math.PI / 2);

    // Avatar (pickable)
    this.avatarList = [];

    // add avatar component
    const addAvatarComponent = (name, mesh, pos, innerPos, index, parent) => {
      const m = new cs380.Mesh();
      this[name] = new cs380.RenderObject(m, simpleShader);
      this[name].transform.localPosition = pos;
      this[name].transform.setParent(parent.transform);
      this.thingsToClear.push(m);

      const name0 = name + "0";
      this[name0] = new cs380.PickableObject(mesh, simpleShader, pickingShader, index);
      this[name0].transform.localPosition = innerPos;
      this[name0].transform.setParent(this[name].transform);
      this.avatarList.push(this[name0]);
    };

    // body
    const bodyMesh = new cs380.Mesh();
    this.thingsToClear.push(bodyMesh);
    this.body = new cs380.RenderObject(bodyMesh, simpleShader);
    this.body.transform.localPosition = [0, 0, -10];

    // body0
    const body0Mesh = cs380.Mesh.fromData(cs380.primitives.generateCone(1, 4));
    this.thingsToClear.push(body0Mesh);
    this.body0 = new cs380.PickableObject(body0Mesh, simpleShader, pickingShader, 1);
    this.body0.transform.localPosition = [0, -0.5, 0];
    this.body0.transform.localScale = [1, 1, 0.7];
    this.body0.transform.setParent(this.body.transform);
    this.avatarList.push(this.body0);

    // body1
    const body1Mesh = cs380.Mesh.fromData(cs380.primitives.generateCone(0.8, 3.2));
    this.thingsToClear.push(body1Mesh);
    this.body1 = new cs380.PickableObject(body1Mesh, simpleShader, pickingShader, 1);
    this.body1.transform.localPosition = [0, 2.7, 0];
    this.body1.transform.localScale = [1, 1, 0.7];
    quat.rotateX(this.body1.transform.localRotation, quat.create(), Math.PI);
    this.body1.transform.setParent(this.body.transform);
    this.avatarList.push(this.body1);

    // body2 (neck)
    const body2Mesh = cs380.Mesh.fromData(cs380.primitives.generateCylinder(0.15, 1));
    this.thingsToClear.push(body2Mesh);
    this.body2 = new cs380.PickableObject(body2Mesh, simpleShader, pickingShader, 1);
    this.body2.transform.localPosition = [0, 3, 0];
    quat.rotateX(this.body2.transform.localRotation, quat.create(), Math.PI);
    this.body2.transform.setParent(this.body.transform);
    this.avatarList.push(this.body2);

    // body3 (shoulder)
    const body3Mesh = cs380.Mesh.fromData(cs380.primitives.generateSphere(0.8));
    this.thingsToClear.push(body3Mesh);
    this.body3 = new cs380.PickableObject(body3Mesh, simpleShader, pickingShader, 1);
    this.body3.transform.localPosition = [0, 2.7, 0];
    this.body3.transform.localScale = [1, 0.3, 0.7];
    quat.rotateX(this.body3.transform.localRotation, quat.create(), Math.PI);
    this.body3.transform.setParent(this.body.transform);
    this.avatarList.push(this.body3);

    // head
    const headMesh = cs380.Mesh.fromData(cs380.primitives.generateSphere(0.5));
    this.thingsToClear.push(headMesh);
    addAvatarComponent("head", headMesh, [0, 3.5, 0], [0, 0, 0], 2, this.body);
    this.head0.transform.localScale = [0.8, 1, 0.8];

    // leg and arm mesh
    const legMesh = cs380.Mesh.fromData(cs380.primitives.generateCapsule(0.25, 2));
    const armMesh = cs380.Mesh.fromData(cs380.primitives.generateCapsule(0.12, 1.5));
    this.thingsToClear.push(legMesh, armMesh);

    // leg
    addAvatarComponent("legLU", legMesh, [0.3, 0, 0], [0, -1, 0], 3, this.body);
    addAvatarComponent("legRU", legMesh, [-0.3, 0, 0], [0, -1, 0], 4, this.body);
    addAvatarComponent("legLD", legMesh, [0, -2, 0], [0, -1, 0], 5, this.legLU);
    addAvatarComponent("legRD", legMesh, [0, -2, 0], [0, -1, 0], 6, this.legRU);

    // arm
    addAvatarComponent("armLU", armMesh, [0.68, 2.7, 0], [0, -0.75, 0], 7, this.body);
    addAvatarComponent("armRU", armMesh, [-0.68, 2.7, 0], [0, -0.75, 0], 8, this.body);
    addAvatarComponent("armLD", armMesh, [0, -1, 0], [0, -0.75, 0], 9, this.armLU);
    addAvatarComponent("armRD", armMesh, [0, -1, 0], [0, -0.75, 0], 10, this.armRU);
    quat.rotateZ(this.armLU.transform.localRotation, quat.create(), Math.atan(0.25));
    quat.rotateZ(this.armRU.transform.localRotation, quat.create(), Math.atan(-0.25));

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

    document.getElementById("settings").innerHTML = `
      <h3>Basic requirements</h3>
      <ul>
        <li>Generate 3D geometric objects: cone and cylinder</li>
        <li>Construct your avatar with hierarchical modeling containing at least 10 parts</li>
        <li>Introduce interactive avatar posing from keyboard and mouse inputs</li>
        <li>Show some creativity in your scene</li>
      </ul>
      <strong>Start early!</strong>
    `;

    // GL settings
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
  }

  onKeyDown(key) {
    console.log(`key down: ${key}`);
    if (key == "w") this.body.transform.localPosition[2] += -1;
    if (key == "s") this.body.transform.localPosition[2] += 1;
  }

  onMouseDown(e) {
    const { left, bottom } = gl.canvas.getBoundingClientRect();
    const x = e.clientX - left;
    const y = bottom - e.clientY;

    // Object with this index has just picked
    const index = this.pickingBuffer.pick(x, y);

    console.log(`onMouseDown() got index ${index}`);
  }

  finalize() {
    // Finalize WebGL objects (mesh, shader, texture, ...)
    document.removeEventListener("keydown", this.handleKeyDown);
    gl.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.thingsToClear.forEach((it) => it.finalize());
  }

  rotate(target, x, y, z) {
    quat.multiply(
      target.transform.localRotation,
      quat.fromEuler(quat.create(), x, y, z),
      target.transform.localRotation
    );
  }

  update(elapsed, dt) {
    // Updates before rendering here
    this.simpleOrbitControl.update(dt);

    // Render picking information first
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingBuffer.fbo);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // renderPicking() here
    this.avatarList.forEach((i) => i.renderPicking(this.camera));

    // Render real scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // render() here
    this.bgList.forEach((i) => i.render(this.camera));
    this.avatarList.forEach((i) => i.render(this.camera));
  }
}
