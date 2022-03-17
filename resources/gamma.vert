#version 300 es

layout(location = 0) in vec4 aVertexPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uCameraTransform;
uniform mat4 uModelTransform;

mat4 getNormalMatrix(mat4 MVM)
{
	mat4 invm = inverse(MVM);
	invm[0][3] = 0.0;
	invm[1][3] = 0.0;
	invm[2][3] = 0.0;

	return transpose(invm);
}

void main() {
    vec4 pos = aVertexPosition;
    pos.z = 0.0;
    gl_Position = aVertexPosition;
}
