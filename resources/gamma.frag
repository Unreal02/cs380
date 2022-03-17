#version 300 es
precision highp float;

out vec4 output_color;

uniform vec2 screenResolution;
uniform float time;
uniform bool applyGammaCorrection;

void main() {

    vec2 uv = 2.0 * (gl_FragCoord.xy - screenResolution * 0.5) / screenResolution.y;
    vec2 a = (uv * 10.0) + time;
    vec2 b = (uv * 12.0) + time;
    float r = clamp(sin(a.x) * cos(a.y) + 0.4, 0.0, 1.0);
    float g = clamp(sin(b.x) * cos(b.y) * 1.2 - 0.1, 0.0, 1.0);

    output_color.rgb = mix(mix(vec3(0,0,1), vec3(1,0,0), r), vec3(0,1,0), g);
    output_color.a = 1.0;

    if (applyGammaCorrection)
        output_color.rgb = pow(output_color.rgb, vec3(1.0 / 2.2));  // Gamma correction
}
