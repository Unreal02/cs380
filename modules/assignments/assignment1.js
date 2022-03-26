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

    document.getElementById("settings").innerHTML = `
      <h3>Basic requirements</h3>
      <ul>
        <li>Add a background with color gradient</li>
        <li>Add 2 or more types of fractal-like natural objects</li>
        <li>Add framerate-independent natural animation</li>
        <li>Show some creativity in your scene</li>
      </ul>
    `;

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

    // shader
    this.vcShader = await cs380.buildShader(VertexColorShader);
    this.sShader = await cs380.buildShader(SolidShader);

    // render
    this.background = new cs380.RenderObject(this.bgMesh, this.vcShader);
    this.tree = new cs380.RenderObject(this.treeMesh, this.sShader);
    this.tree.uniforms.mainColor = vec3.fromValues(1, 1, 1);

    // HTML interaction
    document.getElementById("settings").innerHTML = `
      <div>
      <label for="settings-tree-level">Tree level</label>
      <input type="number" id="settings-tree-level" value="10" min="1" max="12" step="1">
      </div>
    `;
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
      const len = vec3.len(v12);
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

    // Clear canvas
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rest of rendering below
    this.background.render(this.camera);
    this.tree.render(this.camera);
  }
}
