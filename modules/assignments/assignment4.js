import gl from "../gl.js";
import { vec3, mat4, quat } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import { UnlitTextureShader } from "../unlit_texture_shader.js";

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

class PhotoFilm {
  async initialize(width, height) {
    this.enabled = false;
    this.printFinished = false;
    this.width = width;
    this.height = height;

    this.framebuffer = new Framebuffer();
    this.framebuffer.initialize(width, height);

    const planeMeshData = cs380.primitives.generatePlane(1,1);
    const planeMesh = cs380.Mesh.fromData(planeMeshData);
    const shader = await cs380.buildShader(UnlitTextureShader);
    
    this.transform = new cs380.Transform();
    quat.rotateY(this.transform.localRotation, quat.create(), Math.PI);

    this.background = new cs380.RenderObject(planeMesh, shader);
    this.background.uniforms.useScreenSpace = true;
    this.background.uniforms.useColor = true;
    this.background.uniforms.solidColor = vec3.fromValues(1,1,1);
    vec3.set(this.background.transform.localScale, 1.2, 1.4, 1);
    this.background.transform.setParent(this.transform);

    this.image = new cs380.RenderObject(planeMesh, shader);
    this.image.uniforms.useScreenSpace = true;
    this.image.uniforms.useColor = false;
    this.image.uniforms.mainTexture = this.framebuffer.colorTexture;
    vec3.set(this.image.transform.localPosition, 0, 0.1, 0);
    this.image.transform.setParent(this.transform);

    this.thingsToClear = [shader, planeMesh, this.framebuffer];

    this.handleMouseDown = (e) => {
      if (this.printFinished) this.hide();
    }
    document.addEventListener("mousedown", this.handleMouseDown);
  }

  render(camera) {
    if (!this.enabled) return;
    const prevDepthFunc = gl.getParameter(gl.DEPTH_FUNC);
    gl.depthFunc(gl.ALWAYS);
    this.background.render(camera);
    this.image.render(camera);
    gl.depthFunc(prevDepthFunc);
  }

  finalize() {
    for (const thing of this.thingsToClear) {
      thing.finalize();
    }

    document.removeEventListener("mousedown", this.handleMouseDown);
  }

  show(elapsed) {
    this.enabled = true;
    this.printFinished = false;
    this.showStartTime = elapsed;
  }

  update(elapsed) {
    if (!this.enabled) return;
    const time = elapsed - this.showStartTime;
    let yPos = 2 - Math.min(2, time * 0.8);
    this.transform.localPosition[1] = yPos;

    this.printFinished = yPos < 0.001;
  }

  hide() {
    this.enabled = false;
  }
}

export default class Assignment4 extends cs380.BaseApp {
  async initialize() {
    // Basic setup for camera
    const { width, height } = gl.canvas.getBoundingClientRect();
    const aspectRatio = width / height;
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 2, 9);
    this.camera.transform.lookAt(vec3.fromValues(0, -1, -9));
    mat4.perspective(
      this.camera.projectionMatrix,
      (45 * Math.PI) / 180,
      aspectRatio,
      0.01,
      1000
    );

    this.width = width;
    this.height = height;

    // Rest of initialization below
    this.thingsToClear = [];

    this.photo = new PhotoFilm()
    await this.photo.initialize(width, height);
    this.thingsToClear.push(this.photo);

    // TODO: initialize your object + scene here
    


    // Setup GUIs
    // TODO: add camera effects of your own
    // Change "my-effect" and "My camera effect" to fitting name for your effect.
    // You can add multiple options.
    document.getElementById("settings").innerHTML = `
      <!-- Camera shutter UI --> 
      <audio id="shutter-sfx">
        <source src="resources/shutter_sfx.ogg" type="audio/ogg">
      </audio> 
      <button type="button" id="shutter">Take a picture!</button><br/>

      <!-- TODO: Add camera effect lists here --> 
      <label for="setting-effect">Camera effect</label>
      <select id="setting-effect">
        <option value="none">None</option>
        <option value="my-effect">My camera effect</option>
      </select> <br/>

      <!-- OPTIONAL: Add more UI elements here --> 

      <h3>Basic requirements</h3>
      <ul>
        <li>Reuse HW1 Animated Background [1 pt]</li>
        <li>Reuse HW2: Avatar with adjustable pose [0.5 pt]</li>
        <li>Reuse HW3: Phong shading lightings [1 pt]</li>
        <li>Skybox [0.5 pt] </li>
        <li>Camera Effects [2 pt] </li>
        <li>Show some creativity in your scene [1 pts]</li>
      </ul>
      Implement creative camera effects for your virtual camera booth. <br/>
      <strong>Have fun!</strong>
    `;

    const shutterAudio = document.getElementById('shutter-sfx');
    document.getElementById('shutter').onclick = () => {
      this.shutterPressed = true;
      shutterAudio.play();
    };

    this.camereEffect = 'none';
    cs380.utils.setInputBehavior(
      'setting-effect',
      (val) => { this.camereEffect = val; },
      true,
      false
    );
  }

  finalize() {
    // Finalize WebGL objects (mesh, shader, texture, ...)
    for (const thing of this.thingsToClear) {
      thing.finalize();
    }
  }

  update(elapsed, dt) {
    // TODO: Update objects here

    
    // OPTIONAL: render PickableObject to the picking buffer here


    // Render effect-applied scene to framebuffer of the photo if shutter is pressed
    if (this.shutterPressed) {
      this.shutterPressed = false;
      this.renderImage(this.photo.framebuffer.fbo, this.photo.width, this.photo.height);
      this.photo.show(elapsed); // Initiates photo-printing animation
    }

    // Render effect-applied scene to the screen
    this.renderImage(null);

    // Photos are rendered at the very last
    this.photo.update(elapsed);
    this.photo.render(this.camera);
  }

  renderScene() {
    // TODO: render scene *without* any effect
    // It would consist of every render(...) calls of objects in the scene

    /* Example code
    this.skybox.render(this.camera);
    this.animatedBackground.render(this.camera);
    this.avatar.render(this.camera);
    ...
    */
  }

  renderImage(fbo = null, width = null, height = null) {
    // Parameters:
    //  * fbo: Target framebuffer object, default is to the canvas
    //  * width: Width of the target framebuffer, default is canvas'
    //  * height: Height of the target framebuffer default is canvas'

    if (!width) width = this.width;
    if (!height) height = this.height;
    if (this.camereEffect == 'none') {
      // no camera effect - render directly to the scene
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      this.renderScene();
    } else {
      // TODO: render the scene with some camera effect to the target framebuffer object (fbo)
      // Write at least one camera effect shader, which takes a rendered texture and draws modified version of the given texture
      //
      // Step-by-step guide:
      //  1) Bind a separate framebuffer that you initialized beforehand
      //  2) Render the scene to the framebuffer
      //    - You probably need to use this.renderScene() here
      //    - If the width/height differ from the target framebuffer, use gl.viewPort(..)
      //  3) Bind a target framebuffer (fbo)
      //  4) Render a plane that fits the viewport with a camera effect shader
      //    - The plane should perfectly fit the viewport regardless of the camera movement (similar to skybox)
      //    - You may change the shader for a RenderObject like below:
      //        this.my_object.render(this.camera, *my_camera_effect_shader*)

      // TODO: Remove the following line after you implemented.
      // (and please, remove any console.log(..) within the update loop from your submission)
      console.log("TODO: camera effect (" + this.camereEffect + ")");

      // Below codes will do no effectl it just renders the scene. You may (should?) delete this.
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
}
