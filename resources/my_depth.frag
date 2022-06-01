#version 300 es
precision highp float;

#define DIRECTIONAL 0
#define POINT 1
#define SPOTLIGHT 2
#define AMBIENT 3

in vec4 frag_pos;

out vec4 output_color;

void main() {
    output_color = vec4(vec3(-frag_pos.z / 100.0), 1.0);
}

