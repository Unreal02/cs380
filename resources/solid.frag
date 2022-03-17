#version 300 es
precision highp float;

out vec4 output_color;

uniform vec3 mainColor;

void main() {
    output_color = vec4(mainColor, 1.0);
    
    output_color.rgb = pow(output_color.rgb, vec3(1.0 / 2.2));  // Gamma correction
}
