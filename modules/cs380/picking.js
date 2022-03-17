import gl from "../gl.js";
import { vec3 } from "./gl-matrix.js";
import { BaseShader } from "./base_shader.js";
import { RenderObject } from "./render_object.js";

const MAX_PICKING_ID = 256 * 256 * 256 - 1;

export class PickableObject extends RenderObject {
  constructor(mesh, shader, pickingShader, id) {
    super(mesh, shader);
    this.pickingShader = pickingShader;
    this.pickingID = id;
  }

  get pickingID() {
    const [r, g, b] = this.uniforms.pickingID;
    return (
      Math.round(r * 255) * 256 * 256 +
      Math.round(g * 255) * 256 +
      Math.round(b * 255)
    );
  }

  set pickingID(id) {
    if (!Number.isSafeInteger(id) || id > MAX_PICKING_ID || id < 0) {
      console.warn(`Setting ${id} as picking id is not safe!`);
    }
    const r = (id >> 16) / 255;
    const g = ((id & 0xffff) >> 8) / 255;
    const b = (id & 0xff) / 255;
    this.uniforms.pickingID = vec3.fromValues(r, g, b);
  }

  renderPicking(cam) {
    this.render(cam, this.pickingShader);
  }
}

export class PickingShader extends BaseShader {
  static get source() {
    return [
      [gl.VERTEX_SHADER, "resources/picking.vert"],
      [gl.FRAGMENT_SHADER, "resources/picking.frag"],
    ];
  }

  constructor() {
    super();
  }

  generateUniformLocations() {
    return {
      // Below three are must-have uniform variables,
      projectionMatrix: gl.getUniformLocation(this.program, "projectionMatrix"),
      cameraTransform: gl.getUniformLocation(this.program, "cameraTransform"),
      modelTransform: gl.getUniformLocation(this.program, "modelTransform"),

      // Shader-specific uniforms
      pickingID: gl.getUniformLocation(this.program, "pickingID"),
    };
  }

  setUniforms(kv) {
    this.setUniformMat4(kv, "projectionMatrix");
    this.setUniformMat4(kv, "cameraTransform");
    this.setUniformMat4(kv, "modelTransform");

    this.setUniformVec3(kv, "pickingID");
  }
}

export class PickingBuffer {
  constructor() {
    this.finalize();
  }

  finalize() {
    gl.deleteTexture(this.id);
    gl.deleteRenderbuffer(this.dbo);
    gl.deleteFramebuffer(this.fbo);
    this.initialized = false;
  }

  initialize(width, height) {
    if (this.initialized) this.finalize();

    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    this.id = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.id);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
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
      this.id,
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

  pick(x, y) {
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.fbo);
    gl.readBuffer(gl.COLOR_ATTACHMENT0);

    const pixel = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    return pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2];
  }
}
