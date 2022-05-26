import gl from "../gl.js";
import { vec3, mat4, quat, glMatrix } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import { Skybox, SkyboxShader } from "../skybox_shader.js";
import { TextureShader } from "../texture_shader.js";
import { PipEdgeShader } from "../pip_edge_shader.js";

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
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      width,
      height,
      0,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      null
    );

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.colorTexture,
      0
    );

    this.dbo = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.dbo);
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      width,
      height
    );

    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      this.dbo
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}

class Pip {
  async initialize(width, height, trans, scale) {
    this.framebuffer = new Framebuffer();
    this.framebuffer.initialize(width, height);

    const planeMeshData = cs380.primitives.generatePlane(1,1);
    const planeMesh = cs380.Mesh.fromData(planeMeshData);
    const shader = await cs380.buildShader(PipEdgeShader);
    
    this.transform = new cs380.Transform();
    quat.rotateY(this.transform.localRotation, quat.create(), Math.PI);

    this.image = new cs380.RenderObject(planeMesh, shader);
    this.image.uniforms.useScreenSpace = true;
    this.image.uniforms.useColor = false;
    this.image.uniforms.mainTexture = this.framebuffer.colorTexture;
    this.image.uniforms.width = width;
    this.image.uniforms.height = height;
    this.image.transform.localPosition = trans;
    this.image.transform.localScale = scale;
    this.image.transform.setParent(this.transform);

    this.thingsToClear = [shader, planeMesh, this.framebuffer];
  }

  render(camera) {
    const prevDepthFunc = gl.getParameter(gl.DEPTH_FUNC);
    gl.depthFunc(gl.ALWAYS);
    this.image.render(camera);
    gl.depthFunc(prevDepthFunc);
  }
  finalize(){
    for (const thing of this.thingsToClear){
      thing.finalize();    
    }
  }
}

export default class Lab9App extends cs380.BaseApp {
  async initialize() {
    const { width, height } = gl.canvas.getBoundingClientRect();
    this.width = width;
    this.height = height;
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Basic setup for camera
    this.camera = new cs380.Camera();
    vec3.set(
      this.camera.transform.localPosition,
      0, 0, 5
    );
    mat4.perspective(
      this.camera.projectionMatrix,
      45 * Math.PI / 180,
      gl.canvas.clientWidth / gl.canvas.clientHeight,
      0.01,
      100
    );
    const cameraCenter = vec3.create()
    this.orbitControl = new cs380.utils.SimpleOrbitControl(this.camera, cameraCenter);

    // things to finalize()
    this.thingsToClear = [];

    // Rest of initialization below
    const textureLoader = cs380.TextureLoader.load({
      uv_checker: 'resources/uv_checker.png',

      posX: 'resources/skybox/right.jpg',
      negX: 'resources/skybox/left.jpg',
      posY: 'resources/skybox/top.jpg',
      negY: 'resources/skybox/bottom.jpg',
      posZ: 'resources/skybox/front.jpg',
      negZ: 'resources/skybox/back.jpg',
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
      [gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, textureLoaderResult.negZ]
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
    vec3.set(this.cube.transform.localPosition, 0, 0, 0);

    //create pip
    this.picture = new Pip();
    this.thingsToClear.push(this.picture);
    await this.picture.initialize(width, height, 
      vec3.fromValues(0.0, 0.75, 0.0), //translation
      vec3.fromValues(0.5, 0.5, 0.5)); //scale
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
    
    // TODO: render to texture of plane this.picture using renderImage("put correct variables here").
    // render the objects function to the canvas using renderImage().
    // render the plane this.picture to the canvas.

  }
  renderScene() {
    this.skybox.render(this.camera);
    this.cube.render(this.camera);
  }

  renderImage(fbo = null, width = null, height = null) {
    // Parameters:
    //  * fbo: Target framebuffer object, default is to the canvas
    //  * width: Width of the target framebuffer, default is canvas'
    //  * height: Height of the target framebuffer default is canvas'

    if (!width) width = this.width;
    if (!height) height = this.height;

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