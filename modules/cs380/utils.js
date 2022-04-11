import gl from "../gl.js";
import { vec3 } from "./gl-matrix.js";

export class SimpleOrbitControl {
  constructor(camera, center) {
    this.dir = vec3.create();
    this.up = vec3.fromValues(0, 1, 0);

    this.transform = camera.transform;
    this.pressed = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.currMouseX = 0;
    this.currMouseY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.center = center ? center : vec3.clone(this.transform.localPosition);
    this.initializeState(center, this.transform);

    this.handleMouseDown = this.onMouseDown();
    this.handleMouseMove = this.onMouseMove();
    this.handleMouseUp = this.onMouseUp();
    this.handleWheel = this.onWheel();
    gl.canvas.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);
    gl.canvas.addEventListener("wheel", this.handleWheel);
  }

  finalize() {
    gl.canvas.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
    gl.canvas.removeEventListener("wheel", this.handleWheel);
  }

  initializeState(center, tr) {
    const initialPos = tr.localPosition;
    const initialRot = tr.localRotation;
    let radius = 0;
    if (center) radius = vec3.distance(initialPos, center);

    const dir = vec3.create();
    if (radius) {
      vec3.subtract(initialPos, initialPos, center);
      vec3.normalize(dir, dir);
    } else {
      vec3.set(dir, 0, 0, 1);
      vec3.transformQuat(dir, dir, initialRot);
    }

    const up = this.up;
    const right = vec3.fromValues(1, 0, 0);
    const back = vec3.fromValues(0, 0, 1);
    const altitude = Math.PI - vec3.angle(up, dir);

    let azimuth = vec3.angle(right, dir);
    const az2 = vec3.angle(back, dir);
    if (az2 > 0.5 * Math.PI) azimuth = -azimuth;

    this.radius = radius;
    this.altitude = altitude;
    this.azimuth = azimuth;
  }

  update(dt, speed = 1e4, damping = 0.1) {
    let deltaX = (this.currMouseX - this.prevMouseX) / gl.canvas.clientWidth;
    let deltaY = (this.currMouseY - this.prevMouseY) / gl.canvas.clientHeight;
    if (!this.pressed) {
      const damp = Math.pow(damping, dt);
      this.prevMouseX = damp * this.prevMouseX + (1 - damp) * this.currMouseX;
      this.prevMouseY = damp * this.prevMouseY + (1 - damp) * this.currMouseY;
    } else {
      this.prevMouseX = this.currMouseX;
      this.prevMouseY = this.currMouseY;
    }

    speed *= Math.PI / 180;
    if (this.radius == 0) speed *= -1;
    this.altitude += deltaY * speed * dt;
    this.altitude = Math.max(0.0001, Math.min(this.altitude, Math.PI - 0.0001));

    this.azimuth += deltaX * speed * dt;
    while (this.azimuth < -Math.PI) this.azimuth += 2 * Math.PI;
    while (this.azimuth > Math.PI) this.azimuth -= 2 * Math.PI;

    const dir = this.dir;
    const dirR = this.radius == 0 ? 1 : this.radius;
    const pos = this.transform.localPosition;
    const r = dirR * Math.sin(this.altitude);
    const y = dirR * Math.cos(this.altitude);
    const x = r * Math.cos(this.azimuth);
    const z = r * Math.sin(this.azimuth);
    vec3.set(dir, x, y, z);
    if (this.radius > 0) vec3.add(pos, this.center, dir);
    else vec3.set(pos, ...this.center);

    vec3.normalize(dir, dir);
    vec3.negate(dir, dir);
    this.transform.lookAt(dir, this.up);
  }

  onMouseDown() {
    return (e) => {
      this.pressed = true;
      const rect = gl.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = rect.bottom - e.clientY;

      this.prevMouseX = mouseX;
      this.prevMouseY = mouseY;
      this.currMouseX = mouseX;
      this.currMouseY = mouseY;
    };
  }

  onMouseMove() {
    const canvas = gl.canvas;
    return (e) => {
      if (!this.pressed) return;
      const rect = canvas.getBoundingClientRect();
      this.prevMouseX = this.currMouseX;
      this.prevMouseY = this.currMouseY;
      this.currMouseX = e.clientX - rect.left;
      this.currMouseY = rect.bottom - e.clientY;
    };
  }

  onMouseUp() {
    return (e) => {
      this.pressed = false;
    };
  }

  onWheel() {
    return (e) => {
      e.preventDefault();
      let normalzedDeltaY = e.deltaY;
      if (e.deltaMode == 1) normalzedDeltaY /= 3;
      else normalzedDeltaY /= 120;
      this.radius *= Math.pow(1.1, normalzedDeltaY * 0.2);
    };
  }
}

export const setInputBehavior = (
  id,
  callback,
  onchange = false,
  initialize = true
) => {
  const input = document.getElementById(id);
  const callbackWrapper = () => callback(input.value); // NOTE: must parse to int/float for numeric values
  if (onchange) {
    input.onchange = callbackWrapper;
    if (initialize) input.onchange();
  } else {
    input.oninput = callbackWrapper;
    if (initialize) input.oninput();
  }
};

export const setCheckboxBehavior = (id, callback, initialize = true) => {
  const checkbox = document.getElementById(id);
  const callbackWrapper = () => callback(checkbox.checked);
  checkbox.onchange = callbackWrapper;
  if (initialize) checkbox.onchange();
};

export const hexToRGB = (out, hex) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  out[0] = parseInt(result[1], 16) / 255;
  out[1] = parseInt(result[2], 16) / 255;
  out[2] = parseInt(result[3], 16) / 255;
};
