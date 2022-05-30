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
    const light0 = new Light();
    light0.illuminance = [0.1, 0.1, 0.1];
    light0.type = LightType.AMBIENT;

    const light1 = new Light();
    light1.illuminance = [1, 0, 0];
    light1.type = LightType.SPOTLIGHT;
    light1.transform.localPosition = [0, 10, 0];
    light1.transform.localRotation = quat.fromEuler(quat.create(), 90, 0, 0);

    const light2 = new Light();
    light2.illuminance = [0, 1, 0];
    light2.type = LightType.SPOTLIGHT;
    light2.transform.localPosition = [-5, 10, 0];
    light2.transform.lookAt([-4, 10, 0]);

    const light3 = new Light();
    light3.illuminance = [0, 0, 1];
    light3.type = LightType.SPOTLIGHT;
    light3.transform.localPosition = [5, 10, 0];
    light3.transform.lookAt([4, 10, 0]);

    const light4 = new Light();
    light4.illuminance = [10, 10, 10];
    light4.type = LightType.POINT;
    light4.transform.localPosition = [2, 4, 2];

    const light5 = new Light();
    light5.illuminance = [1, 1, 1];
    light5.type = LightType.DIRECTIONAL;
    light5.transform.lookAt([-1, -1, -1]);

    this.lights = [light0, light1, light2, light3, light4, light5];

    // background (not pickable)
    const bgSize = 30;
    const bgMesh = new cs380.Mesh();
    this.background = new cs380.RenderObject(bgMesh, myShader);
    this.background.transform.localPosition = [0, 10.7, 0];
    const bgPlane = cs380.Mesh.fromData(generatePlane(bgSize, bgSize));
    this.thingsToClear.push(bgMesh, bgPlane);
    this.bgList = [];
    const bgMaterial = new Material([1, 1, 1]);
    bgMaterial.shininess = 300;

    // add background component
    const addBackgroundComponent = (name, size, pos, color) => {
      this[name] = new cs380.RenderObject(bgPlane, myShader);
      this[name].transform.setParent(this.background.transform);
      this[name].transform.localPosition = pos;
      this[name].transform.localScale = size;
      this[name].uniforms.material = bgMaterial;
      this.bgList.push(this[name]);
    };

    // background
    addBackgroundComponent("bgF", [1, 1, 1], [0, 0, bgSize / 2]);
    addBackgroundComponent("bgB", [1, 1, 1], [0, 0, -bgSize / 2]);
    quat.rotateX(this.bgB.transform.localRotation, quat.create(), Math.PI);
    addBackgroundComponent("bgL", [1, 1, 1], [-bgSize / 2, 0, 0]);
    quat.rotateY(this.bgL.transform.localRotation, quat.create(), -Math.PI / 2);
    addBackgroundComponent("bgR", [1, 1, 1], [bgSize / 2, 0, 0]);
    quat.rotateY(this.bgR.transform.localRotation, quat.create(), Math.PI / 2);
    addBackgroundComponent("bgD", [1, 1, 1], [0, -bgSize / 2, 0]);
    quat.rotateX(this.bgD.transform.localRotation, quat.create(), Math.PI / 2);

    // cube
    const cubeMaterial = new Material([0, 0, 0]);
    cubeMaterial.specularColor = [1, 1, 1];
    this.cubeList = [];
    const cubeMesh = cs380.Mesh.fromData(cs380.primitives.generateCube(1.5, 1.5, 1.5));
    this.thingsToClear.push(cubeMesh);
    this.cube = new cs380.PickableObject(cubeMesh, myShader, pickingShader, 100);
    this.cube.transform.localPosition = [5, 0, 0];
    this.cube.uniforms.material = cubeMaterial;
    this.cube.uniforms.lights = this.lights;
    this.cubeList.push(this.cube);

    // cube tile
    const tileMesh = cs380.Mesh.fromData(cs380.primitives.generateCube(0.45, 0.45, 0.45));
    this.thingsToClear.push(tileMesh);
    this.cubeTile = {
      F: [],
      B: [],
      U: [],
      D: [],
      L: [],
      R: [],
    };
    for (var face in this.cubeTile) {
      for (var i = 0; i < 3; i++) {
        this.cubeTile[face][i] = [];
        for (var j = 0; j < 3; j++) {
          this.cubeTile[face][i][j] = new cs380.PickableObject(
            tileMesh,
            myShader,
            pickingShader,
            face.charCodeAt(0)
          );
          this.cubeTile[face][i][j].transform.setParent(this.cube.transform);
          this.cubeList.push(this.cubeTile[face][i][j]);
        }
      }
    }
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        this.cubeTile.F[i][j].transform.localPosition = [i - 1, 1 - j, 1.1].map((a) => a / 2);
        this.cubeTile.F[i][j].uniforms.mainColor = [0, 1, 0];
        this.cubeTile.B[i][j].transform.localPosition = [1 - i, 1 - j, -1.1].map((a) => a / 2);
        this.cubeTile.B[i][j].uniforms.mainColor = [0, 0, 1];
        this.cubeTile.U[i][j].transform.localPosition = [j - 1, 1.1, i - 1].map((a) => a / 2);
        this.cubeTile.U[i][j].uniforms.mainColor = [1, 1, 1];
        this.cubeTile.D[i][j].transform.localPosition = [j - 1, -1.1, 1 - i].map((a) => a / 2);
        this.cubeTile.D[i][j].uniforms.mainColor = [1, 1, 0];
        this.cubeTile.L[i][j].transform.localPosition = [-1.1, 1 - i, j - 1].map((a) => a / 2);
        this.cubeTile.L[i][j].uniforms.mainColor = [1, 0.5, 0];
        this.cubeTile.R[i][j].transform.localPosition = [1.1, 1 - i, 1 - j].map((a) => a / 2);
        this.cubeTile.R[i][j].uniforms.mainColor = [1, 0, 0];
      }
    }

    // Avatar (pickable)
    this.avatarList = [];
    const materialSkin = new Material([255, 227, 181].map((i) => i / 255));
    materialSkin.specularColor = [0, 0, 0];
    const materialBlack = new Material([0, 0, 0]);
    materialBlack.specularColor = [0.3, 0.3, 0.3];
    materialBlack.shininess = 100;
    const materialBlue = new Material([0.25, 0.25, 1]);
    materialBlue.specularColor = [0, 0, 0];
    const materialGray = new Material([0.2, 0.2, 0.2]);
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
    addAvatarComponentInner("eye0", "head0", eyeMesh, [-0.18, 0, 0.38], 2, materialBlack);
    addAvatarComponentInner("eye1", "head0", eyeMesh, [0.18, 0, 0.38], 2, materialBlack);
    this.head00.transform.localScale = [0.9, 1, 0.9];
    this.hair0.transform.localRotation = quat.fromEuler(quat.create(), -45, 45, 0);
    this.hair1.transform.localRotation = quat.fromEuler(quat.create(), -45, -45, 0);
    this.eye0.transform.localRotation = quat.fromEuler(quat.create(), 0, -10, 0);
    this.eye1.transform.localRotation = quat.fromEuler(quat.create(), 0, 10, 0);

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
    this.cubeList.forEach((i) => (i.uniforms.lights = this.lights));
    this.avatarList.forEach((i) => (i.uniforms.lights = this.lights));

    // pose
    this.currPose = pose.idle;
    this.setLegLDPivot();
    this.setPose(this.currPose);

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
      <div>
      <input type="range" min=0 max=1 value=0.1 step=0.01 id="light0-illuminance">
      <label for="light0-illuminance">Ambient Light</label>
      </div>
      <div>
      <input type="range" min=0 max=20 value=20 step=0.01 id="light1-illuminance">
      <label for="light1-illuminance">Red Light</label>
      </div>
      <div>
      <input type="range" min=0 max=20 value=20 step=0.01 id="light2-illuminance">
      <label for="light2-illuminance">Green Light</label>
      </div>
      <div>
      <input type="range" min=0 max=20 value=20 step=0.01 id="light3-illuminance">
      <label for="light3-illuminance">Blue Light</label>
      </div>
      <div>
      <input type="range" min=0 max=10 value=10 step=0.1 id="light4-illuminance">
      <label for="light4-illuminance">Point Light</label>
      </div>
      <div>
      <input type="range" min=0 max=1 value=1 step=0.01 id="light5-illuminance">
      <label for="light5-illuminance">Directional Light</label>
      </div>
      <div>
      <label for="toon">Toon shading</label>
      <input type="checkbox" id="toon">
      </div>
      <div>
      <label for="arcball">Rotate Cube</label>
      <input type="checkbox" id="arcball">
      </div>
    `;
    cs380.utils.setInputBehavior("light0-illuminance", (val) => {
      light0.illuminance = [val, val, val];
    });
    cs380.utils.setInputBehavior("light1-illuminance", (val) => {
      light1.illuminance = [val, 0, 0];
    });
    cs380.utils.setInputBehavior("light2-illuminance", (val) => {
      light2.illuminance = [0, val, 0];
    });
    cs380.utils.setInputBehavior("light3-illuminance", (val) => {
      light3.illuminance = [0, 0, val];
    });
    cs380.utils.setInputBehavior("light4-illuminance", (val) => {
      light4.illuminance = [val, val, val];
    });
    cs380.utils.setInputBehavior("light5-illuminance", (val) => {
      light5.illuminance = [val, val, val];
    });
    cs380.utils.setCheckboxBehavior("arcball", (val) => (this.arcballEnabled = val));
    cs380.utils.setCheckboxBehavior("toon", (val) => {
      this.avatarList.forEach((i) => (i.uniforms.material.toon = val));
    });

    // GL settings
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
  }

  onKeyDown(key) {
    console.log(`key down: ${key}`);

    if (this.nextPoseList.length > 0) return;
    if (key == "1") {
      this.setBodyPivot();
      this.nextPoseList.push({
        pose: pose.pose1,
        interval: 0.5,
        lerpFunc: this.poseLerpFunc,
      });
    }
    if (key == "2") {
      this.setLegLDPivot();
      this.nextPoseList.push({
        pose: pose.pose2,
        interval: 0.5,
        lerpFunc: this.poseLerpFunc,
      });
    }
    if (key == "3") {
      this.setLegLDPivot();
      this.nextPoseList.push({
        pose: pose.cheese,
        interval: 0.5,
        lerpFunc: this.poseLerpFunc,
      });
    }
  }

  onKeyUp(key) {
    console.log(`key up: ${key}`);
    if (this.nextPoseList.length > 1) return;
    if (key == "1") {
      this.nextPoseList.push({
        pose: pose.idle,
        interval: 0.5,
        lerpFunc: this.poseLerpFunc,
      });
    }
    if (key == "2") {
      this.nextPoseList.push({
        pose: pose.idle,
        interval: 0.5,
        lerpFunc: this.poseLerpFunc,
      });
    }
    if (key == "3") {
      this.nextPoseList.push({
        pose: pose.idle,
        interval: 0.5,
        lerpFunc: this.poseLerpFunc,
      });
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

    var x0 = (e.clientX - left - 400) / 300;
    var y0 = (bottom - e.clientY - 400) / 300;
    this.prevArcballVector = this.xy2ArcballVec(x0, y0);
    this.mousePressed = true;
    this.prevArcballQ = this.cube.transform.localRotation;

    // pose
    if (this.nextPoseList.length == 0) {
      if (index == 1) {
        this.setLegLDPivot();
        this.nextPoseList.push(
          { pose: pose.jumpReady, interval: 0.5, lerpFunc: this.poseLerpFunc },
          { pose: pose.jump, interval: 0.5, lerpFunc: this.lerpQuadratic2 },
          { pose: pose.jumpReady, interval: 0.5, lerpFunc: this.lerpQuadratic1 },
          { pose: pose.idle, interval: 0.5, lerpFunc: this.poseLerpFunc }
        );
      }
    }
  }

  onMouseUp(e) {
    this.mousePressed = false;
  }

  // update arcball
  onMouseMove(e) {
    if (!this.mousePressed || !this.arcballEnabled) return;

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
    var q0 = this.prevArcballQ;
    this.cube.transform.localRotation = quat.mul(quat.create(), q, q0);
  }

  finalize() {
    // Finalize WebGL objects (mesh, shader, texture, ...)
    document.removeEventListener("keydown", this.handleKeyDown);
    gl.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.thingsToClear.forEach((it) => it.finalize());
  }

  update(elapsed, dt) {
    // Updates before rendering here
    if (!this.arcballEnabled) this.simpleOrbitControl.update(dt);

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
    this.cubeList.forEach((i) => i.renderPicking(this.camera));

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
    this.body.transform.setParent(this.avatar.transform);
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
    this.legLD.transform.setParent(this.avatar.transform);
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
  }

  poseLerpFunc(x) {
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
  changePoseTime = 0;
  mousePressed = false;
  arcballEnabled = false;
}
