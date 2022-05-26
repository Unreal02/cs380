#version 300 es

layout(location = 0) in vec3 in_pos;

out vec3 uv;

uniform mat4 projectionMatrix;
uniform mat4 cameraTransform;
uniform mat4 modelTransform;

void main() {
  //TODO: implement uv and gl_Position
  mat4 MVM = inverse(mat4(mat3(cameraTransform))) * modelTransform;
  uv = in_pos;  
  gl_Position = projectionMatrix * MVM * vec4(in_pos, 1);
}
