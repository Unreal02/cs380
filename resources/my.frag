#version 300 es
precision highp float;

#define DIRECTIONAL 0
#define POINT 1
#define SPOTLIGHT 2
#define AMBIENT 3

in vec4 frag_pos;
in vec4 frag_normal;

out vec4 output_color;

uniform mat4 cameraTransform;

uniform vec3 mainColor;

struct Light {
    int type;
    bool enabled;
    vec3 pos;
    vec3 dir;
    vec3 illuminance;
    float angle;
    float angleSmoothness;
};

struct Material {
    vec3 ambientColor;
    vec3 diffuseColor;
    vec3 specularColor;
    float shininess;
    bool toon;
};

uniform int numLights;
uniform Light lights[10];
uniform Material material;

float random(vec3 seed) {
    seed = seed + vec3(123.456, 789.123, 456.789);
    return fract(sin(dot(seed, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
}

float toonDiffuse(float v) {
    if (material.toon) {
        if (v > 0.3) return 1.0;
        else return 0.0;
    }
    else return v;
}

float toonSpecular(float v) {
    if (material.toon) {
        if (v > 0.01) return 0.4;
        else return 0.0;
    }
    else return v;
}

void main() {
    mat4 W2C = inverse(cameraTransform);
    vec3 intensity = vec3(0.0, 0.0, 0.0);
    
    vec3 N = normalize(frag_normal.xyz);
    vec3 V = normalize(normalize((W2C * vec4(0, 0, 0, 1)).xyz) - frag_pos.xyz);
    
    for (int i=0; i<numLights; i++){
        if (!lights[i].enabled) continue;
        
        if (lights[i].type == DIRECTIONAL) {
            // TODO: implement diffuse and specular reflections for directional light

            // diffuse
            vec3 L = -normalize(vec3(W2C * vec4(lights[i].dir, 0.0)));
            intensity += toonDiffuse(max(dot(N, L), 0.0)) * lights[i].illuminance * material.diffuseColor;

            // specular
            vec3 H = normalize(L + V);
            float psi = dot(N, H);
            intensity += toonSpecular(max(pow(max(psi, 0.0), material.shininess), 0.0)) * lights[i].illuminance * material.specularColor;
        }
        else if (lights[i].type == POINT) {
            vec3 pos = (W2C * vec4(lights[i].pos, 1.0)).xyz;
            float distance = length(pos - frag_pos.xyz);
            float coeff = (1.0 / pow(distance, 2.0));

            // diffuse
            vec3 L = normalize(pos - frag_pos.xyz);
            intensity += toonDiffuse(coeff * max(dot(N, L), 0.0)) * lights[i].illuminance * material.diffuseColor;

            // specular
            vec3 H = normalize(L + V);
            float psi = dot(N, H);
            intensity += toonSpecular(coeff * max(pow(max(psi, 0.0), material.shininess), 0.0)) * lights[i].illuminance * material.specularColor;
        }
        else if (lights[i].type == SPOTLIGHT) {
            vec3 pos = (W2C * vec4(lights[i].pos, 1.0)).xyz;
            vec3 L = normalize(pos - frag_pos.xyz);
            vec3 dir = normalize(vec3(W2C * vec4(lights[i].dir, 0.0)));
            float cosin = max(dot(L, dir), 0.0);
            float angle = acos(cosin);
            float transitionAngle = lights[i].angle * lights[i].angleSmoothness;
            float coeff = 0.0;
            if (angle > lights[i].angle + transitionAngle) coeff = 0.0; // outside
            else if (angle > lights[i].angle - transitionAngle) {
                float interpolation = 1.0 - (angle - lights[i].angle + transitionAngle) / (2.0 * transitionAngle);
                coeff = -cos(interpolation * 3.1415926) / 2.0 + 0.5;
            } // transition
            else coeff = 1.0; // inside

            // 거리에 따른 계수
            float dist = length(pos - frag_pos.xyz);
            coeff /= pow(dist, 2.0);

            // diffuse
            intensity += toonDiffuse(coeff * max(dot(N, L), 0.0)) * lights[i].illuminance * material.diffuseColor;

            // specular
            vec3 H = normalize(L + V);
            float psi = dot(N, H);
            intensity += toonSpecular(coeff * max(pow(max(psi, 0.0), material.shininess), 0.0)) * lights[i].illuminance * material.specularColor;
        }
        else if (lights[i].type == AMBIENT) {
            // TODO: implement ambient reflection
            intensity += lights[i].illuminance * material.ambientColor;
        }
    }

    // outline
    if (material.toon) {
        float outline = 1.0 - pow(abs(dot(N, V)), 2.0);
        outline = pow(outline, 5.0);
        outline = 1.0 - clamp(outline * 3.0, 0.0, 1.0);
        intensity *= outline;
    }
    
    output_color = vec4(intensity, 1.0);
    
    output_color.rgb = pow(output_color.rgb, vec3(1.0 / 2.2));  // Gamma correction
}

