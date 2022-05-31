import gl from "../gl.js";
import { vec3, mat4, quat } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import { UnlitTextureShader } from "../unlit_texture_shader.js";

import { Skybox, SkyboxShader } from "../skybox_shader.js";
import { SolidShader } from "../solid_shader.js";
import { VertexColorShader } from "../vertex_color_shader.js";
import { TextureShader } from "../texture_shader.js";
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

class Framebuffer {
  constructor() {
    this.finalize();
  }

  finalize() {
    gl.deleteTexture(this.colorTexture);
    gl.deleteRenderbuffer(this.dbo);
    gl.deleteFramebuffer(this.fbo);
    this.initialized = false;
  }

  initialize(width, height) {
    if (this.initialized) this.finalize();

    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    this.colorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
    // Unlike picking buffer, it uses linear sampling
    // so that the sampled image is less blocky under extreme distortion
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.colorTexture,
      0
    );

    this.dbo = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.dbo);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.dbo);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}

class PhotoFilm {
  async initialize(width, height) {
    this.enabled = false;
    this.printFinished = false;
    this.width = width;
    this.height = height;

    this.framebuffer = new Framebuffer();
    this.framebuffer.initialize(width, height);

    const planeMeshData = cs380.primitives.generatePlane(1, 1);
    const planeMesh = cs380.Mesh.fromData(planeMeshData);
    const shader = await cs380.buildShader(UnlitTextureShader);

    this.transform = new cs380.Transform();
    quat.rotateY(this.transform.localRotation, quat.create(), Math.PI);

    this.background = new cs380.RenderObject(planeMesh, shader);
    this.background.uniforms.useScreenSpace = true;
    this.background.uniforms.useColor = true;
    this.background.uniforms.solidColor = vec3.fromValues(1, 1, 1);
    vec3.set(this.background.transform.localScale, 1.2, 1.4, 1);
    this.background.transform.setParent(this.transform);

    this.image = new cs380.RenderObject(planeMesh, shader);
    this.image.uniforms.useScreenSpace = true;
    this.image.uniforms.useColor = false;
    this.image.uniforms.mainTexture = this.framebuffer.colorTexture;
    vec3.set(this.image.transform.localPosition, 0, 0.1, 0);
    this.image.transform.setParent(this.transform);

    this.thingsToClear = [shader, planeMesh, this.framebuffer];

    this.handleMouseDown = (e) => {
      if (this.printFinished) this.hide();
    };
    document.addEventListener("mousedown", this.handleMouseDown);
  }

  render(camera) {
    if (!this.enabled) return;
    const prevDepthFunc = gl.getParameter(gl.DEPTH_FUNC);
    gl.depthFunc(gl.ALWAYS);
    this.background.render(camera);
    this.image.render(camera);
    gl.depthFunc(prevDepthFunc);
  }

  finalize() {
    for (const thing of this.thingsToClear) {
      thing.finalize();
    }

    document.removeEventListener("mousedown", this.handleMouseDown);
  }

  show(elapsed) {
    this.enabled = true;
    this.printFinished = false;
    this.showStartTime = elapsed;
  }

  update(elapsed) {
    if (!this.enabled) return;
    const time = elapsed - this.showStartTime;
    let yPos = 2 - Math.min(2, time * 0.8);
    this.transform.localPosition[1] = yPos;

    this.printFinished = yPos < 0.001;
  }

  hide() {
    this.enabled = false;
  }
}

function createMyLights() {
  const light0 = new Light();
  light0.illuminance = [0.1, 0.1, 0.1];
  light0.type = LightType.AMBIENT;

  const light1 = new Light();
  light1.illuminance = [100, 0, 0];
  light1.type = LightType.SPOTLIGHT;
  light1.transform.localPosition = [0, 10, 0];
  light1.transform.localRotation = quat.fromEuler(quat.create(), 90, 0, 0);

  const light2 = new Light();
  light2.illuminance = [0, 100, 0];
  light2.type = LightType.SPOTLIGHT;
  light2.transform.localPosition = [-5, 10, 0];
  light2.transform.lookAt([-4, 10, 0]);

  const light3 = new Light();
  light3.illuminance = [0, 0, 100];
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

  return [light0, light1, light2, light3, light4, light5];
}

class MyBackground {
  constructor(myShader, textureShader, width, height) {
    // background (not pickable)
    const bgSize = 16;
    const bgMesh = new cs380.Mesh();
    this.background = new cs380.RenderObject(bgMesh, myShader);
    this.background.transform.localPosition = [0, 3.7, 0];
    const bgPlane = cs380.Mesh.fromData(generatePlane(bgSize, bgSize));
    this.thingsToClear = [];
    this.thingsToClear.push(bgMesh, bgPlane);
    this.bgList = [];
    const bgMaterial = new Material([1, 1, 1]);
    bgMaterial.shininess = 300;

    // add background component
    const addBackgroundComponent = (name, size, pos, shader) => {
      this[name] = new cs380.RenderObject(bgPlane, shader);
      this[name].transform.setParent(this.background.transform);
      this[name].transform.localPosition = pos;
      this[name].transform.localScale = size;
      this[name].uniforms.material = bgMaterial;
      this.bgList.push(this[name]);
    };

    // background
    addBackgroundComponent("bgD", [1, 1, 1], [0, -bgSize / 2, 0], myShader);
    quat.rotateX(this.bgD.transform.localRotation, quat.create(), Math.PI / 2);
    addBackgroundComponent("bgB", [1, 1, 1], [0, 0, -bgSize / 2], textureShader);
    quat.rotateY(this.bgB.transform.localRotation, quat.create(), Math.PI);
    this.bgB.framebuffer = new Framebuffer();
    this.bgB.framebuffer.initialize(width, height);
    this.bgB.uniforms.mainTexture = this.bgB.framebuffer.colorTexture;
    this.thingsToClear.push(this.bgB.framebuffer);
  }

  setLights(lights) {
    this.bgList.forEach((i) => (i.uniforms.lights = lights));
  }

  render(cam) {
    this.bgList.forEach((i) => i.render(cam));
  }

  finalize() {
    for (const thing of this.thingsToClear) {
      thing.finalize();
    }
  }
}

class MyColorPlane {
  constructor(shader) {
    const bgMesh = new cs380.Mesh();
    bgMesh.addAttribute(3); // position
    bgMesh.addAttribute(3); // color
    bgMesh.addVertexData(2, -2, -1, 0, 1, 0);
    bgMesh.addVertexData(2, 2, -1, 0, 0, 1);
    bgMesh.addVertexData(-2, 2, -1, 0, 0, 1);
    bgMesh.addVertexData(-2, -2, -1, 1, 0, 0);
    bgMesh.drawMode = gl.TRIANGLE_FAN;
    bgMesh.initialize();
    this.thingsToClear = [bgMesh];

    this.object = new cs380.RenderObject(bgMesh, shader);
  }

  render(cam) {
    this.object.render(cam);
  }

  finalize() {
    for (const thing of this.thingsToClear) {
      thing.finalize();
    }
  }
}

class MyTree {
  constructor(shader) {
    this.mesh = new cs380.Mesh();
    this.thingsToClear = [];
    this.thingsToClear.push(this.mesh, shader);
    this.object = new cs380.RenderObject(this.mesh, shader);
    this.object.uniforms.mainColor = [0, 0, 0];
  }

  render(cam) {
    this.object.render(cam);
  }

  finalize() {
    for (const thing of this.thingsToClear) {
      thing.finalize();
    }
  }

  draw(n, theta, p1, p2) {
    const _drawTree = (n, theta, p1, p2) => {
      if (n <= 0) return;
      var p3 = vec3.create();
      var p4 = vec3.create();
      var p5 = vec3.create();
      var v12 = vec3.create();
      var v23 = vec3.create();
      var vx = vec3.create();
      var vy = vec3.create();
      vec3.sub(v12, p2, p1);
      vec3.scale(v23, vec3.fromValues(-v12[1], v12[0], v12[2]), 3);
      var len = vec3.len(v12);
      vec3.normalize(vx, v12);
      vec3.normalize(vy, v23);
      vec3.add(p3, p2, v23);
      vec3.add(p4, p1, v23);
      vec3.add(
        p5,
        p4,
        vec3.add(
          vec3.create(),
          vec3.scale(vec3.create(), vx, len * Math.cos(theta) * Math.cos(theta)),
          vec3.scale(vec3.create(), vy, len * Math.cos(theta) * Math.sin(theta))
        )
      );
      this.mesh.addVertexData(...p1, ...p2, ...p3);
      this.mesh.addVertexData(...p1, ...p3, ...p4);
      this.mesh.addVertexData(...p4, ...p3, ...p5);
      _drawTree(n - 1, theta, p4, p5);
      _drawTree(n - 1, theta, p5, p3);
    };

    this.mesh.finalize();
    this.mesh.addAttribute(3); // position
    _drawTree(n, theta, p1, p2);
    this.mesh.drawMode = gl.TRIANGLES;
    this.mesh.initialize();
  }
}

class MyDragon {
  constructor(shader) {
    this.meshes = [];
    for (var i = 0; i < 5; i++) this.meshes.push(new cs380.Mesh());
    this.objects = [];
    for (var i in this.meshes) {
      this.objects.push(new cs380.RenderObject(this.meshes[i], shader));
    }
    this.thingsToClear = [];
    this.thingsToClear.push(...this.meshes);
    for (var i = 0; i < 5; i++) this.draw(i, 12, [0, 0, 0], 0.4);
  }

  update(elapsed) {
    for (var i = 0; i < 5; i++) {
      var y = elapsed + 3.6 * i;
      var dx = -Math.sin(elapsed) * 0.4;
      while (y >= 6) y -= 6;
      vec3.set(this.objects[i].transform.localPosition, 0.8 * i - 1.6 + dx, 3 - y, 1);
      quat.rotateZ(this.objects[i].transform.localRotation, quat.create(), elapsed);
    }
  }

  render(cam) {
    this.objects.forEach((i) => i.render(cam));
  }

  finalize() {
    for (const thing of this.thingsToClear) {
      thing.finalize();
    }
  }

  draw(idx, n, pos, size) {
    const _drawDragon = (n, pos, segmentLength, dir) => {
      const getRotateList = (n) => {
        //  1: 왼쪽으로 꺾음
        // -1: 오른쪽으로 꺾음
        if (n == 0) return [];
        if (n == 1) return [1];
        var list1 = getRotateList(n - 1);
        var list2 = list1
          .map((n) => {
            return -n;
          })
          .reverse();
        return [...list1, 1, ...list2];
      };
      const dir2vec = (dir) => {
        switch (dir) {
          case 0: // 우
            return vx;
          case 1: // 상
            return vy;
          case 2: // 좌
            return vec3.scale(vec3.create(), vx, -1);
          case 3: // 하
            return vec3.scale(vec3.create(), vy, -1);
        }
      };

      var colorVal = ((dir % 2) + 1) * 0.5;
      var color = vec3.fromValues(colorVal, colorVal, colorVal);
      var vxt = vec3.fromValues(1, 0, 0);
      var vyt = vec3.fromValues(0, 1, 0);
      var vx = vec3.create();
      var vy = vec3.create();
      vec3.scale(vx, vxt, segmentLength);
      vec3.scale(vy, vyt, segmentLength);

      var rotateList = getRotateList(n);
      var pointList = [];

      // rotateList의 값대로 선분을 돌려가면서 pointList 채우기
      pointList.push(pos);
      pos = vec3.add(vec3.create(), pos, dir2vec(dir));
      pointList.push(pos);
      for (var rotate of rotateList) {
        dir += rotate;
        if (dir < 0) dir += 4;
        if (dir >= 4) dir -= 4;
        pos = vec3.add(vec3.create(), pos, dir2vec(dir));
        pointList.push(pos);
      }

      // 삼각형들 그리기
      for (var i = 2; i < pointList.length; i += 2) {
        var p1 = pointList[i - 2];
        var p2 = pointList[i - 1];
        var p3 = pointList[i];
        var p4 = vec3.create(); // p1, p2, p3, p4로 정사각형 구성
        var middle = vec3.create();
        vec3.scale(middle, vec3.add(vec3.create(), p1, p3), 0.5);
        vec3.add(p4, middle, vec3.sub(vec3.create(), middle, p2));
        this.meshes[idx].addVertexData(...p1, ...color, ...p2, ...color, ...p3, ...color);
        this.meshes[idx].addVertexData(...p1, ...color, ...p3, ...color, ...p4, ...color);
      }
    };

    this.meshes[idx].finalize();
    this.meshes[idx].addAttribute(3); // position
    this.meshes[idx].addAttribute(3); // color
    for (var i = 0; i < 4; i++) _drawDragon(n, pos, size * Math.pow(0.67, n - 1), i);
    this.meshes[idx].drawMode = gl.TRIANGLES;
    this.meshes[idx].initialize();
  }
}

class MyAvatar {
  constructor(myShader, pickingShader) {
    this.thingsToClear = [];

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

    // parent object
    const avatarMesh = new cs380.Mesh();
    this.thingsToClear.push(avatarMesh);
    this.avatar = new cs380.RenderObject(avatarMesh, myShader);
    this.avatarList = [];

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

    this.currPose = pose.idle;
    this.setLegLDPivot();
    this.setPose(this.currPose);

    this.nextPoseList = [];
    this.changePoseTime = 0;
  }

  update(dt) {
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
  }

  render(cam) {
    this.avatarList.forEach((i) => i.render(cam));
  }

  finalize() {
    for (const thing of this.thingsToClear) {
      thing.finalize();
    }
  }

  setLights(lights) {
    this.avatarList.forEach((i) => (i.uniforms.lights = lights));
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
}

class MyCubemap {
  constructor(skyboxShader, textureLoader) {
    const cubemap = new cs380.Cubemap();
    this.thingsToClear = [];
    this.thingsToClear.push(cubemap);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    cubemap.initialize([
      [gl.TEXTURE_CUBE_MAP_POSITIVE_X, textureLoader.posX],
      [gl.TEXTURE_CUBE_MAP_NEGATIVE_X, textureLoader.negX],
      [gl.TEXTURE_CUBE_MAP_POSITIVE_Y, textureLoader.posY],
      [gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, textureLoader.negY],
      [gl.TEXTURE_CUBE_MAP_POSITIVE_Z, textureLoader.posZ],
      [gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, textureLoader.negZ],
    ]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const cubeMeshData = cs380.primitives.generateCube();
    const skyboxMesh = cs380.Mesh.fromData(cubeMeshData);

    this.thingsToClear.push(skyboxMesh);
    this.skybox = new Skybox(skyboxMesh, skyboxShader);
    this.skybox.uniforms.mainTexture = cubemap.id;
    quat.rotateX(this.skybox.transform.localRotation, quat.create(), Math.PI);
  }

  render(cam) {
    this.skybox.render(cam);
  }

  finalize() {
    for (const thing of this.thingsToClear) {
      thing.finalize();
    }
  }
}

export default class Assignment4 extends cs380.BaseApp {
  async initialize() {
    // Basic setup for camera
    const { width, height } = gl.canvas.getBoundingClientRect();
    const aspectRatio = width / height;
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 0, 30);
    this.camera.transform.lookAt(vec3.fromValues(0, 0, -1));
    mat4.perspective(this.camera.projectionMatrix, (45 * Math.PI) / 180, aspectRatio, 0.01, 1000);

    this.textureCamera = new cs380.Camera();
    vec3.set(this.textureCamera.transform.localPosition, 0, 0, 0);
    mat4.ortho(
      this.textureCamera.projectionMatrix,
      -2 * aspectRatio,
      +2 * aspectRatio,
      -2,
      +2,
      -2,
      +2
    );

    this.width = width;
    this.height = height;

    // Rest of initialization below
    this.thingsToClear = [];

    this.photo = new PhotoFilm();
    await this.photo.initialize(width, height);
    this.thingsToClear.push(this.photo);

    // TODO: initialize your object + scene here

    // SimpleOrbitControl
    const orbitControlCenter = vec3.fromValues(0, 0, 0);
    this.simpleOrbitControl = new cs380.utils.SimpleOrbitControl(this.camera, orbitControlCenter);
    this.thingsToClear.push(this.simpleOrbitControl);

    // initialize picking shader & buffer
    const myShader = await cs380.buildShader(MyShader);
    const pickingShader = await cs380.buildShader(cs380.PickingShader);
    const solidShader = await cs380.buildShader(SolidShader);
    const vertexColorShader = await cs380.buildShader(VertexColorShader);

    const shaderLoader = await cs380.ShaderLoader.load({
      skyboxShader: SkyboxShader.source,
      textureShader: TextureShader.source,
    });
    const textureShader = new TextureShader();
    textureShader.initialize(shaderLoader.textureShader);
    const skyboxShader = new SkyboxShader();
    skyboxShader.initialize(shaderLoader.skyboxShader);

    this.pickingBuffer = new cs380.PickingBuffer();
    this.pickingBuffer.initialize(width, height);
    this.thingsToClear.push(
      myShader,
      pickingShader,
      solidShader,
      vertexColorShader,
      textureShader,
      skyboxShader,
      this.pickingBuffer
    );

    const textureLoader = await cs380.TextureLoader.load({
      posX: "resources/mySkybox/right.png",
      negX: "resources/mySkybox/left.png",
      posY: "resources/mySkybox/top.png",
      negY: "resources/mySkybox/bottom.png",
      posZ: "resources/mySkybox/front.png",
      negZ: "resources/mySkybox/back.png",
    });

    // initialize my lights, background, avatar
    this.lights = createMyLights();
    this.colorPlane = new MyColorPlane(vertexColorShader);
    this.tree = new MyTree(solidShader);
    this.dragon = new MyDragon(vertexColorShader);
    this.background = new MyBackground(myShader, textureShader, this.width, this.height);
    this.background.setLights(this.lights);
    this.avatar = new MyAvatar(myShader, pickingShader);
    this.avatar.setLights(this.lights);
    this.cubemap = new MyCubemap(skyboxShader, textureLoader);
    this.thingsToClear.push(
      this.background,
      this.colorPlane,
      this.tree,
      this.dragon,
      this.avatar,
      this.cubemap
    );

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

    // Setup GUIs
    // TODO: add camera effects of your own
    // Change "my-effect" and "My camera effect" to fitting name for your effect.
    // You can add multiple options.
    document.getElementById("settings").innerHTML = `
      <!-- Camera shutter UI --> 
      <audio id="shutter-sfx">
        <source src="resources/shutter_sfx.ogg" type="audio/ogg">
      </audio> 
      <button type="button" id="shutter">Take a picture!</button><br/>

      <!-- TODO: Add camera effect lists here --> 
      <label for="setting-effect">Camera effect</label>
      <select id="setting-effect">
        <option value="none">None</option>
        <option value="my-effect">My camera effect</option>
      </select> <br/>

      <!-- OPTIONAL: Add more UI elements here --> 

      <!-- light settings -->
      <table>
        <tr align="right">
          <td>
          <label for="light0-illuminance">Ambient Light</label>
          <input type="range" min=0 max=1 value=0.1 step=0.01 id="light0-illuminance">
          </td>
          <td>
          <label for="light4-illuminance">&nbsp;&nbsp;&nbsp;Point Light</label>
          <input type="range" min=0 max=10 value=10 step=0.1 id="light4-illuminance">
          </td>
          <td>
          <label for="light5-illuminance">&nbsp;&nbsp;&nbsp;Directional Light</label>
          <input type="range" min=0 max=1 value=1 step=0.01 id="light5-illuminance">
          </td>
        </tr>
        <tr align="right">
          <td>
          <label for="light1-illuminance">Red Light</label>
          <input type="range" min=0 max=100 value=100 step=0.01 id="light1-illuminance">
          </td>
          <td>
          <label for="light2-illuminance">&nbsp;&nbsp;&nbsp;Green Light</label>
          <input type="range" min=0 max=100 value=100 step=0.01 id="light2-illuminance">
          </td>
          <td>
          <label for="light3-illuminance">&nbsp;&nbsp;&nbsp;Blue Light</label>
          <input type="range" min=0 max=100 value=100 step=0.01 id="light3-illuminance">
          </td>
        </tr>
      </table>

      <h3>Basic requirements</h3>
      <ul>
        <li>Reuse HW1 Animated Background [1 pt]</li>
        <li>Reuse HW2: Avatar with adjustable pose [0.5 pt]</li>
        <li>Reuse HW3: Phong shading lightings [1 pt]</li>
        <li>Skybox [0.5 pt] </li>
        <li>Camera Effects [2 pt] </li>
        <li>Show some creativity in your scene [1 pts]</li>
      </ul>
      Implement creative camera effects for your virtual camera booth. <br/>
      <strong>Have fun!</strong>
    `;

    cs380.utils.setInputBehavior("light0-illuminance", (val) => {
      this.lights[0].illuminance = [val, val, val];
    });
    cs380.utils.setInputBehavior("light1-illuminance", (val) => {
      this.lights[1].illuminance = [val, 0, 0];
    });
    cs380.utils.setInputBehavior("light2-illuminance", (val) => {
      this.lights[2].illuminance = [0, val, 0];
    });
    cs380.utils.setInputBehavior("light3-illuminance", (val) => {
      this.lights[3].illuminance = [0, 0, val];
    });
    cs380.utils.setInputBehavior("light4-illuminance", (val) => {
      this.lights[4].illuminance = [val, val, val];
    });
    cs380.utils.setInputBehavior("light5-illuminance", (val) => {
      this.lights[5].illuminance = [val, val, val];
    });

    const shutterAudio = document.getElementById("shutter-sfx");
    document.getElementById("shutter").onclick = () => {
      this.shutterPressed = true;
      shutterAudio.play();
    };

    this.camereEffect = "none";
    cs380.utils.setInputBehavior(
      "setting-effect",
      (val) => {
        this.camereEffect = val;
      },
      true,
      false
    );
  }

  onKeyDown(key) {
    console.log(`key down: ${key}`);

    if (this.avatar.nextPoseList.length > 0) return;
    if (key == "1") {
      this.avatar.setBodyPivot();
      this.avatar.nextPoseList.push({
        pose: pose.pose1,
        interval: 0.5,
        lerpFunc: (x) => x,
      });
    }
    if (key == "2") {
      this.avatar.setLegLDPivot();
      this.avatar.nextPoseList.push({
        pose: pose.pose2,
        interval: 0.5,
        lerpFunc: (x) => x,
      });
    }
    if (key == "3") {
      this.avatar.setLegLDPivot();
      this.avatar.nextPoseList.push({
        pose: pose.cheese,
        interval: 0.5,
        lerpFunc: (x) => x,
      });
    }
  }

  onKeyUp(key) {
    console.log(`key up: ${key}`);

    if (this.avatar.nextPoseList.length > 1) return;
    if (key == "1") {
      this.avatar.nextPoseList.push({
        pose: pose.idle,
        interval: 0.5,
        lerpFunc: (x) => x,
      });
    }
    if (key == "2") {
      this.avatar.nextPoseList.push({
        pose: pose.idle,
        interval: 0.5,
        lerpFunc: (x) => x,
      });
    }
    if (key == "3") {
      this.avatar.nextPoseList.push({
        pose: pose.idle,
        interval: 0.5,
        lerpFunc: (x) => x,
      });
    }
  }

  onMouseDown(e) {}

  onMouseUp(e) {}

  onMouseMove(e) {}

  finalize() {
    // Finalize WebGL objects (mesh, shader, texture, ...)
    for (const thing of this.thingsToClear) {
      thing.finalize();
    }
  }

  update(elapsed, dt) {
    // TODO: Update objects here
    this.simpleOrbitControl.update(dt);
    var angle = (Math.sin(elapsed) * Math.PI) / 4;
    if (angle < 0) angle += Math.PI / 2;
    this.tree.draw(12, angle, [1, -2.1, 0], [1.4, -2, 0]);
    this.dragon.update(elapsed);
    this.avatar.update(dt);

    // OPTIONAL: render PickableObject to the picking buffer here

    // Render effect-applied scene to framebuffer of the photo if shutter is pressed
    if (this.shutterPressed) {
      this.shutterPressed = false;
      this.renderImage(this.photo.framebuffer.fbo, this.photo.width, this.photo.height);
      this.photo.show(elapsed); // Initiates photo-printing animation
    }

    // render tree into texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.background.bgB.framebuffer.fbo);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.colorPlane.render(this.textureCamera);
    this.tree.render(this.textureCamera);
    this.dragon.render(this.textureCamera);

    // Render effect-applied scene to the screen
    this.renderImage(null);

    // Photos are rendered at the very last
    this.photo.update(elapsed);
    this.photo.render(this.camera);
  }

  renderScene() {
    // TODO: render scene *without* any effect
    // It would consist of every render(...) calls of objects in the scene
    /* Example code
    this.skybox.render(this.camera);
    this.animatedBackground.render(this.camera);
    this.avatar.render(this.camera);
    ...
    */
    this.cubemap.render(this.camera);
    this.background.render(this.camera);
    this.avatar.render(this.camera);
  }

  renderImage(fbo = null, width = null, height = null) {
    // Parameters:
    //  * fbo: Target framebuffer object, default is to the canvas
    //  * width: Width of the target framebuffer, default is canvas'
    //  * height: Height of the target framebuffer default is canvas'

    if (!width) width = this.width;
    if (!height) height = this.height;
    if (this.camereEffect == "none") {
      // no camera effect - render directly to the scene
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      this.renderScene();
    } else {
      // TODO: render the scene with some camera effect to the target framebuffer object (fbo)
      // Write at least one camera effect shader, which takes a rendered texture and draws modified version of the given texture
      //
      // Step-by-step guide:
      //  1) Bind a separate framebuffer that you initialized beforehand
      //  2) Render the scene to the framebuffer
      //    - You probably need to use this.renderScene() here
      //    - If the width/height differ from the target framebuffer, use gl.viewPort(..)
      //  3) Bind a target framebuffer (fbo)
      //  4) Render a plane that fits the viewport with a camera effect shader
      //    - The plane should perfectly fit the viewport regardless of the camera movement (similar to skybox)
      //    - You may change the shader for a RenderObject like below:
      //        this.my_object.render(this.camera, *my_camera_effect_shader*)

      // TODO: Remove the following line after you implemented.
      // (and please, remove any console.log(..) within the update loop from your submission)
      console.log("TODO: camera effect (" + this.camereEffect + ")");

      // Below codes will do no effectl it just renders the scene. You may (should?) delete this.
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      this.renderScene();
    }
  }
}
