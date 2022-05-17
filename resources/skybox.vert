#version 300 es

layout(location = 0) in vec3 in_pos;

out vec3 uv;

uniform mat4 projectionMatrix;
uniform mat4 cameraTransform;
uniform mat4 modelTransform;

void main() {
    // TODO: implement uv and gl_Position
    uv = (projectionMatrix * transpose(inverse(cameraTransform)) * modelTransform * vec4(in_pos, 1)).xyz;
    gl_Position = projectionMatrix * modelTransform * vec4(in_pos, 1);
}
