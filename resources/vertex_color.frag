#version 300 es
precision highp float;

in vec3 vertexColor;

out vec4 output_color;

void main() {
    output_color = vec4(vertexColor, 1.0);
    
    output_color.rgb = pow(output_color.rgb, vec3(1.0 / 2.2));  // Gamma correction
}
