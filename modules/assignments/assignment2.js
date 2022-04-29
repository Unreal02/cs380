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
    this.simpleOrbitControl = new cs380.utils.SimpleOrbitControl(
      this.camera,
      [0, 0, 0]
    );
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
    const bgPlane = cs380.Mesh.fromData(
      cs380.primitives.generatePlane(bgSize, bgSize)
    );
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

    // body
    const bodyMesh = new cs380.Mesh();
    this.thingsToClear.push(bodyMesh);
    this.body = new cs380.RenderObject(bodyMesh, simpleShader);
    this.body.transform.localPosition = [0, 0, -10];

    // body0
    const body0Mesh = cs380.Mesh.fromData(cs380.primitives.generateCone(1, 4));
    this.thingsToClear.push(body0Mesh);
    this.body0 = new cs380.PickableObject(
      body0Mesh,
      simpleShader,
      pickingShader,
      1
    );
    this.body0.transform.localPosition = [0, -0.5, 0];
    this.body0.transform.localScale = [1, 1, 0.7];
    this.body0.transform.setParent(this.body.transform);
    this.avatarList.push(this.body0);

    // body1
    const body1Mesh = cs380.Mesh.fromData(
      cs380.primitives.generateCone(0.8, 3.2)
    );
    this.thingsToClear.push(body1Mesh);
    this.body1 = new cs380.PickableObject(
      body1Mesh,
      simpleShader,
      pickingShader,
      1
    );
    this.body1.transform.localPosition = [0, 2.7, 0];
    this.body1.transform.localScale = [1, 1, 0.7];
    quat.rotateX(this.body1.transform.localRotation, quat.create(), Math.PI);
    this.body1.transform.setParent(this.body.transform);
    this.avatarList.push(this.body1);

    // body2 (neck)
    const body2Mesh = cs380.Mesh.fromData(
      cs380.primitives.generateCylinder(0.15, 1)
    );
    this.thingsToClear.push(body2Mesh);
    this.body2 = new cs380.PickableObject(
      body2Mesh,
      simpleShader,
      pickingShader,
      1
    );
    this.body2.transform.localPosition = [0, 3, 0];
    quat.rotateX(this.body2.transform.localRotation, quat.create(), Math.PI);
    this.body2.transform.setParent(this.body.transform);
    this.avatarList.push(this.body2);

    // body3 (shoulder)
    const body3Mesh = cs380.Mesh.fromData(cs380.primitives.generateSphere(0.8));
    this.thingsToClear.push(body3Mesh);
    this.body3 = new cs380.PickableObject(
      body3Mesh,
      simpleShader,
      pickingShader,
      1
    );
    this.body3.transform.localPosition = [0, 2.7, 0];
    this.body3.transform.localScale = [1, 0.3, 0.7];
    quat.rotateX(this.body3.transform.localRotation, quat.create(), Math.PI);
    this.body3.transform.setParent(this.body.transform);
    this.avatarList.push(this.body3);

    // head
    const headMesh = cs380.Mesh.fromData(cs380.primitives.generateSphere(0.5));
    this.thingsToClear.push(headMesh);
    this.head = new cs380.PickableObject(
      headMesh,
      simpleShader,
      pickingShader,
      2
    );
    this.head.transform.localPosition = [0, 3.5, 0];
    this.head.transform.localScale = [0.8, 1, 0.8];
    this.head.transform.setParent(this.body.transform);
    this.avatarList.push(this.head);

    // leg and arm mesh
    const leg0Mesh = cs380.Mesh.fromData(
      cs380.primitives.generateCylinder(0.25, 2)
    );
    const leg1Mesh = cs380.Mesh.fromData(cs380.primitives.generateSphere(0.25));
    const arm0Mesh = cs380.Mesh.fromData(
      cs380.primitives.generateCylinder(0.12, 1.5)
    );
    const arm1Mesh = cs380.Mesh.fromData(cs380.primitives.generateSphere(0.12));
    this.thingsToClear.push(leg0Mesh, leg1Mesh, arm0Mesh, arm1Mesh);

    // add leg and arm component
    const addLegArmComponent = (
      name,
      pos,
      index,
      parent,
      mesh0,
      mesh1,
      len
    ) => {
      const name0 = name + "0";
      const name1 = name + "1";

      const mesh = new cs380.Mesh();
      this[name] = new cs380.RenderObject(mesh, simpleShader);
      this[name].transform.localPosition = pos;
      this[name].transform.setParent(parent);
      this.thingsToClear.push(mesh);

      this[name0] = new cs380.PickableObject(
        mesh0,
        simpleShader,
        pickingShader,
        index
      );
      this[name1] = new cs380.PickableObject(
        mesh1,
        simpleShader,
        pickingShader,
        index
      );
      this[name0].transform.localPosition = [0, -len / 2, 0];
      this[name1].transform.localPosition = [0, -len, 0];
      this[name0].transform.setParent(this[name].transform);
      this[name1].transform.setParent(this[name].transform);
      this.avatarList.push(this[name0]);
      this.avatarList.push(this[name1]);
    };
    const addLegComponent = (name, pos, index, parent) =>
      addLegArmComponent(name, pos, index, parent, leg0Mesh, leg1Mesh, 2);
    const addArmComponent = (name, pos, index, parent) =>
      addLegArmComponent(name, pos, index, parent, arm0Mesh, arm1Mesh, 1.5);

    // leg
    addLegComponent("legLU", [0.3, 0, 0], 3, this.body.transform);
    addLegComponent("legRU", [-0.3, 0, 0], 4, this.body.transform);
    addLegComponent("legLD", [0, -2, 0], 5, this.legLU.transform);
    addLegComponent("legRD", [0, -2, 0], 6, this.legRU.transform);

    // arm
    addArmComponent("armLU", [0.68, 2.7, 0], 7, this.body.transform);
    addArmComponent("armRU", [-0.68, 2.7, 0], 8, this.body.transform);
    addArmComponent("armLD", [0, -1, 0], 9, this.armLU.transform);
    addArmComponent("armRD", [0, -1, 0], 10, this.armRU.transform);
    quat.rotateZ(
      this.armLU.transform.localRotation,
      quat.create(),
      Math.atan(0.25)
    );
    quat.rotateZ(
      this.armRU.transform.localRotation,
      quat.create(),
      Math.atan(-0.25)
    );

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
