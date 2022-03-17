#version 300 es
precision highp float;

out vec3 output_color;
uniform vec3 pickingID;

void main() {
  output_color = pickingID;
}