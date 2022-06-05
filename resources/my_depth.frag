#version 300 es
precision highp float;

#define DIRECTIONAL 0
#define POINT 1
#define SPOTLIGHT 2
#define AMBIENT 3

in vec4 frag_pos;

out vec4 output_color;

void main() {
    float range = 60.0;
    float depth = (frag_pos.z + 30.0) * 6.0 + 30.0;
    output_color = vec4(0, 0, 0, 1);
    output_color.r = depth / (range / 3.0);
    if (depth >= range / 3.0) output_color.g = (depth - range / 3.0) / (range / 3.0);
    if (depth >= range / 1.5) output_color.b = (depth - range / 1.5) / (range / 3.0);

    if (output_color.r > 1.0) output_color.r = 1.0;
    if (output_color.g > 1.0) output_color.g = 1.0;
    if (output_color.b > 1.0) output_color.b = 1.0;
}

