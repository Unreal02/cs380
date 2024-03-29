#version 300 es
precision highp float;

#define NONE 0
#define COLOR_INVERSION 1
#define GRAYSCALE 2
#define BLUR 3
#define FISHEYE 4
#define CHROMATIC_ABERRATION 5
#define DEPTH_OF_FIELD 6

in vec2 uv;

out vec4 output_color;

uniform sampler2D mainTexture;
uniform sampler2D depthTexture;
uniform sampler2D bigTexture;
uniform float width;
uniform float height;
uniform int cameraEffect;

uniform float blurSigma;
uniform float chromatic;
uniform float focalLength;
uniform float dof;

float gaussian(int x, int y, float sigma) {
  return exp(-(pow(float(x), 2.0) + pow(float(y), 2.0)) / pow(sigma, 2.0)) / pow(sigma, 2.0);
}

float get_depth(vec2 pos) {
  vec3 depth_vector = texture(depthTexture, pos).rgb * 20.0;
  float temp = depth_vector.r + depth_vector.g + depth_vector.b;
  return -((temp - 30.0) / 2.0 - 30.0);
}

vec3 blur(float sigma) {
  float w = 1.0 / width; //interval of u between two fragments pixel
  float h = 1.0 / height; //interval of v between two fragments pixel
  vec3 avg = vec3(0);
  float sum = 0.0;
  int range;
  for (int i = 0; ; i++) if (exp(-pow(float(i), 2.0) / pow(sigma, 2.0)) < 0.005) {
    range = i;
    break;
  }
  for (int i = -range; i <= range; i++) for (int j = -range; j <= range; j++) {
    float coeff = gaussian(i, j, sigma);
    vec2 pos = uv + vec2(w * float(i), h * float(j));
    if (cameraEffect == DEPTH_OF_FIELD && get_depth(uv) > get_depth(pos)) continue;
    sum += coeff;
    avg += coeff * texture(mainTexture, pos).rgb;
  }
  avg /= sum;
  return avg;
}

void main() {
  output_color = vec4(vec3(0), 1);

  switch(cameraEffect) {
    case NONE:
      output_color.rgb = texture(mainTexture, uv).rgb;
      break;
    case COLOR_INVERSION:
      output_color.rgb = vec3(1) - texture(mainTexture, uv).rgb;
      break;
    case GRAYSCALE:
      float gray = dot(texture(mainTexture, uv).rgb, vec3(0.299, 0.587, 0.114));
      output_color.rgb = vec3(gray);
      break;
    case BLUR:
      output_color.rgb = blur(blurSigma);
      break;
    case FISHEYE:
      vec2 center = vec2(width / 2.0, height / 2.0);
      vec2 from_center = uv * width - center; // (-width/2 ~ width/2)
      float center_dist = length(from_center / 1.5); // (0 ~ width/2)
      float optical_angle = center_dist / (width / 2.0) * 1.5707963; // (0 ~ PI/2)
      float cam_angle = 80.0 * 3.1415926 / 180.0;
      if(optical_angle < cam_angle) {
        vec2 target = 0.5 / tan(cam_angle) * tan(optical_angle) * normalize(from_center);
        output_color.rgb = texture(bigTexture, target + vec2(0.5)).rgb;
      }
      else output_color.rgb = vec3(0);
      break;
    case CHROMATIC_ABERRATION:
      vec2 uv_from_center = uv - vec2(0.5);
      output_color.rgb = vec3(
        texture(mainTexture, (1.0 - chromatic) * uv_from_center + vec2(0.5)).r,
        texture(mainTexture, uv).g,
        texture(mainTexture, (1.0 + chromatic) * uv_from_center + vec2(0.5)).b
      );
      break;
    case DEPTH_OF_FIELD:
      float depth = get_depth(uv);
      if (abs(focalLength - depth) <= dof / 2.0) output_color.rgb = texture(mainTexture, uv).rgb;
      else output_color.rgb = blur(min((abs(focalLength - depth) - dof / 2.0), 10.0));
      break;
  }
}
