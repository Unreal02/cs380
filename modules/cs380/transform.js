import { mat3, mat4, vec3, quat } from "./gl-matrix.js";
export class Transform {
  constructor() {
    this._m1 = mat4.create();
    this._m2 = mat4.create();

    this.localPosition = vec3.create();
    this.localRotation = quat.create();
    this.localScale = vec3.fromValues(1, 1, 1);

    this.parent = null;

    // Temp vecs
    this.dir = vec3.create();
    this.up = vec3.create();
    this.right = vec3.create();
    this.m3 = mat3.create();
  }

  get localMatrix() {
    mat4.fromRotationTranslationScale(
      this._m1,
      this.localRotation,
      this.localPosition,
      this.localScale
    );
    return this._m1;
  }

  get worldMatrix() {
    mat4.fromRotationTranslationScale(
      this._m2,
      this.localRotation,
      this.localPosition,
      this.localScale
    );

    // TODO: Implement hierarchical frames
    if (this.parent) {
      // Mp = Position * Rotation * Scale
      const mp = mat4.clone(this.parent.worldMatrix);

      const parentScale = mat4.create();
      const parentScaleInverse = mat4.create();
      mat4.fromScaling(parentScale, this.parent.localScale);
      mat4.invert(parentScaleInverse, parentScale);

      // Position * Rotation * _m2
      const temp1 = mat4.create();
      const temp2 = mat4.create();
      mat4.multiply(temp1, mp, parentScaleInverse);
      mat4.multiply(temp2, temp1, this._m2);
      this._m2 = temp2;
    }

    return this._m2;
  }

  clone() {
    const out = new Transform();
    out.copyFrom(this);
    return out;
  }

  copyFrom(other) {
    vec3.copy(this.localPosition, other.localPosition);
    quat.copy(this.localRotation, other.localRotation);
    vec3.copy(this.localScale, other.localScale);
    this.setParent(other.parent);
  }

  setParent(t) {
    let root = t;
    while (root != null && root != this) root = root.parent;
    if (root == this) alert("Cycle found in scene tree!");
    else this.parent = t;
  }

  lookAt(negZ, targetY = null) {
    const dir = this.dir;
    const up = this.up;
    const right = this.right;
    const m3 = this.m3;
    vec3.negate(dir, negZ);
    if (targetY) vec3.copy(up, targetY);
    else {
      vec3.set(up, 0, 1, 0);
      vec3.transformQuat(up, up, this.localRotation);
    }

    vec3.normalize(dir, dir);
    vec3.normalize(up, up);

    vec3.cross(right, up, dir);
    if (vec3.len(right) == 0) return;
    vec3.normalize(right, right);

    vec3.cross(up, dir, right);
    vec3.normalize(up, up);

    mat3.set(m3, ...right, ...up, ...dir);
    quat.fromMat3(this.localRotation, m3);
  }
}
