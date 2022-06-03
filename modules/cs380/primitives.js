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

  data.vertices.push(+xlen, -ylen, 0, -xlen, -ylen, 0, -xlen, +ylen, 0, +xlen, +ylen, 0);

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
    const p1 = angle2xyz((i / longitudes) * 2 * Math.PI, (1 / latitudes) * Math.PI);
    const p1_ = angle2xyz(
      ((i + 1) / longitudes) * 2 * Math.PI,
      ((latitudes - 1) / latitudes) * Math.PI
    );
    const p2 = angle2xyz(((i + 1) / longitudes) * 2 * Math.PI, (1 / latitudes) * Math.PI);
    const p2_ = angle2xyz((i / longitudes) * 2 * Math.PI, ((latitudes - 1) / latitudes) * Math.PI);

    addTri(p0, p1, p2); // top pole
    addTri(p0_, p1_, p2_); // bottom pole
  }

  // other faces
  for (var i = 0; i < longitudes; i++) {
    for (var j = 1; j < latitudes - 1; j++) {
      const p0 = angle2xyz((i / longitudes) * 2 * Math.PI, (j / latitudes) * Math.PI);
      const p1 = angle2xyz((i / longitudes) * 2 * Math.PI, ((j + 1) / latitudes) * Math.PI);
      const p2 = angle2xyz(((i + 1) / longitudes) * 2 * Math.PI, ((j + 1) / latitudes) * Math.PI);
      const p3 = angle2xyz(((i + 1) / longitudes) * 2 * Math.PI, (j / latitudes) * Math.PI);

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

// capsule = cylinder + sphere + sphere
export function generateCapsule(radius = 1, height = 1, sides = 64) {
  const data = generateCylinder(radius, height, sides);
  const data1 = generateSphere(radius, sides, sides / 2);

  data.vertices.push(...data1.vertices.map((v, i) => (i % 3 == 1 ? v + height / 2 : v)));
  data.vertices.push(...data1.vertices.map((v, i) => (i % 3 == 1 ? v - height / 2 : v)));
  data.vertexNormals.push(...data1.vertexNormals);
  data.vertexNormals.push(...data1.vertexNormals);

  return data;
}

export function generateQuarterSphere(radius) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  const angle2xyz = (theta, phi) => [
    radius * Math.cos(theta) * Math.sin(phi),
    radius * Math.cos(phi),
    radius * -Math.sin(theta) * Math.sin(phi),
  ];

  // bottom
  for (var i = 0; i < 32; i++) {
    const theta = (i * Math.PI) / 32;
    const theta_ = ((i + 1) * Math.PI) / 32;
    const p0 = [0, 0, 0];
    const p1 = [radius * Math.cos(theta), 0, -radius * Math.sin(theta)];
    const p2 = [radius * Math.cos(theta_), 0, -radius * Math.sin(theta_)];
    data.vertices.push(...p0, ...p2, ...p1);
    data.vertexNormals.push(0, -1, 0, 0, -1, 0, 0, -1, 0);
  }

  // side
  for (var i = 0; i < 32; i++) {
    for (var j = 0; j < 16; j++) {
      const theta = (i * Math.PI) / 32;
      const theta_ = ((i + 1) * Math.PI) / 32;
      const phi = (j * Math.PI) / 32;
      const phi_ = ((j + 1) * Math.PI) / 32;
      const p0 = angle2xyz(theta, phi);
      const p1 = angle2xyz(theta_, phi);
      const p2 = angle2xyz(theta, phi_);
      const p3 = angle2xyz(theta_, phi_);
      data.vertices.push(...p0, ...p2, ...p1);
      data.vertices.push(...p1, ...p2, ...p3);
      data.vertexNormals.push(...p0, ...p2, ...p1);
      data.vertexNormals.push(...p1, ...p2, ...p3);
    }
  }

  return data;
}

export function generateHemisphere(radius) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  const angle2xyz = (theta, phi) => [
    radius * Math.cos(theta) * Math.sin(phi),
    radius * Math.cos(phi),
    radius * -Math.sin(theta) * Math.sin(phi),
  ];

  for (var i = 0; i < 64; i++) {
    for (var j = 0; j < 16; j++) {
      const theta = (i * Math.PI) / 32;
      const theta_ = ((i + 1) * Math.PI) / 32;
      const phi = (j * Math.PI) / 32;
      const phi_ = ((j + 1) * Math.PI) / 32;
      const p0 = angle2xyz(theta, phi);
      const p1 = angle2xyz(theta_, phi);
      const p2 = angle2xyz(theta, phi_);
      const p3 = angle2xyz(theta_, phi_);
      data.vertices.push(...p0, ...p2, ...p1);
      data.vertices.push(...p1, ...p2, ...p3);
      data.vertexNormals.push(...p0, ...p2, ...p1);
      data.vertexNormals.push(...p1, ...p2, ...p3);
      data.vertices.push(...p0, ...p1, ...p2);
      data.vertices.push(...p1, ...p3, ...p2);
      data.vertexNormals.push(...p0, ...p1, ...p2);
      data.vertexNormals.push(...p1, ...p3, ...p2);
    }
  }

  return data;
}

export function generateUpperBody(sides = 64) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  const angle2ellipse = (theta, a, b) => {
    var x = Math.sqrt(1 / (1 / Math.pow(a, 2) + Math.pow(Math.tan(theta), 2) / Math.pow(b, 2)));
    var z = x * Math.abs(Math.tan(theta));
    if (theta >= (Math.PI * 3) / 2) {
      z = -z;
    } else if (theta >= Math.PI) {
      x = -x;
      z = -z;
    } else if (theta >= Math.PI / 2) {
      x = -x;
    }
    return [x, 0, z];
  };

  for (var i = 0; i < sides; i++) {
    const theta = (i * 2 * Math.PI) / sides;
    const theta_ = ((i + 1) * 2 * Math.PI) / sides;
    const p0 = angle2ellipse(theta, 0.5, 0.35);
    const p1 = angle2ellipse(theta_, 0.5, 0.35);
    const p2 = vec3.add(vec3.create(), angle2ellipse(theta, 0.8, 0.4), [0, 1.2, 0]);
    const p3 = vec3.add(vec3.create(), angle2ellipse(theta_, 0.8, 0.4), [0, 1.2, 0]);
    const angle02 = Math.acos(1.2 / vec3.distance(p0, p2));
    const angle13 = Math.acos(1.2 / vec3.distance(p1, p3));
    const n0_ = vec3.normalize(vec3.create(), [
      Math.pow(0.35, 2) * p0[0],
      0,
      Math.pow(0.5, 2) * p0[2],
    ]);
    const n1_ = vec3.normalize(vec3.create(), [
      Math.pow(0.35, 2) * p1[0],
      0,
      Math.pow(0.5, 2) * p1[2],
    ]);
    const n2_ = vec3.normalize(vec3.create(), [
      Math.pow(0.4, 2) * p2[0],
      0,
      Math.pow(0.8, 2) * p2[2],
    ]);
    const n3_ = vec3.normalize(vec3.create(), [
      Math.pow(0.4, 2) * p3[0],
      0,
      Math.pow(0.8, 2) * p3[2],
    ]);
    const n0 = [Math.cos(angle02) * n0_[0], -Math.sin(angle02), Math.cos(angle02) * n0_[2]];
    const n1 = [Math.cos(angle13) * n1_[0], -Math.sin(angle13), Math.cos(angle13) * n1_[2]];
    const n2 = [Math.cos(angle02) * n2_[0], -Math.sin(angle02), Math.cos(angle02) * n2_[2]];
    const n3 = [Math.cos(angle13) * n3_[0], -Math.sin(angle13), Math.cos(angle13) * n3_[2]];
    data.vertices.push(...p0, ...p2, ...p1);
    data.vertices.push(...p1, ...p2, ...p3);
    data.vertexNormals.push(...n0, ...n2, ...n1);
    data.vertexNormals.push(...n1, ...n2, ...n3);
  }

  return data;
}

export function generateTetrahedron(radius = 1) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  const addTri = (p0, p1, p2) => {
    var avg = vec3.add(vec3.create(), p0, p1);
    avg = vec3.add(vec3.create(), avg, p2);
    avg = vec3.normalize(vec3.create(), avg);
    data.vertices.push(...p0, ...p1, ...p2);
    data.vertexNormals.push(...avg, ...avg, ...avg);
  };

  const angle2xyz = (theta, phi) => [
    radius * Math.cos(theta) * Math.sin(phi),
    radius * Math.cos(phi),
    radius * -Math.sin(theta) * Math.sin(phi),
  ];

  const p0 = [0, 1, 0];
  const p1 = angle2xyz(0, Math.PI - Math.atan(2 * Math.sqrt(2)));
  const p2 = angle2xyz((2 / 3) * Math.PI, Math.PI - Math.atan(2 * Math.sqrt(2)));
  const p3 = angle2xyz((4 / 3) * Math.PI, Math.PI - Math.atan(2 * Math.sqrt(2)));

  addTri(p0, p1, p2);
  addTri(p0, p2, p3);
  addTri(p0, p3, p1);
  addTri(p1, p3, p2);

  return data;
}

export function generateOctahedron(radius = 1) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  const addTri = (p0, p1, p2) => {
    var avg = vec3.add(vec3.create(), p0, p1);
    avg = vec3.add(vec3.create(), avg, p2);
    avg = vec3.scale(vec3.create(), avg, 1 / 3);
    data.vertices.push(...p0, ...p1, ...p2);
    data.vertexNormals.push(...avg, ...avg, ...avg);
  };

  const p0 = vec3.scale(vec3.create(), [0, -1, 0], radius);
  const p1 = vec3.scale(vec3.create(), [1, 0, 0], radius);
  const p2 = vec3.scale(vec3.create(), [0, 0, 1], radius);
  const p3 = vec3.scale(vec3.create(), [-1, 0, 0], radius);
  const p4 = vec3.scale(vec3.create(), [0, 0, -1], radius);
  const p5 = vec3.scale(vec3.create(), [0, 1, 0], radius);

  addTri(p0, p1, p2);
  addTri(p0, p2, p3);
  addTri(p0, p3, p4);
  addTri(p0, p4, p1);
  addTri(p5, p2, p1);
  addTri(p5, p3, p2);
  addTri(p5, p4, p3);
  addTri(p5, p1, p4);

  return data;
}

export function generateDodecahedron(radius = 1) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  const addTri = (p0, p1, p2) => {
    var avg = vec3.add(vec3.create(), p0, p1);
    avg = vec3.add(vec3.create(), avg, p2);
    avg = vec3.scale(vec3.create(), avg, 1 / 3);
    avg = vec3.normalize(vec3.create(), avg);
    data.vertices.push(...p0, ...p1, ...p2);
    data.vertexNormals.push(...avg, ...avg, ...avg);
  };

  const addPentagon = (p0, p1, p2, p3, p4) => {
    var avg = vec3.add(vec3.create(), p0, p1);
    avg = vec3.add(vec3.create(), avg, p2);
    avg = vec3.add(vec3.create(), avg, p3);
    avg = vec3.add(vec3.create(), avg, p4);
    avg = vec3.normalize(vec3.create(), avg);
    data.vertices.push(...p0, ...p1, ...p2);
    data.vertices.push(...p0, ...p2, ...p3);
    data.vertices.push(...p0, ...p3, ...p4);
    for (var i = 0; i < 9; i++) data.vertexNormals.push(...avg);
  };

  const angle2xyz = (theta, phi) => [
    radius * Math.cos(theta) * Math.sin(phi),
    radius * Math.cos(phi),
    radius * -Math.sin(theta) * Math.sin(phi),
  ];

  const alpha = Math.acos(
    (2 * Math.sqrt(25 + 11 * Math.sqrt(5))) / (Math.sqrt(10) * (Math.sqrt(3) + Math.sqrt(15)))
  );
  const beta = Math.asin(2 / (Math.sqrt(3) + Math.sqrt(15)));

  const p01 = angle2xyz(0, alpha);
  const p02 = angle2xyz((2 / 5) * Math.PI, alpha);
  const p03 = angle2xyz((4 / 5) * Math.PI, alpha);
  const p04 = angle2xyz((6 / 5) * Math.PI, alpha);
  const p05 = angle2xyz((8 / 5) * Math.PI, alpha);

  const p11 = angle2xyz(0, alpha + 2 * beta);
  const p12 = angle2xyz((2 / 5) * Math.PI, alpha + 2 * beta);
  const p13 = angle2xyz((4 / 5) * Math.PI, alpha + 2 * beta);
  const p14 = angle2xyz((6 / 5) * Math.PI, alpha + 2 * beta);
  const p15 = angle2xyz((8 / 5) * Math.PI, alpha + 2 * beta);

  const p21 = angle2xyz((1 / 5) * Math.PI, Math.PI - alpha - 2 * beta);
  const p22 = angle2xyz((3 / 5) * Math.PI, Math.PI - alpha - 2 * beta);
  const p23 = angle2xyz((5 / 5) * Math.PI, Math.PI - alpha - 2 * beta);
  const p24 = angle2xyz((7 / 5) * Math.PI, Math.PI - alpha - 2 * beta);
  const p25 = angle2xyz((9 / 5) * Math.PI, Math.PI - alpha - 2 * beta);

  const p31 = angle2xyz((1 / 5) * Math.PI, Math.PI - alpha);
  const p32 = angle2xyz((3 / 5) * Math.PI, Math.PI - alpha);
  const p33 = angle2xyz((5 / 5) * Math.PI, Math.PI - alpha);
  const p34 = angle2xyz((7 / 5) * Math.PI, Math.PI - alpha);
  const p35 = angle2xyz((9 / 5) * Math.PI, Math.PI - alpha);

  addPentagon(p01, p02, p03, p04, p05);
  addPentagon(p01, p11, p21, p12, p02);
  addPentagon(p02, p12, p22, p13, p03);
  addPentagon(p03, p13, p23, p14, p04);
  addPentagon(p04, p14, p24, p15, p05);
  addPentagon(p05, p15, p25, p11, p01);

  addPentagon(p35, p34, p33, p32, p31);
  addPentagon(p35, p25, p15, p24, p34);
  addPentagon(p34, p24, p14, p23, p33);
  addPentagon(p33, p23, p13, p22, p32);
  addPentagon(p32, p22, p12, p21, p31);
  addPentagon(p31, p21, p11, p25, p35);

  return data;
}

export function generateIcosahedron(radius = 1) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  const addTri = (p0, p1, p2) => {
    var avg = vec3.add(vec3.create(), p0, p1);
    avg = vec3.add(vec3.create(), avg, p2);
    avg = vec3.scale(vec3.create(), avg, 1 / 3);
    data.vertices.push(...p0, ...p1, ...p2);
    data.vertexNormals.push(...avg, ...avg, ...avg);
  };

  const angle2xyz = (theta, phi) => [
    radius * Math.cos(theta) * Math.sin(phi),
    radius * Math.cos(phi),
    radius * -Math.sin(theta) * Math.sin(phi),
  ];

  const alpha = 2 * Math.asin(Math.sqrt(2) / Math.sqrt(5 + Math.sqrt(5)));

  const p00 = [0, radius, 0];
  const p01 = angle2xyz(0, alpha);
  const p02 = angle2xyz((2 / 5) * Math.PI, alpha);
  const p03 = angle2xyz((4 / 5) * Math.PI, alpha);
  const p04 = angle2xyz((6 / 5) * Math.PI, alpha);
  const p05 = angle2xyz((8 / 5) * Math.PI, alpha);

  const p10 = [0, -radius, 0];
  const p11 = angle2xyz((1 / 5) * Math.PI, Math.PI - alpha);
  const p12 = angle2xyz((3 / 5) * Math.PI, Math.PI - alpha);
  const p13 = angle2xyz((5 / 5) * Math.PI, Math.PI - alpha);
  const p14 = angle2xyz((7 / 5) * Math.PI, Math.PI - alpha);
  const p15 = angle2xyz((9 / 5) * Math.PI, Math.PI - alpha);

  addTri(p00, p01, p02);
  addTri(p00, p02, p03);
  addTri(p00, p03, p04);
  addTri(p00, p04, p05);
  addTri(p00, p05, p01);

  addTri(p10, p15, p14);
  addTri(p10, p14, p13);
  addTri(p10, p13, p12);
  addTri(p10, p12, p11);
  addTri(p10, p11, p15);

  addTri(p01, p11, p02);
  addTri(p02, p12, p03);
  addTri(p03, p13, p04);
  addTri(p04, p14, p05);
  addTri(p05, p15, p01);

  addTri(p11, p12, p02);
  addTri(p12, p13, p03);
  addTri(p13, p14, p04);
  addTri(p14, p15, p05);
  addTri(p15, p11, p01);

  return data;
}
