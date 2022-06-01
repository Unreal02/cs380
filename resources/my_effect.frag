#version 300 es
precision highp float;

#define NONE 0
#define COLOR_INVERSION 1
#define GRAYSCALE 2
#define BLUR 3

in vec2 uv;

out vec4 output_color;

uniform sampler2D mainTexture;
uniform float width;
uniform float height;
uniform int cameraEffect;

void pixels_3by3(inout vec4 n[9], sampler2D tex, vec2 coord)
{
    float w = 1.0 / width; //interval of u between two fragments pixel
    float h = 1.0 / height; //interval of v between two fragments pixel

    //TODO: get 9 pixels in vec4 array, with the center of current fragment
    // Define n[0], n[1], ... n[8] respectively. Refer to the n[4] put correct coordinate to each pixel.
    n[0] = texture(tex, coord + vec2(-w, -h));
    n[1] = texture(tex, coord + vec2(0, -h));
    n[2] = texture(tex, coord + vec2(w, -h));
    n[3] = texture(tex, coord + vec2(-w, 0));
    n[4] = texture(tex, coord);
    n[5] = texture(tex, coord + vec2(w, 0));
    n[6] = texture(tex, coord + vec2(-w, h));
    n[7] = texture(tex, coord + vec2(0, h));
    n[8] = texture(tex, coord + vec2(w, h));
}

void main() {
    vec4 n[9];
    pixels_3by3(n, mainTexture, uv);

    output_color = vec4(vec3(0), 1);
    vec3 color = texture(mainTexture, uv).rgb;

    switch(cameraEffect) {
      case NONE:
        output_color.rgb = color;
        break;
      case COLOR_INVERSION:
        output_color.rgb = vec3(1) - color;
        break;
      case GRAYSCALE:
        float gray = dot(color, vec3(0.299, 0.587, 0.114));
        output_color.rgb = vec3(gray);
        break;
      case BLUR:
        vec3 avg = vec3(0);
        for(int i = 0; i < 9; i++) avg += n[i].rgb;
        avg /= 9.0;
        output_color.rgb = avg;
        break;
    }
}
