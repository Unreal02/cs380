#version 300 es
precision highp float;

#define DIRECTIONAL 0
#define POINT 1
#define SPOTLIGHT 2
#define AMBIENT 3

in vec4 frag_pos;

out vec4 output_color;

void main() {
    float depth = -frag_pos.z;
    output_color = vec4(0, 0, 0, 1);
    output_color.r = depth / 25.0;
    if (depth >= 20.0) output_color.g = (depth - 25.0) / 25.0;
    if (depth >= 40.0) output_color.b = (depth - 50.0) / 25.0;

    if (output_color.r > 1.0) output_color.r = 1.0;
    if (output_color.g > 1.0) output_color.g = 1.0;
    if (output_color.b > 1.0) output_color.b = 1.0;
}

