import { vec2, vec3 } from "./gl-matrix.js";
export function generatePlane(xlen = 1, ylen = 1) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  //      ^ y
  // 2---------1
  // |    |    |
  // |----+----|-> x
  // |    |    |
  // 3---------0
  // ( facing -z direction)

  xlen *= 0.5;
  ylen *= 0.5;

  data.vertices.push(
    +xlen,
    -ylen,
    0,
    -xlen,
    -ylen,
    0,
    -xlen,
    +ylen,
    0,
    +xlen,
    +ylen,
    0
  );

  data.textures.push(
    // from bottom-left, CCW
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1
  );

  data.vertexNormals.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);

  data.indices.push(0, 1, 2, 0, 2, 3);

  return data;
}

export function generateCube(xlen = 1, ylen = 1, zlen = 1) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  xlen *= 0.5;
  ylen *= 0.5;
  zlen *= 0.5;

  /*
   **      3-----4
   **     /|    /|
   **    2-----5 |
   **    | 0---|-7
   **    |/    |/
   **    1-----6
   **/
  const points = [
    vec3.fromValues(-xlen, -ylen, -zlen),
    vec3.fromValues(-xlen, -ylen, +zlen),
    vec3.fromValues(-xlen, +ylen, +zlen),
    vec3.fromValues(-xlen, +ylen, -zlen),
    vec3.fromValues(+xlen, +ylen, -zlen),
    vec3.fromValues(+xlen, +ylen, +zlen),
    vec3.fromValues(+xlen, -ylen, +zlen),
    vec3.fromValues(+xlen, -ylen, -zlen),
  ];

  const uv = [
    // from bottom-left, CCW
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 0),
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 1),
  ];

  const normals = {
    posX: vec3.fromValues(+1, 0, 0),
    negX: vec3.fromValues(-1, 0, 0),
    posY: vec3.fromValues(0, +1, 0),
    negY: vec3.fromValues(0, -1, 0),
    posZ: vec3.fromValues(0, 0, +1),
    negZ: vec3.fromValues(0, 0, -1),
  };

  let index = 0;
  const addTri = (n, ...idx) => {
    for (const [pi, ui] of idx) {
      data.vertices.push(...points[pi]);
      data.vertexNormals.push(...n);
      data.textures.push(...uv[ui]);
      data.indices.push(index++);
    }
  };

  const addQuad = (f0, f1, f2, f3, n) => {
    addTri(n, [f0, 0], [f1, 1], [f2, 2]);
    addTri(n, [f0, 0], [f2, 2], [f3, 3]);
  };

  addQuad(1, 6, 5, 2, normals.posZ);
  addQuad(3, 2, 5, 4, normals.posY);
  addQuad(5, 6, 7, 4, normals.posX);
  addQuad(3, 4, 7, 0, normals.negZ);
  addQuad(7, 6, 1, 0, normals.negY);
  addQuad(3, 0, 1, 2, normals.negX);

  return data;
}

export function generateSphere(radius = 1, longitudes = 64, latitudes = 32) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  // TODO: Implement sphere generation

  const addTri = (p0, p1, p2) => {
    data.vertices.push(...p0, ...p1, ...p2);
    data.vertexNormals.push(...p0, ...p1, ...p2);
  };

  const addQuad = (p0, p1, p2, p3) => {
    addTri(p0, p1, p2);
    addTri(p0, p2, p3);
  };

  const angle2xyz = (theta, phi) => [
    radius * Math.cos(theta) * Math.sin(phi),
    radius * Math.cos(phi),
    radius * -Math.sin(theta) * Math.sin(phi),
  ];

  // pole
  for (var i = 0; i < longitudes; i++) {
    const p0 = [0, radius, 0];
    const p0_ = [0, -radius, 0];
    const p1 = angle2xyz(
      (i / longitudes) * 2 * Math.PI,
      (1 / latitudes) * Math.PI
    );
    const p1_ = angle2xyz(
      ((i + 1) / longitudes) * 2 * Math.PI,
      ((latitudes - 1) / latitudes) * Math.PI
    );
    const p2 = angle2xyz(
      ((i + 1) / longitudes) * 2 * Math.PI,
      (1 / latitudes) * Math.PI
    );
    const p2_ = angle2xyz(
      (i / longitudes) * 2 * Math.PI,
      ((latitudes - 1) / latitudes) * Math.PI
    );

    addTri(p0, p1, p2); // top pole
    addTri(p0_, p1_, p2_); // bottom pole
  }

  // other faces
  for (var i = 0; i < longitudes; i++) {
    for (var j = 1; j < latitudes - 1; j++) {
      const p0 = angle2xyz(
        (i / longitudes) * 2 * Math.PI,
        (j / latitudes) * Math.PI
      );
      const p1 = angle2xyz(
        (i / longitudes) * 2 * Math.PI,
        ((j + 1) / latitudes) * Math.PI
      );
      const p2 = angle2xyz(
        ((i + 1) / longitudes) * 2 * Math.PI,
        ((j + 1) / latitudes) * Math.PI
      );
      const p3 = angle2xyz(
        ((i + 1) / longitudes) * 2 * Math.PI,
        (j / latitudes) * Math.PI
      );

      addQuad(p0, p1, p2, p3);
    }
  }

  return data;
}

export function generateCone(radius = 1, height = 1, sides = 64) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  // TODO: Implement cone generation

  // bottom
  for (var i = 0; i < sides; i++) {
    const theta = (i / sides) * 2 * Math.PI;
    const theta_ = ((i + 1) / sides) * 2 * Math.PI;
    const p0 = [0, 0, 0];
    const p1 = [radius * Math.cos(theta), 0, radius * Math.sin(theta)];
    const p2 = [radius * Math.cos(theta_), 0, radius * Math.sin(theta_)];
    data.vertices.push(...p0, ...p1, ...p2);
    data.vertexNormals.push(0, -1, 0, 0, -1, 0, 0, -1, 0);
  }

  // side
  for (var i = 0; i < sides; i++) {
    const theta = (i / sides) * 2 * Math.PI;
    const theta_ = ((i + 1) / sides) * 2 * Math.PI;
    const p0 = [0, height, 0];
    const p1 = [radius * Math.cos(theta), 0, radius * Math.sin(theta)];
    const p2 = [radius * Math.cos(theta_), 0, radius * Math.sin(theta_)];
    const n0 = [
      height * Math.cos((theta + theta_) / 2),
      radius,
      height * Math.sin((theta + theta_) / 2),
    ];
    const n1 = [height * Math.cos(theta), radius, height * Math.sin(theta)];
    const n2 = [height * Math.cos(theta_), radius, height * Math.sin(theta_)];
    data.vertices.push(...p0, ...p2, ...p1);
    data.vertexNormals.push(...n0, ...n2, ...n1);
  }

  return data;
}

export function generateCylinder(radius = 1, height = 1, sides = 64) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  // TODO: Implement cylinder generation

  height /= 2;

  // bottom, top
  for (var i = 0; i < sides; i++) {
    const theta = (i / sides) * 2 * Math.PI;
    const theta_ = ((i + 1) / sides) * 2 * Math.PI;
    var p0 = [0, -height, 0];
    var p1 = [radius * Math.cos(theta), -height, radius * Math.sin(theta)];
    var p2 = [radius * Math.cos(theta_), -height, radius * Math.sin(theta_)];
    data.vertices.push(...p0, ...p1, ...p2);
    data.vertexNormals.push(0, -1, 0, 0, -1, 0, 0, -1, 0);
    p0[1] = height;
    p1[1] = height;
    p2[1] = height;
    data.vertices.push(...p0, ...p2, ...p1);
    data.vertexNormals.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
  }

  // side
  for (var i = 0; i < sides; i++) {
    const theta = (i / sides) * 2 * Math.PI;
    const theta_ = ((i + 1) / sides) * 2 * Math.PI;
    const p1 = [radius * Math.cos(theta), -height, radius * Math.sin(theta)];
    const p2 = [radius * Math.cos(theta_), -height, radius * Math.sin(theta_)];
    const p3 = [radius * Math.cos(theta), height, radius * Math.sin(theta)];
    const p4 = [radius * Math.cos(theta_), height, radius * Math.sin(theta_)];
    const n1 = [Math.cos(theta), 0, Math.sin(theta)];
    const n2 = [Math.cos(theta_), 0, Math.sin(theta_)];
    data.vertices.push(...p1, ...p4, ...p2);
    data.vertices.push(...p1, ...p3, ...p4);
    data.vertexNormals.push(...n1, ...n2, ...n2);
    data.vertexNormals.push(...n1, ...n1, ...n2);
  }

  return data;
}
