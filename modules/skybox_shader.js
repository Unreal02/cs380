import gl from './gl.js'

import * as cs380 from './cs380/cs380.js'

export class SkyboxShader extends cs380.BaseShader {
  2
  static get source() {
    return [
      [gl.VERTEX_SHADER, 'resources/skybox.vert'],
      [gl.FRAGMENT_SHADER, 'resources/skybox.frag']
    ];
  }

  generateUniformLocations() {
    return {
      projectionMatrix: gl.getUniformLocation(this.program, 'projectionMatrix'),
      cameraTransform: gl.getUniformLocation(this.program, 'cameraTransform'),
      modelTransform: gl.getUniformLocation(this.program, 'modelTransform'),
      mainTexture: gl.getUniformLocation(this.program, 'mainTexture'),
    };
  }

  setUniforms(kv) {
    this.setUniformMat4(kv, 'projectionMatrix');
    this.setUniformMat4(kv, 'cameraTransform');
    this.setUniformMat4(kv, 'modelTransform');
    this.setUniformCubemap(kv, 'mainTexture', 0);
  }
}

export class Skybox extends cs380.RenderObject {
  render(cam) {
    const prevCullMode = gl.getParameter(gl.CULL_FACE_MODE);
    const prevDepthMask = gl.getParameter(gl.DEPTH_WRITEMASK);
    gl.cullFace(prevCullMode == gl.BACK ? gl.FRONT : gl.BACK);
    gl.depthMask(false);
    super.render(cam);
    gl.cullFace(prevCullMode);
    gl.depthMask(prevDepthMask);
  }
}
