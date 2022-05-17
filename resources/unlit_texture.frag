#version 300 es
precision highp float;

in vec2 uv;

out vec4 output_color;

uniform sampler2D mainTexture;
uniform vec3 solidColor;
uniform bool useColor;

void main() {
    
    if (useColor) {
        output_color.rgb = pow(solidColor, vec3(1.0 / 2.2));
    } else {
        // No need for gamma correction
        // Rendered textures are already in linear color space
        // (Only applies to use cases of the skeleton code!)
        output_color.rgb = texture(mainTexture, uv).rgb;
    }
    output_color.a = 1.0;
}
