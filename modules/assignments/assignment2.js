import gl from "../gl.js";
import { vec3, mat4, quat, glMatrix } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import { SimpleShader } from "../simple_shader.js";
import {
  generateCapsule,
  generateCone,
  generateCube,
  generateCylinder,
  generateHemisphere,
  generateQuaterSphere,
  generatePlane,
  generateSphere,
} from "../cs380/primitives.js";

import * as pose from "./assignment2_pose.js";

export default class Assignment2 extends cs380.BaseApp {
  async initialize() {
    // Basic setup for camera
    const { width, height } = gl.canvas.getBoundingClientRect();
    const aspectRatio = width / height;
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 0, 15);
    mat4.perspective(this.camera.projectionMatrix, glMatrix.toRadian(45), aspectRatio, 0.01, 100);

    // things to finalize()
    this.thingsToClear = [];

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
    const bgPlane = cs380.Mesh.fromData(generatePlane(64, 64));
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
    addBackgroundComponent("bgD", 0, -5, 0);
    quat.rotateX(this.bgD.transform.localRotation, quat.create(), Math.PI / 2);

    // stage
    const stageMesh = cs380.Mesh.fromData(cs380.primitives.generateCube(2, 1.4, 2));
    this.thingsToClear.push(stageMesh);
    this.stage = new cs380.RenderObject(stageMesh, simpleShader);
    this.stage.transform.localPosition = [0, -5, 0];
    this.bgList.push(this.stage);

    // cube
    this.cubeList = [];
    const cubeMesh = cs380.Mesh.fromData(cs380.primitives.generateCube(3, 3, 3));
    this.thingsToClear.push(cubeMesh);
    this.cube = new cs380.RenderObject(cubeMesh, simpleShader);
    this.cube.transform.localPosition = [5, 0, 0];
    this.cubeList.push(this.cube);

    const tileMesh = cs380.Mesh.fromData(cs380.primitives.generateCube(0.9, 0.9, 0.1));
    this.thingsToClear.push(tileMesh);
    this.tileR = new cs380.PickableObject(tileMesh, simpleShader, pickingShader, 101);

    // Avatar (pickable)
    this.avatarList = [];
    const colorBlack = [0, 0, 0];
    const colorBlue = [64, 64, 255].map((i) => i / 255);
    const colorSkin = [255, 227, 181].map((i) => i / 255);
    const colorGray = [0.2, 0.2, 0.2];

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
    const body0Mesh = cs380.Mesh.fromData(generateCone(1, 4));
    const body1Mesh = cs380.Mesh.fromData(generateCone(0.8, 3.2));
    const body2Mesh = cs380.Mesh.fromData(generateCylinder(0.15, 1));
    const body3Mesh = cs380.Mesh.fromData(generateSphere(0.8));
    this.thingsToClear.push(bodyMesh, body0Mesh, body1Mesh, body2Mesh, body3Mesh);

    // body
    this.body = new cs380.RenderObject(bodyMesh, simpleShader);
    this.body.transform.localPosition = [0, 0, 0];
    addAvatarComponentInner("body0", "body", bodyMesh, [0, 0, 0], 1);
    addAvatarComponentInner("body00", "body", body0Mesh, [0, -0.5, 0], 1, colorBlack);
    this.body00.transform.localScale = [1, 1, 0.7];
    addAvatarComponentInner("body01", "body0", body1Mesh, [0, 2.7, 0], 1, colorBlue);
    this.body01.transform.localScale = [1, 1, 0.7];
    quat.rotateX(this.body01.transform.localRotation, quat.create(), Math.PI);
    addAvatarComponentInner("body02", "body0", body2Mesh, [0, 3, 0], 1);
    quat.rotateX(this.body02.transform.localRotation, quat.create(), Math.PI);
    addAvatarComponentInner("body03", "body0", body3Mesh, [0, 2.7, 0], 1, colorBlue);
    this.body03.transform.localScale = [1, 0.3, 0.7];

    // head
    const headMesh = new cs380.Mesh();
    const head0Mesh = cs380.Mesh.fromData(generateSphere(0.5));
    const head1Mesh = cs380.Mesh.fromData(generateHemisphere(0.51));
    const head4Mesh = cs380.Mesh.fromData(generateCube(0.1, 0.1, 0.1));
    this.thingsToClear.push(headMesh, head0Mesh);
    addAvatarComponent("head", headMesh, [0, 3.5, 0], [0, 0, 0], 2, this.body);
    addAvatarComponentInner("head0", "head", headMesh, [0, 0, 0], 2);
    addAvatarComponentInner("head00", "head0", head0Mesh, [0, 0, 0], 2);
    // addAvatarComponentInner("head01", "head0", head1Mesh, [0, 0, 0], 2, colorBlack);
    addAvatarComponentInner("head02", "head0", head1Mesh, [0, 0, 0], 2, colorBlack);
    addAvatarComponentInner("head03", "head0", head1Mesh, [0, 0, 0], 2, colorBlack);
    addAvatarComponentInner("head04", "head0", head4Mesh, [-0.2, 0, 0.43], 2, colorBlack);
    addAvatarComponentInner("head05", "head0", head4Mesh, [0.2, 0, 0.43], 2, colorBlack);
    this.head0.transform.localScale = [0.8, 1, 0.8];
    // this.head01.transform.localRotation = quat.fromEuler(quat.create(), -45, 0, 0);
    this.head02.transform.localRotation = quat.fromEuler(quat.create(), -45, 45, 0);
    this.head03.transform.localRotation = quat.fromEuler(quat.create(), -45, -45, 0);
    this.head04.transform.localRotation = quat.fromEuler(quat.create(), 0, 180, 0);
    this.head05.transform.localRotation = quat.fromEuler(quat.create(), 0, 180, 0);
    this.head04.transform.localScale = [1.25, 1, 1.25];
    this.head05.transform.localScale = [1.25, 1, 1.25];

    // leg and arm mesh
    const legMesh = cs380.Mesh.fromData(generateCapsule(0.25, 2));
    const armMesh = cs380.Mesh.fromData(generateCapsule(0.15, 1.3));
    const footMesh = new cs380.Mesh();
    const foot01Mesh = cs380.Mesh.fromData(generateQuaterSphere(0.3));
    this.thingsToClear.push(legMesh, armMesh, footMesh, foot01Mesh);

    // leg
    addAvatarComponent("legLU", legMesh, [0.3, 0, 0], [0, -1, 0], 3, this.body);
    addAvatarComponent("legRU", legMesh, [-0.3, 0, 0], [0, -1, 0], 4, this.body);
    addAvatarComponent("legLD", legMesh, [0, -2, 0], [0, -1, 0], 5, this.legLU);
    addAvatarComponent("legRD", legMesh, [0, -2, 0], [0, -1, 0], 6, this.legRU);
    addAvatarComponent("footL", footMesh, [0, -2, 0], [0, -0.3, 0], 7, this.legLD);
    addAvatarComponentInner("footL00", "footL0", foot01Mesh, [0, 0, 0], 7, colorGray);
    addAvatarComponentInner("footL01", "footL0", foot01Mesh, [0, 0, 0], 7, colorGray);
    this.footL00.transform.localScale = [1, 1.2, 1];
    this.footL01.transform.localScale = [1, 1.2, 2];
    this.footL01.transform.localRotation = quat.fromEuler(quat.create(), 0, 180, 0);
    addAvatarComponent("footR", footMesh, [0, -2, 0], [0, -0.3, 0], 8, this.legRD);
    addAvatarComponentInner("footR00", "footR0", foot01Mesh, [0, 0, 0], 8, colorGray);
    addAvatarComponentInner("footR01", "footR0", foot01Mesh, [0, 0, 0], 8, colorGray);
    this.footR00.transform.localScale = [1, 1.2, 1];
    this.footR01.transform.localScale = [1, 1.2, 2];
    this.footR01.transform.localRotation = quat.fromEuler(quat.create(), 0, 180, 0);

    // arm
    addAvatarComponent("armLU", armMesh, [0.66, 2.66, 0], [0, -0.65, 0], 9, this.body);
    addAvatarComponent("armRU", armMesh, [-0.66, 2.66, 0], [0, -0.65, 0], 10, this.body);
    addAvatarComponent("armLD", armMesh, [0, -1.3, 0], [0, -0.65, 0], 11, this.armLU);
    addAvatarComponent("armRD", armMesh, [0, -1.3, 0], [0, -0.65, 0], 12, this.armRU);

    // hand and finger mesh
    const handMesh0 = cs380.Mesh.fromData(generateCube(0.18, 0.15, 0.06));
    const handMesh1 = cs380.Mesh.fromData(generateCylinder(0.03, 0.15));
    const handMesh23 = cs380.Mesh.fromData(generateSphere(0.03));
    const handMesh45 = cs380.Mesh.fromData(generateCube(0.12 * 0.9578, 0.2 / 0.9578 + 0.06, 0.06));
    const handMesh67 = cs380.Mesh.fromData(generateCylinder(0.03, 0.2 / 0.9578));
    const fingerMesh3 = cs380.Mesh.fromData(generateCapsule(0.03, 0.12));
    const fingerMesh4 = cs380.Mesh.fromData(generateCapsule(0.03, 0.1));
    const fingerMesh5 = cs380.Mesh.fromData(generateCapsule(0.03, 0.08));
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
    addAvatarComponent("handL", handMesh0, [0, -1.3, 0], [0.03, -0.275, 0], 13, this.armLD);
    addAvatarComponentInner("handL1", "handL", handMesh1, [0.03 + 0.09, -0.275, 0], 13);
    addAvatarComponentInner("handL2", "handL", handMesh1, [0.03 - 0.09, -0.275, 0], 13);
    addAvatarComponentInner("handL3", "handL", handMesh23, [0.12, -0.2, 0], 13);
    addAvatarComponentInner("handL4", "handL", handMesh45, [0.03, -0.1, 0], 13);
    quat.rotateZ(this.handL4.transform.localRotation, quat.create(), Math.atan(0.3));
    addAvatarComponentInner("handL5", "handL", handMesh45, [-0.03, -0.1, 0], 13);
    quat.rotateZ(this.handL5.transform.localRotation, quat.create(), Math.atan(-0.3));
    addAvatarComponentInner("handL6", "handL", handMesh67, [0.09, -0.1, 0], 13);
    quat.rotateZ(this.handL6.transform.localRotation, quat.create(), Math.atan(0.3));
    addAvatarComponentInner("handL7", "handL", handMesh67, [-0.09, -0.1, 0], 13);
    quat.rotateZ(this.handL7.transform.localRotation, quat.create(), Math.atan(-0.3));
    addAvatarComponent("fingerL10", fingerMesh4, [-0.12, -0.2, 0], [0, -0.05, 0], 13, this.handL);
    addAvatarComponent("fingerL11", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 13, this.fingerL10);
    addAvatarComponent("fingerL20", fingerMesh4, [-0.06, -0.35, 0], [0, -0.05, 0], 13, this.handL);
    addAvatarComponent("fingerL21", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 13, this.fingerL20);
    addAvatarComponent("fingerL22", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 13, this.fingerL21);
    addAvatarComponent("fingerL30", fingerMesh3, [0, -0.35, 0], [0, -0.06, 0], 13, this.handL);
    addAvatarComponent("fingerL31", fingerMesh3, [0, -0.12, 0], [0, -0.06, 0], 13, this.fingerL30);
    addAvatarComponent("fingerL32", fingerMesh3, [0, -0.12, 0], [0, -0.06, 0], 13, this.fingerL31);
    addAvatarComponent("fingerL40", fingerMesh4, [0.06, -0.35, 0], [0, -0.05, 0], 13, this.handL);
    addAvatarComponent("fingerL41", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 13, this.fingerL40);
    addAvatarComponent("fingerL42", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 13, this.fingerL41);
    addAvatarComponent("fingerL50", fingerMesh5, [0.12, -0.35, 0], [0, -0.04, 0], 13, this.handL);
    addAvatarComponent("fingerL51", fingerMesh5, [0, -0.08, 0], [0, -0.04, 0], 13, this.fingerL50);
    addAvatarComponent("fingerL52", fingerMesh5, [0, -0.08, 0], [0, -0.04, 0], 13, this.fingerL51);

    // right hand
    addAvatarComponent("handR", handMesh0, [0, -1.3, 0], [-0.03, -0.275, 0], 14, this.armRD);
    addAvatarComponentInner("handR1", "handR", handMesh1, [-0.03 + 0.09, -0.275, 0], 14);
    addAvatarComponentInner("handR2", "handR", handMesh1, [-0.03 - 0.09, -0.275, 0], 14);
    addAvatarComponentInner("handR3", "handR", handMesh23, [-0.12, -0.2, 0], 14);
    addAvatarComponentInner("handR4", "handR", handMesh45, [0.03, -0.1, 0], 14);
    quat.rotateZ(this.handR4.transform.localRotation, quat.create(), Math.atan(0.3));
    addAvatarComponentInner("handR5", "handR", handMesh45, [-0.03, -0.1, 0], 14);
    quat.rotateZ(this.handR5.transform.localRotation, quat.create(), Math.atan(-0.3));
    addAvatarComponentInner("handR6", "handR", handMesh67, [0.09, -0.1, 0], 14);
    quat.rotateZ(this.handR6.transform.localRotation, quat.create(), Math.atan(0.3));
    addAvatarComponentInner("handR7", "handR", handMesh67, [-0.09, -0.1, 0], 14);
    quat.rotateZ(this.handR7.transform.localRotation, quat.create(), Math.atan(-0.3));
    addAvatarComponent("fingerR10", fingerMesh4, [0.12, -0.2, 0], [0, -0.05, 0], 14, this.handR);
    addAvatarComponent("fingerR11", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 14, this.fingerR10);
    addAvatarComponent("fingerR20", fingerMesh4, [0.06, -0.35, 0], [0, -0.05, 0], 14, this.handR);
    addAvatarComponent("fingerR21", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 14, this.fingerR20);
    addAvatarComponent("fingerR22", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 14, this.fingerR21);
    addAvatarComponent("fingerR30", fingerMesh3, [0, -0.35, 0], [0, -0.06, 0], 14, this.handR);
    addAvatarComponent("fingerR31", fingerMesh3, [0, -0.12, 0], [0, -0.06, 0], 14, this.fingerR30);
    addAvatarComponent("fingerR32", fingerMesh3, [0, -0.12, 0], [0, -0.06, 0], 14, this.fingerR31);
    addAvatarComponent("fingerR40", fingerMesh4, [-0.06, -0.35, 0], [0, -0.05, 0], 14, this.handR);
    addAvatarComponent("fingerR41", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 14, this.fingerR40);
    addAvatarComponent("fingerR42", fingerMesh4, [0, -0.1, 0], [0, -0.05, 0], 14, this.fingerR41);
    addAvatarComponent("fingerR50", fingerMesh5, [-0.12, -0.35, 0], [0, -0.04, 0], 14, this.handR);
    addAvatarComponent("fingerR51", fingerMesh5, [0, -0.08, 0], [0, -0.04, 0], 14, this.fingerR50);
    addAvatarComponent("fingerR52", fingerMesh5, [0, -0.08, 0], [0, -0.04, 0], 14, this.fingerR51);

    // default pose
    this.currPose = pose.idle;
    this.setBodyPivot();
    this.setPose(this.currPose);

    // arcball setting
    this.arcballTarget = this.cube;

    // Event listener for interactions
    this.handleKeyDown = (e) => {
      // e.repeat is true when the key has been helded for a while
      if (e.repeat) return;
      this.onKeyDown(e.key);
    };
    this.handleKeyUp = (e) => {
      this.onKeyUp(e.key);
    };
    this.handleMouseDown = (e) => {
      // e.button = 0 if it is left mouse button
      if (e.button !== 0) return;
      this.onMouseDown(e);
    };
    this.handleMouseUp = (e) => {
      if (e.button !== 0) return;
      this.onMouseUp(e);
    };
    this.handleMouseMove = (e) => {
      if (e.button !== 0) return;
      this.onMouseMove(e);
    };
    this.mousePressed = false;

    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
    gl.canvas.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("mouseup", this.handleMouseUp);
    gl.canvas.addEventListener("mousemove", this.handleMouseMove);

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
    if (key == "0") this.arcballTarget.transform.localRotation = [0, 0, 0, 1];
    if (this.nextPoseList.length > 0) return;
    if (key == "1") {
      this.setBodyPivot();
      this.nextPoseList.push({ pose: pose.hello1, interval: 0.5, lerpFunc: this.lerpLinear });
    }
    if (key == "2") {
      this.setLegLDPivot();
      this.nextPoseList.push({ pose: pose.hello2, interval: 0.5, lerpFunc: this.lerpLinear });
    }
  }

  onKeyUp(key) {
    console.log(`key up: ${key}`);
    if (this.nextPoseList.length > 1) return;
    if (key == "1") {
      this.nextPoseList.push({ pose: pose.idle, interval: 0.5, lerpFunc: this.lerpLinear });
    }
    if (key == "2") {
      this.nextPoseList.push({ pose: pose.idle, interval: 0.5, lerpFunc: this.lerpLinear });
    }
  }

  xy2ArcballVec(x, y) {
    var z = Math.sqrt(1 - x * x - y * y);
    if (x * x + y * y >= 1) {
      var magnitude = x * x + y * y;
      x /= magnitude;
      y /= magnitude;
      z = -Math.sqrt(1 - x * x - y * y);
    }
    return vec3.normalize(vec3.create(), [x, y, z]);
  }

  onMouseDown(e) {
    const { left, bottom } = gl.canvas.getBoundingClientRect();
    const x = e.clientX - left;
    const y = bottom - e.clientY;

    // Object with this index has just picked
    const index = this.pickingBuffer.pick(x, y);

    console.log(`onMouseDown() got index ${index}`);
    this.mousePressed = true;

    console.log(x, y);

    var x0 = (e.clientX - left - 400) / 300;
    var y0 = (bottom - e.clientY - 400) / 300;
    this.prevArcballVector = this.xy2ArcballVec(x0, y0);

    if (this.nextPoseList.length > 0) return;
    if (index == 1) {
      this.setLegLDPivot();
      this.nextPoseList.push(
        { pose: pose.jumpReady, interval: 0.5, lerpFunc: this.lerpLinear },
        { pose: pose.jump, interval: 0.5, lerpFunc: this.lerpQuadratic2 },
        { pose: pose.jumpReady, interval: 0.5, lerpFunc: this.lerpQuadratic1 },
        { pose: pose.idle, interval: 0.5, lerpFunc: this.lerpLinear }
      );
    }
  }

  onMouseUp(e) {
    this.mousePressed = false;
  }

  // arcball
  onMouseMove(e) {
    if (!this.mousePressed) return;

    // x, y: value of -400 ~ 400
    // my ball: radius of 300
    const { left, bottom } = gl.canvas.getBoundingClientRect();

    var x = (e.clientX - left - 400) / 300;
    var y = (bottom - e.clientY - 400) / 300;
    var v = this.xy2ArcballVec(x, y);
    var v0 = this.prevArcballVector;

    var n = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), v0, v));
    var angle = vec3.angle(v0, v);

    var q = quat.setAxisAngle(quat.create(), n, angle);
    var q0 = quat.clone(this.arcballTarget.transform.localRotation);
    var q_ = quat.mul(quat.create(), q, q0);
    this.arcballTarget.transform.localRotation = quat.mul(quat.create(), q, q0);

    this.prevArcballVector = v;
  }

  finalize() {
    // Finalize WebGL objects (mesh, shader, texture, ...)
    document.removeEventListener("keydown", this.handleKeyDown);
    gl.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.thingsToClear.forEach((it) => it.finalize());
  }

  update(elapsed, dt) {
    // Updates before rendering here
    // this.simpleOrbitControl.update(dt);

    // change pose
    if (this.nextPoseList.length > 0) {
      const nextPose = this.nextPoseList[0].pose;
      const interval = this.nextPoseList[0].interval;
      const lerpFunc = this.nextPoseList[0].lerpFunc;
      if (this.changePoseTime >= interval) {
        this.setPose(nextPose);
        this.currPose = nextPose;
        this.nextPoseList.shift();
        this.changePoseTime = 0;
      } else {
        this.changePoseTime += dt;
        this[this.currPivot].transform.localPosition = vec3.lerp(
          vec3.create(),
          this.currPose.position[this.currPivot],
          nextPose.position[this.currPivot],
          lerpFunc(this.changePoseTime / interval)
        );
        for (const part in this.currPose.rotation) {
          this[part].transform.localRotation = quat.slerp(
            quat.create(),
            quat.fromEuler(quat.create(), ...this.currPose.rotation[part]),
            quat.fromEuler(quat.create(), ...nextPose.rotation[part]),
            lerpFunc(this.changePoseTime / interval)
          );
        }
        this.camera.transform.localPosition = vec3.lerp(
          vec3.create(),
          this.currPose.camera.position,
          nextPose.camera.position,
          lerpFunc(this.changePoseTime / interval)
        );
        this.camera.transform.localRotation = quat.slerp(
          quat.create(),
          quat.fromEuler(quat.create(), ...this.currPose.camera.rotation),
          quat.fromEuler(quat.create(), ...nextPose.camera.rotation),
          lerpFunc(this.changePoseTime / interval)
        );
      }
    }

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
    this.cubeList.forEach((i) => i.render(this.camera));
  }

  setBodyPivot() {
    this.currPivot = "body";
    this.body.transform.setParent(null);
    this.body.transform.localPosition = [0, 0, 0];
    this.body0.transform.localPosition = [0, 0, 0];
    this.legLU.transform.setParent(this.body.transform);
    this.legLU.transform.localPosition = [0.3, 0, 0];
    this.legLU0.transform.localPosition = [0, -1, 0];
    this.footL.transform.localPosition = [0, -2, 0];
    this.legLD.transform.setParent(this.legLU.transform);
    this.legLD.transform.localPosition = [0, -2, 0];
    this.legLD0.transform.localPosition = [0, -1, 0];
  }

  setLegLDPivot() {
    this.currPivot = "legLD";
    this.legLD.transform.setParent(null);
    this.legLD.transform.localPosition = [0.3, -4, 0];
    this.legLD0.transform.localPosition = [0, 1, 0];
    this.footL.transform.localPosition = [0, 0, 0];
    this.legLU.transform.setParent(this.legLD.transform);
    this.legLU.transform.localPosition = [0, 2, 0];
    this.legLU0.transform.localPosition = [0, 1, 0];
    this.body.transform.setParent(this.legLU.transform);
    this.body.transform.localPosition = [-0.3, 2, 0];
    this.body0.transform.localPosition = [0, 0, 0];
  }

  setPose(poseData) {
    this[this.currPivot].transform.localPosition = poseData.position[this.currPivot];
    for (const part in poseData.rotation) {
      this[part].transform.localRotation = quat.fromEuler(
        quat.create(),
        ...poseData.rotation[part]
      );
    }
    this.camera.transform.localPosition = poseData.camera.position;
    this.camera.transform.localRotation = quat.fromEuler(
      quat.create(),
      ...poseData.camera.rotation
    );
  }

  lerpLinear(x) {
    return x;
  }

  lerpQuadratic1(x) {
    return x * x;
  }

  lerpQuadratic2(x) {
    return -x * x + 2 * x;
  }

  currPivot;
  currPose;
  nextPoseList = [];
  intervalList = [];
  lerpFuncList = [];
  changePoseTime = 0;
  arcballTarget;
}
