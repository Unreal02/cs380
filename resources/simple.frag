#version 300 es
precision highp float;

in vec4 frag_pos;
in vec4 frag_normal;

out vec4 output_color;

uniform mat4 cameraTransform;

uniform vec3 mainColor;

void main() {
    vec4 world_light_dir = vec4(1.0, 1.0, 1.0, 0.0);
    mat4 W2C = inverse(cameraTransform);

    vec3 L = normalize((W2C * world_light_dir).xyz);
    vec3 N = normalize(frag_normal.xyz);

    float diffuse = min(max(0.0f, dot(N, L) * 0.9f) + 0.1f, 1.0f);
    
    output_color = vec4(mainColor * diffuse, 1.0);
    
    output_color.rgb = pow(output_color.rgb, vec3(1.0 / 2.2));  // Gamma correction
}

