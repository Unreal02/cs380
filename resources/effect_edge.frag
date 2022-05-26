#version 300 es
precision highp float;

in vec2 uv;

out vec4 output_color;

uniform sampler2D mainTexture;
uniform float width;
uniform float height;

void pixels_3by3(inout vec4 n[9], sampler2D tex, vec2 coord)
{
	float w = 1.0 / width; //interval of u between two fragments pixel
	float h = 1.0 / height; //interval of v between two fragments pixel

	//TODO: get 9 pixels in vec4 array, with the center of current fragment
	// Define n[0], n[1], ... n[8] respectively. Refer to the n[4] put correct coordinate to each pixel.
	//n[0] = texture(tex, coord + vec2(.., ..));
	//n[1] = texture(tex, coord + vec2(.., ..));
	//n[2] = texture(tex, coord + vec2(.., ..));
	//n[3] = texture(tex, coord + vec2(.., ..));
	n[4] = texture(tex, coord);
	//n[5] = texture(tex, coord + vec2(.., ..));
	//n[6] = texture(tex, coord + vec2(.., ..));
	//n[7] = texture(tex, coord + vec2(.., ..));
	//n[8] = texture(tex, coord + vec2(.., ..));
}

void main() {
  vec4 n[9];
	pixels_3by3(n, mainTexture, uv);

	//TODO: calculate magnitude of sobel gradient
  //vec4 grad_x = "pixel value gradient of x-axis"
  //vec4 grad_y = "pixel value gradient of y-axis"
	vec4 grad_mag = 1.0-n[4]; //put "magnitude of gradient" to grad_mag correctly.
	
  output_color = vec4(1.0 - grad_mag.rgb, 1.0);
}

