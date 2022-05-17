import gl from "../gl.js";
import { vec3, mat4, quat, glMatrix } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";
import { Skybox, SkyboxShader } from "../skybox_shader.js";

class TextureShader extends cs380.BaseShader {
  static get source() {
    return [
      [gl.VERTEX_SHADER, "resources/uv_simple.vert"],
      [gl.FRAGMENT_SHADER, "resources/uv_simple.frag"],
    ];
  }
  generateUniformLocations() {
    return {
      projectionMatrix: gl.getUniformLocation(this.program, "projectionMatrix"),
      cameraTransform: gl.getUniformLocation(this.program, "cameraTransform"),
      modelTransform: gl.getUniformLocation(this.program, "modelTransform"),
      mainTexture: gl.getUniformLocation(this.program, "mainTexture"),
    };
  }
  setUniforms(kv) {
    this.setUniformMat4(kv, "projectionMatrix");
    this.setUniformMat4(kv, "cameraTransform");
    this.setUniformMat4(kv, "modelTransform");
    this.setUniformTexture(kv, "mainTexture", 0);
  }
}

export default class Lab8App extends cs380.BaseApp {
  async initialize() {
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Basic setup for camera
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 0, 5);
    mat4.perspective(
      this.camera.projectionMatrix,
      (45 * Math.PI) / 180,
      gl.canvas.clientWidth / gl.canvas.clientHeight,
      0.01,
      100
    );
    const cameraCenter = vec3.create();
    this.orbitControl = new cs380.utils.SimpleOrbitControl(this.camera, cameraCenter);

    // things to finalize()
    this.thingsToClear = [];

    // Rest of initialization below
    const textureLoader = cs380.TextureLoader.load({
      uv_checker: "resources/uv_checker.png",

      posX: "resources/skybox/right.jpg",
      negX: "resources/skybox/left.jpg",
      posY: "resources/skybox/top.jpg",
      negY: "resources/skybox/bottom.jpg",
      posZ: "resources/skybox/front.jpg",
      negZ: "resources/skybox/back.jpg",
    });

    const shaderLoader = cs380.ShaderLoader.load({
      skyboxShader: SkyboxShader.source,
      textureShader: TextureShader.source,
    });

    const loaderResult = await Promise.all([textureLoader, shaderLoader]);
    const textureLoaderResult = loaderResult[0];
    const shaderLoaderResult = loaderResult[1];

    // create Skybox
    // generate cubemap texture
    const cubemap = new cs380.Cubemap();
    this.thingsToClear.push(cubemap);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    cubemap.initialize([
      [gl.TEXTURE_CUBE_MAP_POSITIVE_X, textureLoaderResult.posX],
      [gl.TEXTURE_CUBE_MAP_NEGATIVE_X, textureLoaderResult.negX],
      [gl.TEXTURE_CUBE_MAP_POSITIVE_Y, textureLoaderResult.posY],
      [gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, textureLoaderResult.negY],
      [gl.TEXTURE_CUBE_MAP_POSITIVE_Z, textureLoaderResult.posZ],
      [gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, textureLoaderResult.negZ],
    ]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const skyboxShader = new SkyboxShader();
    this.thingsToClear.push(skyboxShader);
    skyboxShader.initialize(shaderLoaderResult.skyboxShader);

    const cubeMeshData = cs380.primitives.generateCube();
    const skyboxMesh = cs380.Mesh.fromData(cubeMeshData);

    this.thingsToClear.push(skyboxMesh);
    this.skybox = new Skybox(skyboxMesh, skyboxShader);
    this.skybox.uniforms.mainTexture = cubemap.id;

    // Render textured cube and bunny with TextureShader
    const textureShader = new TextureShader();
    this.thingsToClear.push(textureShader);
    textureShader.initialize(shaderLoaderResult.textureShader);

    // create uvChecker texture
    const uvCheckerTexture = new cs380.Texture();
    this.thingsToClear.push(uvCheckerTexture);
    uvCheckerTexture.initialize(textureLoaderResult.uv_checker);

    //create cube
    const cubeMesh = cs380.Mesh.fromData(cubeMeshData);
    this.thingsToClear.push(cubeMesh);
    this.cube = new cs380.RenderObject(cubeMesh, textureShader);
    this.cube.uniforms.mainTexture = uvCheckerTexture.id;
    vec3.set(this.cube.transform.localPosition, -1.2, 0, 0);

    // TODO: create 'RenderObejct this.bunny' with 'textureShader and 'uvCheckerTexture' tecture.
    const meshLoaderResult = await cs380.MeshLoader.load({
      bunny: "resources/models/bunny.obj",
    });
    const bunnyMesh = cs380.Mesh.fromData(meshLoaderResult.bunny);
    this.thingsToClear.push(bunnyMesh);
    this.bunny = new cs380.RenderObject(bunnyMesh, textureShader);
    this.cube.uniforms.mainTexture = uvCheckerTexture.id;
    vec3.set(this.bunny.transform.localPosition, 1.2, 0, 0);
    vec3.set(this.bunny.transform.localScale, 0.5, 0.5, 0.5);
  }

  finalize() {
    // Finalize WebGL objects (mesh, shader, texture, ...)
    for (const thing of this.thingsToClear) {
      thing.finalize();
    }
  }

  update(elapsed, dt) {
    // Updates before rendering here
    this.orbitControl.update(dt);

    // Clear canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rest of rendering below
    this.skybox.render(this.camera);
    this.cube.render(this.camera);

    //TODO: render this.bunny here
    this.bunny.render(this.camera);
  }
}
