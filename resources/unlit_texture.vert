#version 300 es

layout(location = 0) in vec4 in_pos;
layout(location = 2) in vec2 in_uv;

out vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 cameraTransform;
uniform mat4 modelTransform;

uniform bool useScreenSpace;

mat4 getNormalMatrix(mat4 MVM)
{
	mat4 invm = inverse(MVM);
	invm[0][3] = 0.0;
	invm[1][3] = 0.0;
	invm[2][3] = 0.0;

	return transpose(invm);
}

void main() {
    uv = in_uv;
	if (useScreenSpace) {
		gl_Position = modelTransform * in_pos;
		gl_Position.z = -1.0; // Draw on top of everything
	} else {
		mat4 MVM = inverse(cameraTransform) * modelTransform;
    	gl_Position = projectionMatrix * MVM * in_pos;
	}
}
