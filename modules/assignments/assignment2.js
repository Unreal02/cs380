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
    mat4.perspective(this.camera.projectionMatrix, glMatrix.toRadian(45), aspectRatio, 0.01, 100);

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
    const colorBlack = [0, 0, 0];
    const colorPink = [223, 32, 175].map((i) => i / 255);
    const colorSkin = [255, 227, 181].map((i) => i / 255);

    // add avatar inner component
    const addAvatarComponentInner = (innerName, name, mesh, innerPos, index, color = colorSkin) => {
      this[innerName] = new cs380.PickableObject(mesh, simpleShader, pickingShader, index);
      this[innerName].transform.localPosition = innerPos;
      this[innerName].transform.setParent(this[name].transform);
      this.avatarList.push(this[innerName]);
      this[innerName].uniforms.mainColor = color;
    };

    // add avatar component
    const addAvatarComponent = (name, mesh, pos, innerPos, index, parent, color) => {
      const m = new cs380.Mesh();
      this[name] = new cs380.RenderObject(m, simpleShader);
      this[name].transform.localPosition = pos;
      this[name].transform.setParent(parent.transform);
      this.thingsToClear.push(m);

      const innerName = name + "0";
      addAvatarComponentInner(innerName, name, mesh, innerPos, index, color);
    };

    // body mesh
    const bodyMesh = new cs380.Mesh();
    const body0Mesh = cs380.Mesh.fromData(cs380.primitives.generateCone(1, 4));
    const body1Mesh = cs380.Mesh.fromData(cs380.primitives.generateCone(0.8, 3.2));
    const body2Mesh = cs380.Mesh.fromData(cs380.primitives.generateCylinder(0.15, 1));
    const body3Mesh = cs380.Mesh.fromData(cs380.primitives.generateSphere(0.8));
    this.thingsToClear.push(bodyMesh, body0Mesh, body1Mesh, body2Mesh, body3Mesh);

    // body
    this.body = new cs380.RenderObject(bodyMesh, simpleShader);
    this.body.transform.localPosition = [0, 0, -10];
    addAvatarComponentInner("body0", "body", body0Mesh, [0, -0.5, 0], 1, colorBlack);
    this.body0.transform.localScale = [1, 1, 0.7];
    addAvatarComponentInner("body1", "body", body1Mesh, [0, 2.7, 0], 1, colorPink);
    this.body1.transform.localScale = [1, 1, 0.7];
    quat.rotateX(this.body1.transform.localRotation, quat.create(), Math.PI);
    addAvatarComponentInner("body2", "body", body2Mesh, [0, 3, 0], 1);
    quat.rotateX(this.body2.transform.localRotation, quat.create(), Math.PI);
    addAvatarComponentInner("body3", "body", body3Mesh, [0, 2.7, 0], 1, colorPink);
    this.body3.transform.localScale = [1, 0.3, 0.7];

    // head
    const headMesh = cs380.Mesh.fromData(cs380.primitives.generateSphere(0.5));
    this.thingsToClear.push(headMesh);
    addAvatarComponent("head", headMesh, [0, 3.5, 0], [0, 0, 0], 2, this.body);
    this.head0.transform.localScale = [0.8, 1, 0.8];

    // leg and arm mesh
    const legMesh = cs380.Mesh.fromData(cs380.primitives.generateCapsule(0.25, 2));
    const armMesh = cs380.Mesh.fromData(cs380.primitives.generateCapsule(0.12, 1.3));
    this.thingsToClear.push(legMesh, armMesh);

    // leg
    addAvatarComponent("legLU", legMesh, [0.3, 0, 0], [0, -1, 0], 3, this.body);
    addAvatarComponent("legRU", legMesh, [-0.3, 0, 0], [0, -1, 0], 4, this.body);
    addAvatarComponent("legLD", legMesh, [0, -2, 0], [0, -1, 0], 5, this.legLU);
    addAvatarComponent("legRD", legMesh, [0, -2, 0], [0, -1, 0], 6, this.legRU);

    // arm
    addAvatarComponent("armLU", armMesh, [0.68, 2.7, 0], [0, -0.65, 0], 7, this.body);
    addAvatarComponent("armRU", armMesh, [-0.68, 2.7, 0], [0, -0.65, 0], 8, this.body);
    addAvatarComponent("armLD", armMesh, [0, -1.3, 0], [0, -0.65, 0], 9, this.armLU);
    addAvatarComponent("armRD", armMesh, [0, -1.3, 0], [0, -0.65, 0], 10, this.armRU);
    quat.rotateZ(this.armLU.transform.localRotation, quat.create(), Math.atan(0.25));
    quat.rotateZ(this.armRU.transform.localRotation, quat.create(), Math.atan(-0.25));

    // hand and finger mesh
    const handMesh0 = cs380.Mesh.fromData(cs380.primitives.generateCube(0.18, 0.15, 0.06));
    const handMesh1 = cs380.Mesh.fromData(cs380.primitives.generateCylinder(0.03, 0.15));
    const handMesh23 = cs380.Mesh.fromData(cs380.primitives.generateSphere(0.03));
    const handMesh45 = cs380.Mesh.fromData(
      cs380.primitives.generateCube(0.12 * 0.9578, 0.2 / 0.9578 + 0.06, 0.06)
    );
    const handMesh67 = cs380.Mesh.fromData(cs380.primitives.generateCylinder(0.03, 0.2 / 0.9578));
    const fingerMesh3 = cs380.Mesh.fromData(cs380.primitives.generateCapsule(0.03, 0.12));
    const fingerMesh4 = cs380.Mesh.fromData(cs380.primitives.generateCapsule(0.03, 0.1));
    const fingerMesh5 = cs380.Mesh.fromData(cs380.primitives.generateCapsule(0.03, 0.08));
    this.thingsToClear.push(
      handMesh0,
      handMesh1,
      handMesh23,
      handMesh45,
      handMesh67,
      fingerMesh3,
      fingerMesh4,
      fingerMesh5
    );

    // left hand
    addAvatarComponent("handL", handMesh0, [0, -1.3, 0], [0.03, -0.275, 0], 11, this.armLD);
    addAvatarComponentInner("handL1", "handL", handMesh1, [0.03 + 0.09, -0.275, 0], 11);
    addAvatarComponentInner("handL2", "handL", handMesh1, [0.03 - 0.09, -0.275, 0], 11);
    addAvatarComponentInner("handL3", "handL", handMesh23, [0.12, -0.2, 0], 11);
    addAvatarComponentInner("handL4", "handL", handMesh45, [0.03, -0.1, 0], 11);
    quat.rotateZ(this.handL4.transform.localRotation, quat.create(), Math.atan(0.3));
    addAvatarComponentInner("handL5", "handL", handMesh45, [-0.03, -0.1, 0], 11);
    quat.rotateZ(this.handL5.transform.localRotation, quat.create(), Math.atan(-0.3));
    addAvatarComponentInner("handL6", "handL", handMesh67, [0.09, -0.1, 0], 11);
    quat.rotateZ(this.handL6.transform.localRotation, quat.create(), Math.atan(0.3));
    addAvatarComponentInner("handL7", "handL", handMesh67, [-0.09, -0.1, 0], 11);
    quat.rotateZ(this.handL7.transform.localRotation, quat.create(), Math.atan(-0.3));
    addAvatarComponent("fingerL10", fingerMesh4, [-0.12, -0.2, 0], [0, -0.05, 0], 11, this.handL);
    addAvatarComponent("fingerL11", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 11, this.fingerL10);
    addAvatarComponent("fingerL20", fingerMesh4, [-0.06, -0.35, 0], [0, -0.05, 0], 11, this.handL);
    addAvatarComponent("fingerL21", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 11, this.fingerL20);
    addAvatarComponent("fingerL22", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 11, this.fingerL21);
    addAvatarComponent("fingerL30", fingerMesh3, [0, -0.35, 0], [0, -0.06, 0], 11, this.handL);
    addAvatarComponent("fingerL31", fingerMesh3, [0, -0.12, 0], [0, -0.06, 0], 11, this.fingerL30);
    addAvatarComponent("fingerL32", fingerMesh3, [0, -0.12, 0], [0, -0.06, 0], 11, this.fingerL31);
    addAvatarComponent("fingerL40", fingerMesh4, [0.06, -0.35, 0], [0, -0.05, 0], 11, this.handL);
    addAvatarComponent("fingerL41", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 11, this.fingerL40);
    addAvatarComponent("fingerL42", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 11, this.fingerL41);
    addAvatarComponent("fingerL50", fingerMesh5, [0.12, -0.35, 0], [0, -0.04, 0], 11, this.handL);
    addAvatarComponent("fingerL51", fingerMesh5, [0, -0.08, 0], [0, -0.04, 0], 11, this.fingerL50);
    addAvatarComponent("fingerL52", fingerMesh5, [0, -0.08, 0], [0, -0.04, 0], 11, this.fingerL51);

    // right hand
    addAvatarComponent("handR", handMesh0, [0, -1.3, 0], [-0.03, -0.275, 0], 12, this.armRD);
    addAvatarComponentInner("handR1", "handR", handMesh1, [-0.03 + 0.09, -0.275, 0], 12);
    addAvatarComponentInner("handR2", "handR", handMesh1, [-0.03 - 0.09, -0.275, 0], 12);
    addAvatarComponentInner("handR3", "handR", handMesh23, [-0.12, -0.2, 0], 12);
    addAvatarComponentInner("handR4", "handR", handMesh45, [0.03, -0.1, 0], 12);
    quat.rotateZ(this.handR4.transform.localRotation, quat.create(), Math.atan(0.3));
    addAvatarComponentInner("handR5", "handR", handMesh45, [-0.03, -0.1, 0], 12);
    quat.rotateZ(this.handR5.transform.localRotation, quat.create(), Math.atan(-0.3));
    addAvatarComponentInner("handR6", "handR", handMesh67, [0.09, -0.1, 0], 12);
    quat.rotateZ(this.handR6.transform.localRotation, quat.create(), Math.atan(0.3));
    addAvatarComponentInner("handR7", "handR", handMesh67, [-0.09, -0.1, 0], 12);
    quat.rotateZ(this.handR7.transform.localRotation, quat.create(), Math.atan(-0.3));
    addAvatarComponent("fingerR10", fingerMesh4, [0.12, -0.2, 0], [0, -0.05, 0], 12, this.handR);
    addAvatarComponent("fingerR11", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 12, this.fingerR10);
    addAvatarComponent("fingerR20", fingerMesh4, [0.06, -0.35, 0], [0, -0.05, 0], 12, this.handR);
    addAvatarComponent("fingerR21", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 12, this.fingerR20);
    addAvatarComponent("fingerR22", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 12, this.fingerR21);
    addAvatarComponent("fingerR30", fingerMesh3, [0, -0.35, 0], [0, -0.06, 0], 12, this.handR);
    addAvatarComponent("fingerR31", fingerMesh3, [0, -0.12, 0], [0, -0.06, 0], 12, this.fingerR30);
    addAvatarComponent("fingerR32", fingerMesh3, [0, -0.12, 0], [0, -0.06, 0], 12, this.fingerR31);
    addAvatarComponent("fingerR40", fingerMesh4, [-0.06, -0.35, 0], [0, -0.05, 0], 12, this.handR);
    addAvatarComponent("fingerR41", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 12, this.fingerR40);
    addAvatarComponent("fingerR42", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 12, this.fingerR41);
    addAvatarComponent("fingerR50", fingerMesh5, [-0.12, -0.35, 0], [0, -0.04, 0], 12, this.handR);
    addAvatarComponent("fingerR51", fingerMesh5, [0, -0.08, 0], [0, -0.04, 0], 12, this.fingerR50);
    addAvatarComponent("fingerR52", fingerMesh5, [0, -0.08, 0], [0, -0.04, 0], 12, this.fingerR51);

    // 포즈 연습
    quat.rotateZ(this.armRU.transform.localRotation, quat.create(), -Math.PI / 2);
    quat.rotateZ(this.armRD.transform.localRotation, quat.create(), -Math.PI / 2);
    quat.rotateZ(this.armLU.transform.localRotation, quat.create(), 0);
    quat.rotateX(this.armLU.transform.localRotation, quat.create(), -Math.PI / 6);
    quat.rotateX(this.armLD.transform.localRotation, quat.create(), (-Math.PI / 6) * 4);
    quat.rotateX(this.handL.transform.localRotation, quat.create(), -Math.PI / 6);
    this.rotate(this.fingerL30, 90, 0, 0);
    this.rotate(this.fingerL31, 90, 0, 0);
    this.rotate(this.fingerL40, 90, 0, 0);
    this.rotate(this.fingerL41, 90, 0, 0);
    this.rotate(this.fingerR30, -90, 0, 0);
    this.rotate(this.fingerR31, -90, 0, 0);
    this.rotate(this.fingerR40, -90, 0, 0);
    this.rotate(this.fingerR41, -90, 0, 0);
    this.rotate(this.legRU, -90, 15, 0);
    this.rotate(this.legRD, 105, 0, 0);

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
    if (key == "a") this.body.transform.localPosition[0] += -0.5;
    if (key == "d") this.body.transform.localPosition[0] += 0.5;
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
