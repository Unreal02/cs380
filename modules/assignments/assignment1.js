import gl from "../gl.js";
import { vec3, mat4, quat } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";
import { SolidShader } from "../solid_shader.js";
import { VertexColorShader } from "../vertex_color_shader.js";

export default class Assignment1 extends cs380.BaseApp {
  async initialize() {
    // Basic setup for camera
    const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 0, 0);
    mat4.ortho(
      this.camera.projectionMatrix,
      -2 * aspectRatio,
      +2 * aspectRatio,
      -2,
      +2,
      -2,
      +2
    );

    // Rest of initialization below

    // background
    this.bgMesh = new cs380.Mesh();
    this.bgMesh.addAttribute(3); // position
    this.bgMesh.addAttribute(3); // color
    this.bgMesh.addVertexData(2, -2, -1, 0, 1, 0);
    this.bgMesh.addVertexData(2, 2, -1, 0, 0, 1);
    this.bgMesh.addVertexData(-2, 2, -1, 0, 0, 1);
    this.bgMesh.addVertexData(-2, -2, -1, 1, 0, 0);
    this.bgMesh.drawMode = gl.TRIANGLE_FAN;
    this.bgMesh.initialize();

    // tree; drawTree method
    this.treeMesh = new cs380.Mesh();
    this.point1 = vec3.fromValues(1, -2.1, 0);
    this.point2 = vec3.fromValues(1.4, -2, 0);

    // dragon flake; drawDragon method
    this.dragonMeshes = [];
    for (var i = 0; i < 5; i++) this.dragonMeshes.push(new cs380.Mesh());

    // shader
    this.vcShader = await cs380.buildShader(VertexColorShader);
    this.sShader = await cs380.buildShader(SolidShader);

    // render
    this.background = new cs380.RenderObject(this.bgMesh, this.vcShader);
    this.tree = new cs380.RenderObject(this.treeMesh, this.sShader);
    this.tree.uniforms.mainColor = vec3.fromValues(1, 1, 1);
    this.dragons = [];
    for (var i in this.dragonMeshes)
      this.dragons.push(
        new cs380.RenderObject(this.dragonMeshes[i], this.vcShader)
      );

    // HTML interaction
    document.getElementById("settings").innerHTML = `
      <div>
      <label for="settings-tree-level">Tree level (~15)</label>
      <input type="number" id="settings-tree-level" value="12" min="1" max="15" step="1">
      </div>
      <div>
      <label for="settings-dragon-flake-level">Dragon flake level (~18)</label>
      <input type="number" id="settings-dragon-flake-level" value="12" min="1" max="18" step="1">
      </div>
      <div>
      <label for="settings-dragon-flake-size">Dragon flake size (0.1~1)</label>
      <input type="range" id="settings-dragon-flake-size" value="0.4" min="0.1" max="1" step="any">
      </div>
    `;

    // dragon flake의 level이 바뀔 때
    cs380.utils.setInputBehavior("settings-dragon-flake-level", (val) => {
      for (var i = 0; i < 5; i++)
        this.drawDragon(
          i,
          val,
          vec3.fromValues(0, 0, 0),
          parseFloat(
            document.getElementById("settings-dragon-flake-size").value
          )
        );
    });

    // dragon flake의 size가 바뀔 때
    cs380.utils.setInputBehavior(
      "settings-dragon-flake-size",
      (val) => {
        for (var i = 0; i < 5; i++)
          this.drawDragon(
            i,
            parseInt(
              document.getElementById("settings-dragon-flake-level").value
            ),
            vec3.fromValues(0, 0, 0),
            parseFloat(val)
          );
      },
      true
    );
  }

  drawTree(n, theta, p1, p2) {
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
          vec3.scale(
            vec3.create(),
            vx,
            len * Math.cos(theta) * Math.cos(theta)
          ),
          vec3.scale(vec3.create(), vy, len * Math.cos(theta) * Math.sin(theta))
        )
      );
      this.treeMesh.addVertexData(...p1, ...p2, ...p3);
      this.treeMesh.addVertexData(...p1, ...p3, ...p4);
      this.treeMesh.addVertexData(...p4, ...p3, ...p5);
      _drawTree(n - 1, theta, p4, p5);
      _drawTree(n - 1, theta, p5, p3);
    };

    this.treeMesh.finalize();
    this.treeMesh.addAttribute(3); // position
    _drawTree(n, theta, p1, p2);
    this.treeMesh.drawMode = gl.TRIANGLES;
    this.treeMesh.initialize();
  }

  drawDragon(idx, n, pos, size) {
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

      var colorVal = (dir % 2) * 0.02;
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
        this.dragonMeshes[idx].addVertexData(
          ...p1,
          ...color,
          ...p2,
          ...color,
          ...p3,
          ...color
        );
        this.dragonMeshes[idx].addVertexData(
          ...p1,
          ...color,
          ...p3,
          ...color,
          ...p4,
          ...color
        );
      }
    };

    this.dragonMeshes[idx].finalize();
    this.dragonMeshes[idx].addAttribute(3); // position
    this.dragonMeshes[idx].addAttribute(3); // color
    for (var i = 0; i < 4; i++)
      _drawDragon(n, pos, size * Math.pow(0.67, n - 1), i);
    this.dragonMeshes[idx].drawMode = gl.TRIANGLES;
    this.dragonMeshes[idx].initialize();
  }

  finalize() {
    // Finalize WebGL objects (mesh, shader, texture, ...)
    this.bgMesh.finalize();
    this.treeMesh.finalize();
    this.vcShader.finalize();
    this.sShader.finalize();
  }

  update(elapsed, dt) {
    // Updates before rendering here
    // tree angle은 sin 함수 형태, 범위는 45도~90도=0도~45도
    var angle = (Math.sin(elapsed) * Math.PI) / 4;
    if (angle < 0) angle += Math.PI / 2;
    this.drawTree(
      parseInt(document.getElementById("settings-tree-level").value),
      angle,
      this.point1,
      this.point2
    );

    // dragon flake
    for (var i = 0; i < 5; i++) {
      var y = elapsed + 3.6 * i;
      var dx = -Math.sin(elapsed) * 0.4;
      while (y >= 6) y -= 6;
      vec3.set(
        this.dragons[i].transform.localPosition,
        0.8 * i - 1.6 + dx,
        3 - y,
        0
      );
      quat.rotateZ(
        this.dragons[i].transform.localRotation,
        quat.create(),
        elapsed
      );
    }

    // Clear canvas
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rest of rendering below
    this.background.render(this.camera);
    this.tree.render(this.camera);
    for (var i = 0; i < 5; i++) this.dragons[i].render(this.camera);
  }
}
