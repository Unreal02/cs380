import gl from "../gl.js";

export class BaseShader {
  constructor() {
    this.info = null;
    this.initialized = false;
  }

  initialize(shaderSources) {
    if (this.initialized) this.finalize();
    this.shaders = this.initShader(shaderSources);
    this.program = this.initProgram(this.shaders);
    this.uniformLocations = this.generateUniformLocations();
    this.initialized = true;
  }

  finalize() {
    if (!this.initialized) return;
    for (const shader of this.shaders) gl.deleteShader(shader);

    gl.deleteProgram(this.program);
    this.info = null;
    this.initialized = false;
  }

  initShader(shaderSources) {
    const shaders = [];
    for (const [type, source] of shaderSources) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(
          "An error occurred compile the shader: " + gl.getShaderInfoLog(shader)
        );
      shaders.push(shader);
    }
    return shaders;
  }

  initProgram(shaders) {
    const program = gl.createProgram();
    for (const shader of shaders) {
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      alert(
        "Unable to initialize the shader program: " +
          gl.getProgramInfoLog(program)
      );
      return null;
    }

    return program;
  }

  static get source() {
    throw new Error("Should be implemented in subclasses!");
  }

  generateUniformLocations() {
    throw new Error("Should be implemented in subclasses!");
  }

  setUniforms(kv) {
    // optionally implement in subclasses.
    //  use helper functions below
  }

  setUniformMat4(kv, key) {
    if (key in kv) {
      gl.uniformMatrix4fv(this.uniformLocations[key], false, kv[key]);
    }
  }

  setUniformTexture(kv, key, textureIndex) {
    if (key in kv) {
      gl.uniform1i(this.uniformLocations[key], textureIndex);
      gl.activeTexture(gl.TEXTURE0 + textureIndex);
      gl.bindTexture(gl.TEXTURE_2D, kv[key]);
    }
  }

  setUniformCubemap(kv, key, textureIndex) {
    if (key in kv) {
      gl.uniform1i(this.uniformLocations[key], textureIndex);
      gl.activeTexture(gl.TEXTURE0 + textureIndex);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, kv[key]);
    }
  }

  setUniformFloat(kv, key, init) {
    if (key in kv) {
      gl.uniform1f(this.uniformLocations[key], kv[key]);
    } else if (init) {
      gl.uniform1f(this.uniformLocations[key], init);
    }
  }

  setUniformInt(kv, key, init) {
    if (key in kv) {
      gl.uniform1i(this.uniformLocations[key], kv[key]);
    } else if (init) {
      gl.uniform1i(this.uniformLocations[key], init);
    }
  }

  setUniformVec3(kv, key, ...init) {
    if (key in kv) {
      gl.uniform3fv(this.uniformLocations[key], kv[key]);
    } else if (init.length > 0) {
      gl.uniform3fv(this.uniformLocations[key], init);
    }
  }

  setUniformVec2(kv, key, ...init) {
    if (key in kv) {
      gl.uniform2fv(this.uniformLocations[key], kv[key]);
    } else if (init.length > 0) {
      gl.uniform2fv(this.uniformLocations[key], init);
    }
  }
}

export class ShaderLoader {
  static async load(options) {
    const loadResult = {};
    const promiseGenerator = async (key, option) => {
      const subPromises = [];
      for (const [type, path] of option) {
        subPromises.push(this.loadShader(type, path));
      }
      const result = await Promise.all(subPromises);
      loadResult[key] = result;
    };
    const promises = [];
    for (const key of Object.keys(options)) {
      promises.push(promiseGenerator(key, options[key]));
    }
    await Promise.all(promises);
    return loadResult;
  }

  static async loadSingle(option) {
    const result = await this.load({ target: option });
    return result.target;
  }

  static async loadShader(type, path) {
    const response = await fetch(path);
    const source = await response.text();
    return [type, source];
  }
}

export async function buildShader(ShaderClass, ...args) {
  const sources = await ShaderLoader.loadSingle(ShaderClass.source);
  const shader = new ShaderClass(...args);
  shader.initialize(sources);

  return shader;
}
