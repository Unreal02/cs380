#version 300 es
precision highp float;

in vec3 uv;

out vec4 output_color;

uniform samplerCube mainTexture;

void main() {
  output_color = texture(mainTexture, uv);
}
