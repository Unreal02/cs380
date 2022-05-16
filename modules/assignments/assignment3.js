import gl from "../gl.js";
import { vec3, mat4, quat, glMatrix } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import { LightType, Light } from "../blinn_phong.js";
import { Material, MyShader } from "../my.js";
import {
  generateCapsule,
  generateCone,
  generateCube,
  generateCylinder,
  generateHemisphere,
  generateQuarterSphere,
  generatePlane,
  generateSphere,
  generateUpperBody,
} from "../cs380/primitives.js";

import * as pose from "./assignment2_pose.js";

export default class Assignment3 extends cs380.BaseApp {
  async initialize() {
    // Basic setup for camera
    const { width, height } = gl.canvas.getBoundingClientRect();
    const aspectRatio = width / height;
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 0, 20);
    mat4.perspective(this.camera.projectionMatrix, glMatrix.toRadian(45), aspectRatio, 0.01, 100);

    // things to finalize()
    this.thingsToClear = [];

    // SimpleOrbitControl
    const orbitControlCenter = vec3.fromValues(0, 0, 0);
    this.simpleOrbitControl = new cs380.utils.SimpleOrbitControl(this.camera, orbitControlCenter);
    this.thingsToClear.push(this.simpleOrbitControl);

    // initialize picking shader & buffer
    const myShader = await cs380.buildShader(MyShader);
    const pickingShader = await cs380.buildShader(cs380.PickingShader);
    this.pickingBuffer = new cs380.PickingBuffer();
    this.pickingBuffer.initialize(width, height);
    this.thingsToClear.push(myShader, pickingShader, this.pickingBuffer);

    // initialize light sources
    this.lights = [];

    const light0 = new Light();
    light0.illuminance = [0.1, 0.1, 0.1];
    light0.type = LightType.AMBIENT;
    this.lights.push(light0);

    const light1 = new Light();
    light1.illuminance = [1, 1, 1];
    light1.transform.localRotation = quat.fromEuler(quat.create(), 90, 0, 0);
    light1.type = LightType.SPOTLIGHT;
    light1.transform.localPosition = [0, 10, 0];
    light1.angle = Math.PI / 12;
    this.lights.push(light1);

    const light2 = new Light();
    light2.illuminance = [1, 1, 1];
    light2.type = LightType.POINT;
    this.lights.push(light2);

    const light3 = new Light();
    light3.illuminance = [1, 1, 1];
    light3.type = LightType.POINT;
    this.lights.push(light3);

    // background (not pickable)
    const bgSize = 24;
    const bgMesh = new cs380.Mesh();
    this.background = new cs380.RenderObject(bgMesh, myShader);
    this.background.transform.localPosition = [0, 7.7, 0];
    const bgPlane = cs380.Mesh.fromData(generatePlane(bgSize, bgSize));
    this.thingsToClear.push(bgMesh, bgPlane);
    this.bgList = [];
    const bgMaterial = new Material();
    bgMaterial.shininess = 300;

    // add background component
    const addBackgroundComponent = (name, size, pos, color) => {
      this[name] = new cs380.RenderObject(bgPlane, myShader);
      this[name].transform.setParent(this.background.transform);
      this[name].transform.localPosition = pos;
      this[name].transform.localScale = size;
      this[name].uniforms.mainColor = [1, 1, 1];
      this[name].uniforms.material = bgMaterial;
      this.bgList.push(this[name]);
    };

    // background
    addBackgroundComponent("bgB", [1, 1, 1], [0, 0, -bgSize / 2]);
    quat.rotateX(this.bgB.transform.localRotation, quat.create(), Math.PI);
    addBackgroundComponent("bgL", [1, 1, 1], [-bgSize / 2, 0, 0]);
    quat.rotateY(this.bgL.transform.localRotation, quat.create(), -Math.PI / 2);
    addBackgroundComponent("bgR", [1, 1, 1], [bgSize / 2, 0, 0]);
    quat.rotateY(this.bgR.transform.localRotation, quat.create(), Math.PI / 2);
    addBackgroundComponent("bgD", [1, 1, 1], [0, -bgSize / 2, 0]);
    quat.rotateX(this.bgD.transform.localRotation, quat.create(), Math.PI / 2);

    // Avatar (pickable)
    this.avatarList = [];
    const materialSkin = new Material();
    materialSkin.setColor([255, 227, 181].map((i) => i / 255));
    materialSkin.specularColor = [0, 0, 0];
    const materialBlack = new Material();
    materialBlack.setColor([0, 0, 0]);
    materialBlack.specularColor = [0.3, 0.3, 0.3];
    materialBlack.shininess = 100;
    const materialBlackMatte = new Material();
    materialBlackMatte.setColor([0, 0, 0]);
    const materialBlue = new Material();
    materialBlue.setColor([0.25, 0.25, 1]);
    materialBlue.specularColor = [0, 0, 0];
    const materialGray = new Material();
    materialGray.setColor([0.2, 0.2, 0.2]);
    materialGray.specularColor = [1, 1, 1];
    materialGray.shininess = 300;

    // avatar
    const avatarMesh = new cs380.Mesh();
    this.thingsToClear.push(avatarMesh);
    this.avatar = new cs380.RenderObject(avatarMesh, myShader);

    // add avatar inner component
    const addAvatarComponentInner = (
      innerName,
      name,
      mesh,
      innerPos,
      index,
      material = materialSkin
    ) => {
      this[innerName] = new cs380.PickableObject(mesh, myShader, pickingShader, index);
      this[innerName].transform.localPosition = innerPos;
      this[innerName].transform.setParent(this[name].transform);
      this.avatarList.push(this[innerName]);
      this[innerName].uniforms.material = material;
    };

    // add avatar component
    const addAvatarComponent = (name, mesh, pos, innerPos, index, parent, material) => {
      const m = new cs380.Mesh();
      this[name] = new cs380.RenderObject(m, myShader);
      this[name].transform.localPosition = pos;
      this[name].transform.setParent(parent.transform);
      this.thingsToClear.push(m);

      const innerName = name + "0";
      addAvatarComponentInner(innerName, name, mesh, innerPos, index, material);
    };

    // body mesh
    const bodyMesh = new cs380.Mesh();
    const body0Mesh = cs380.Mesh.fromData(generateCone(1, 4));
    const body1Mesh = cs380.Mesh.fromData(generateUpperBody());
    const body2Mesh = cs380.Mesh.fromData(generateHemisphere(0.8));
    const neckMesh = cs380.Mesh.fromData(generateCylinder(0.15, 1));
    this.thingsToClear.push(bodyMesh, body0Mesh, body1Mesh, neckMesh, body2Mesh);

    // body
    this.body = new cs380.RenderObject(bodyMesh, myShader);
    this.body.transform.localPosition = [0, 0, 0];
    this.body.transform.setParent(this.avatar.transform);
    addAvatarComponentInner("body0", "body", bodyMesh, [0, 0, 0], 1);
    addAvatarComponentInner("body00", "body0", body0Mesh, [0, -0.5, 0], 1, materialBlack);
    this.body00.transform.localScale = [1, 1, 0.7];
    addAvatarComponentInner("body01", "body0", body1Mesh, [0, 1.5, 0], 1, materialBlue);
    addAvatarComponentInner("body02", "body0", body2Mesh, [0, 2.7, 0], 1, materialBlue);
    this.body02.transform.localScale = [1, 0.3, 0.5];
    addAvatarComponentInner("neck", "body0", neckMesh, [0, 3, 0], 1);

    // head
    const headMesh = new cs380.Mesh();
    const head0Mesh = cs380.Mesh.fromData(generateSphere(0.5));
    const hairMesh = cs380.Mesh.fromData(generateHemisphere(0.55));
    const eyeMesh = cs380.Mesh.fromData(generateCube(0.12, 0.15, 0.1));
    this.thingsToClear.push(headMesh, head0Mesh);
    addAvatarComponent("head", headMesh, [0, 3.5, 0], [0, 0, 0], 2, this.body);
    addAvatarComponentInner("head0", "head", headMesh, [0, 0, 0], 2);
    addAvatarComponentInner("head00", "head0", head0Mesh, [0, 0, 0], 2);
    addAvatarComponentInner("hair0", "head0", hairMesh, [0, 0, 0], 2, materialBlack);
    addAvatarComponentInner("hair1", "head0", hairMesh, [0, 0, 0], 2, materialBlack);
    addAvatarComponentInner("eye0", "head0", eyeMesh, [-0.2, 0, 0.43], 2, materialBlackMatte);
    addAvatarComponentInner("eye1", "head0", eyeMesh, [0.2, 0, 0.43], 2, materialBlackMatte);
    this.head0.transform.localScale = [0.8, 1, 0.8];
    this.hair0.transform.localRotation = quat.fromEuler(quat.create(), -45, 45, 0);
    this.hair1.transform.localRotation = quat.fromEuler(quat.create(), -45, -45, 0);
    this.eye0.transform.localRotation = quat.fromEuler(quat.create(), 0, 180, 0);
    this.eye1.transform.localRotation = quat.fromEuler(quat.create(), 0, 180, 0);

    // leg and arm mesh
    const legMesh = cs380.Mesh.fromData(generateCapsule(0.25, 2));
    const armMesh = cs380.Mesh.fromData(generateCapsule(0.14, 1.3));
    const footMesh = new cs380.Mesh();
    const foot01Mesh = cs380.Mesh.fromData(generateQuarterSphere(0.3));
    this.thingsToClear.push(legMesh, armMesh, footMesh, foot01Mesh);

    // leg
    addAvatarComponent("legLU", legMesh, [0.3, 0, 0], [0, -1, 0], 3, this.body);
    addAvatarComponent("legRU", legMesh, [-0.3, 0, 0], [0, -1, 0], 4, this.body);
    addAvatarComponent("legLD", legMesh, [0, -2, 0], [0, -1, 0], 5, this.legLU);
    addAvatarComponent("legRD", legMesh, [0, -2, 0], [0, -1, 0], 6, this.legRU);
    addAvatarComponent("footL", footMesh, [0, -2, 0], [0, -0.3, 0], 7, this.legLD);
    addAvatarComponentInner("footL00", "footL0", foot01Mesh, [0, 0, 0], 7, materialGray);
    addAvatarComponentInner("footL01", "footL0", foot01Mesh, [0, 0, 0], 7, materialGray);
    this.footL00.transform.localScale = [1, 1.2, 1];
    this.footL01.transform.localScale = [1, 1.2, 2];
    this.footL01.transform.localRotation = quat.fromEuler(quat.create(), 0, 180, 0);
    addAvatarComponent("footR", footMesh, [0, -2, 0], [0, -0.3, 0], 8, this.legRD);
    addAvatarComponentInner("footR00", "footR0", foot01Mesh, [0, 0, 0], 8, materialGray);
    addAvatarComponentInner("footR01", "footR0", foot01Mesh, [0, 0, 0], 8, materialGray);
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

    // apply lights
    this.bgList.forEach((i) => (i.uniforms.lights = this.lights));
    this.avatarList.forEach((i) => (i.uniforms.lights = this.lights));

    // pose
    this.setPose(pose.idle);

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
        <li>Implement point light, and spotlight [2 pts]</li>
        <li>Update the implementation to support colored (RGB) light [1 pts]</li>
        <li>Update the implementation to support materials (reflection coefficients, shineness) [2 pts] </li>
        <li>Show some creativity in your scene [1 pts]</li>
      </ul>
      Import at least two models to show material differnece <br/>
      Use your creativity (animation, interaction, etc.) to make each light source is recognized respectively. <br/>
      <strong>Start early!</strong>
    `;

    // GL settings
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
  }

  onKeyDown(key) {
    console.log(`key down: ${key}`);
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

  setPose(poseData) {
    this.body.transform.localPosition = poseData.position.body;
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
}
