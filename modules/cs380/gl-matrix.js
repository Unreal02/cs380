const {
  glMatrix: glm, // glMatrix becomes inside TDZ, thus renamed as glm temporarily
  mat2,
  mat2d,
  mat3,
  mat4,
  quat,
  quat2,
  vec2,
  vec3,
  vec4,
} = glMatrix;
export {
  glm as glMatrix, // restore the original name
  mat2,
  mat2d,
  mat3,
  mat4,
  quat,
  quat2,
  vec2,
  vec3,
  vec4,
};
