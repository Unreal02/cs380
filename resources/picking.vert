#version 300 es

layout(location = 0) in vec3 pos;

uniform mat4 projectionMatrix;
uniform mat4 cameraTransform;
uniform mat4 modelTransform;

void main() {
  mat4 MVM = inverse(cameraTransform) * modelTransform;
  gl_Position = projectionMatrix * MVM * vec4(pos, 1);
}