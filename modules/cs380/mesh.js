import gl from "../gl.js";

export class Mesh {
  static fromData(data) {
    const out = new Mesh();
    MeshLoader.buildMesh(out, data);
    out.initialize();
    return out;
  }

  constructor() {
    this.finalize();
  }

  finalize() {
    if (this.vbo) {
      gl.deleteBuffer(this.vbo);
      this.vbo = undefined;
    }
    if (this.ibo) {
      gl.deleteBuffer(this.ibo);
      this.ibo = undefined;
    }
    if (this.vao) {
      gl.bindVertexArray(this.vao);
      for (let i = 0; i < this.numAttribs; i++) gl.disableVertexAttribArray(i);
      gl.bindVertexArray(null);
      gl.deleteVertexArray(this.vao);
      this.vao = undefined;
    }
    this.drawMode = gl.TRIANGLES;
    this.hasIndex = false;
    this.vertexData = [];
    this.indexData = [];
    this.attributeSize = [];
    this.numAttribs = 0;
    this.numElements = 0;
    this.initialized = false;
  }

  addAttribute(size) {
    this.attributeSize.push(size);
  }

  addVertexData(...args) {
    this.vertexData.push(...args);
  }

  addIndexData(...args) {
    this.hasIndex = true;
    this.indexData.push(...args);
  }

  initialize() {
    if (this.initialized) this.finalize();

    // Initialize VBO
    if (this.attributeSize.length == 0) {
      throw new Error("Cannot initialize a mesh with no attributes!");
    }
    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.vertexData),
      gl.STATIC_DRAW
    );

    // Initialize VAO
    this.vao = gl.createVertexArray();
    this.numAttribs = this.attributeSize.length;

    const vertexElems = this.attributeSize.reduce((sum, val) => sum + val, 0);
    const vertexSize = vertexElems * 4; // sizeof(float) == 4
    gl.bindVertexArray(this.vao);
    let offset = 0;
    for (let i = 0; i < this.numAttribs; i++) {
      const attribSize = this.attributeSize[i];
      gl.vertexAttribPointer(
        i,
        attribSize,
        gl.FLOAT,
        false,
        vertexSize,
        offset
      );
      gl.enableVertexAttribArray(i);
      offset += attribSize * 4; // sizeof(float) == 4
    }

    this.numElements = this.vertexData.length / vertexElems;

    // Initialize IBO (if mesh is indexed)
    if (this.hasIndex) {
      this.numElements = this.indexData.length;
      this.ibo = gl.createBuffer();

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(this.indexData),
        gl.STATIC_DRAW
      );
    }

    gl.bindVertexArray(null);
    this.initialized = true;
  }
}

export class MeshLoader {
  static async load(paths) {
    const loadPromise = new Promise((resolve) => {
      OBJ.downloadMeshes(paths, resolve);
    });
    return await loadPromise;
  }

  static async loadSingle(path) {
    const result = await this.load({ target: path });
    return result.target;
  }

  static computeTangents(data) {
    data.tangents = [...new Array(data.vertices.length)].map((_) => 0);
    const tangents = data.tangents;
    const indices = data.indices;
    const vertices = data.vertices;
    const normals = data.vertexNormals;
    const uvs = data.textures;

    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i + 0];
      const i1 = indices[i + 1];
      const i2 = indices[i + 2];

      const x_v0 = vertices[i0 * 3 + 0];
      const y_v0 = vertices[i0 * 3 + 1];
      const z_v0 = vertices[i0 * 3 + 2];

      const x_uv0 = uvs[i0 * 2 + 0];
      const y_uv0 = uvs[i0 * 2 + 1];

      const x_v1 = vertices[i1 * 3 + 0];
      const y_v1 = vertices[i1 * 3 + 1];
      const z_v1 = vertices[i1 * 3 + 2];

      const x_uv1 = uvs[i1 * 2 + 0];
      const y_uv1 = uvs[i1 * 2 + 1];

      const x_v2 = vertices[i2 * 3 + 0];
      const y_v2 = vertices[i2 * 3 + 1];
      const z_v2 = vertices[i2 * 3 + 2];

      const x_uv2 = uvs[i2 * 2 + 0];
      const y_uv2 = uvs[i2 * 2 + 1];

      const x_deltaPos1 = x_v1 - x_v0;
      const y_deltaPos1 = y_v1 - y_v0;
      const z_deltaPos1 = z_v1 - z_v0;

      const x_deltaPos2 = x_v2 - x_v0;
      const y_deltaPos2 = y_v2 - y_v0;
      const z_deltaPos2 = z_v2 - z_v0;

      const x_uvDeltaPos1 = x_uv1 - x_uv0;
      const y_uvDeltaPos1 = y_uv1 - y_uv0;

      const x_uvDeltaPos2 = x_uv2 - x_uv0;
      const y_uvDeltaPos2 = y_uv2 - y_uv0;

      const rInv =
        x_uvDeltaPos1 * y_uvDeltaPos2 - y_uvDeltaPos1 * x_uvDeltaPos2;
      const r = 1.0 / Math.abs(rInv < 0.0001 ? 1.0 : rInv);

      // Tangent
      const x_tangent =
        (x_deltaPos1 * y_uvDeltaPos2 - x_deltaPos2 * y_uvDeltaPos1) * r;
      const y_tangent =
        (y_deltaPos1 * y_uvDeltaPos2 - y_deltaPos2 * y_uvDeltaPos1) * r;
      const z_tangent =
        (z_deltaPos1 * y_uvDeltaPos2 - z_deltaPos2 * y_uvDeltaPos1) * r;

      // Gram-Schmidt orthogonalize
      //t = glm::normalize(t - n * glm:: dot(n, t));
      const x_n0 = normals[i0 * 3 + 0];
      const y_n0 = normals[i0 * 3 + 1];
      const z_n0 = normals[i0 * 3 + 2];

      const x_n1 = normals[i1 * 3 + 0];
      const y_n1 = normals[i1 * 3 + 1];
      const z_n1 = normals[i1 * 3 + 2];

      const x_n2 = normals[i2 * 3 + 0];
      const y_n2 = normals[i2 * 3 + 1];
      const z_n2 = normals[i2 * 3 + 2];

      // Tangent
      const n0_dot_t = x_tangent * x_n0 + y_tangent * y_n0 + z_tangent * z_n0;
      const n1_dot_t = x_tangent * x_n1 + y_tangent * y_n1 + z_tangent * z_n1;
      const n2_dot_t = x_tangent * x_n2 + y_tangent * y_n2 + z_tangent * z_n2;

      const x_resTangent0 = x_tangent - x_n0 * n0_dot_t;
      const y_resTangent0 = y_tangent - y_n0 * n0_dot_t;
      const z_resTangent0 = z_tangent - z_n0 * n0_dot_t;

      const x_resTangent1 = x_tangent - x_n1 * n1_dot_t;
      const y_resTangent1 = y_tangent - y_n1 * n1_dot_t;
      const z_resTangent1 = z_tangent - z_n1 * n1_dot_t;

      const x_resTangent2 = x_tangent - x_n2 * n2_dot_t;
      const y_resTangent2 = y_tangent - y_n2 * n2_dot_t;
      const z_resTangent2 = z_tangent - z_n2 * n2_dot_t;

      const magTangent0 = Math.sqrt(
        x_resTangent0 * x_resTangent0 +
          y_resTangent0 * y_resTangent0 +
          z_resTangent0 * z_resTangent0
      );
      const magTangent1 = Math.sqrt(
        x_resTangent1 * x_resTangent1 +
          y_resTangent1 * y_resTangent1 +
          z_resTangent1 * z_resTangent1
      );
      const magTangent2 = Math.sqrt(
        x_resTangent2 * x_resTangent2 +
          y_resTangent2 * y_resTangent2 +
          z_resTangent2 * z_resTangent2
      );

      tangents[i0 * 3 + 0] += x_resTangent0 / magTangent0;
      tangents[i0 * 3 + 1] += y_resTangent0 / magTangent0;
      tangents[i0 * 3 + 2] += z_resTangent0 / magTangent0;

      tangents[i1 * 3 + 0] += x_resTangent1 / magTangent1;
      tangents[i1 * 3 + 1] += y_resTangent1 / magTangent1;
      tangents[i1 * 3 + 2] += z_resTangent1 / magTangent1;

      tangents[i2 * 3 + 0] += x_resTangent2 / magTangent2;
      tangents[i2 * 3 + 1] += y_resTangent2 / magTangent2;
      tangents[i2 * 3 + 2] += z_resTangent2 / magTangent2;
    }
  }

  static buildMesh(mesh, data, buildTangent = false) {
    const numVertices = data.vertices.length / 3;
    const hasNormals = data.vertexNormals.length > 0;
    const hasUVs = data.textures.length > 0;
    const hasTangents = hasNormals && hasUVs && buildTangent;
    const hasIndices = data.indices.length > 0;
    if (hasTangents) this.computeTangents(data);

    mesh.addAttribute(3); // position
    if (hasNormals) mesh.addAttribute(3); // normal
    if (hasUVs) mesh.addAttribute(2); // uv
    if (hasTangents) mesh.addAttribute(3);
    for (let v = 0; v < numVertices; v++) {
      mesh.addVertexData(
        data.vertices[3 * v + 0],
        data.vertices[3 * v + 1],
        data.vertices[3 * v + 2]
      );
      if (hasNormals)
        mesh.addVertexData(
          data.vertexNormals[3 * v + 0],
          data.vertexNormals[3 * v + 1],
          data.vertexNormals[3 * v + 2]
        );
      if (hasUVs)
        mesh.addVertexData(data.textures[2 * v + 0], data.textures[2 * v + 1]);
      if (hasTangents)
        mesh.addVertexData(
          data.tangents[3 * v + 0],
          data.tangents[3 * v + 1],
          data.tangents[3 * v + 2]
        );
    }

    if (hasIndices) {
      data.indices.forEach((i) => mesh.addIndexData(i));
      //mesh.addIndexData(...data.indices); // stack overflow
    }
  }
}
