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
    bool perlin;
};

uniform int numLights;
uniform Light lights[10];
uniform Material material;

float random(vec3 seed) {
    seed = seed + vec3(123.456, 789.123, 456.789);
    return fract(sin(dot(seed, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
}

vec3 gradient(vec3 seed) {
    vec3 dx = vec3(0.0001, 0, 0);
    vec3 dy = vec3(0, 0.0001, 0);
    vec3 dz = vec3(0, 0, 0.0001);
    return normalize(vec3(
        random(seed + dx) - random(seed - dx),
        random(seed + dy) - random(seed - dy),
        random(seed + dz) - random(seed - dz)
    ));
}

float polynomial(float x) {
    return 3.0 * pow(x, 2.0) - 2.0 * pow(x, 3.0);
}

float interpolate(float a, float b, float t) {
    return a * polynomial(t) + b * polynomial(1.0 - t);
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

    if (material.perlin) {
        vec3 pos = (cameraTransform * frag_pos).xyz;
        int x0 = int(floor(pos.x));
        int x1 = int(ceil(pos.x));
        int y0 = int(floor(pos.y));
        int y1 = int(ceil(pos.y));
        int z0 = int(floor(pos.z));
        int z1 = int(ceil(pos.z));
        float dist_x = float(x1) - pos.x;
        float dist_y = float(y1) - pos.y;
        float dist_z = float(z1) - pos.z;
        vec3 vecs[8];
        vecs[0] = vec3(x0, y0, z0);
        vecs[1] = vec3(x0, y0, z1);
        vecs[2] = vec3(x0, y1, z0);
        vecs[3] = vec3(x0, y1, z1);
        vecs[4] = vec3(x1, y0, z0);
        vecs[5] = vec3(x1, y0, z1);
        vecs[6] = vec3(x1, y1, z0);
        vecs[7] = vec3(x1, y1, z1);
        vec3 grads[8];
        for (int i = 0; i < 8; i++) grads[i] = gradient(vecs[i]);
        float cells[8];
        for (int i = 0; i < 8; i++) cells[i] = dot(grads[i], pos - vecs[i]);
        float cell01 = interpolate(cells[0], cells[1], dist_z);
        float cell23 = interpolate(cells[2], cells[3], dist_z);
        float cell45 = interpolate(cells[4], cells[5], dist_z);
        float cell67 = interpolate(cells[6], cells[7], dist_z);
        float cell0123 = interpolate(cell01, cell23, dist_y);
        float cell4567 = interpolate(cell45, cell67, dist_y);
        float cell = interpolate(cell0123, cell4567, dist_x);
        int val = int(floor((cell + 1.0) * 6.0)) % 6;
        vec3 coeff;
        switch(val) {
            case 0: coeff = vec3(1, 0, 0); break;
            case 1: coeff = vec3(1, 1, 0); break;
            case 2: coeff = vec3(0, 1, 0); break;
            case 3: coeff = vec3(0, 1, 1); break;
            case 4: coeff = vec3(0, 0, 1); break;
            case 5: coeff = vec3(1, 0, 1); break;
        }
        intensity *= coeff;
    }
    
    output_color = vec4(intensity, 1.0);
    
    output_color.rgb = pow(output_color.rgb, vec3(1.0 / 2.2));  // Gamma correction
}

