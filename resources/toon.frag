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
    float illuminance;
    float angle;
    float angleSmoothness;
};

uniform int numLights;
uniform Light lights[10];

vec3 rgb2blackwhite(vec3 rgb) {
    float gray = dot(rgb, vec3(0.299, 0.587, 0.114));
    if(gray>0.5) gray=1.0;
    else if(gray>0.3) gray=0.5;
    else gray = 0.0;
    return vec3(gray, gray, gray);
}

float random(vec3 seed) {
    seed = seed + vec3(123.456, 789.123, 456.789);
    return fract(sin(dot(seed, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
}

void main() {
    mat4 W2C = inverse(cameraTransform);
    vec3 intensity = vec3(0.0, 0.0, 0.0);
    
    vec3 N = normalize(frag_normal.xyz);
    
    for (int i=0; i<numLights; i++){
        if (lights[i].enabled == false) continue;
        //if (!lights[i].enabled) continue;
        
        float lightIlluminance = lights[i].illuminance;
        vec3 lightPos = (W2C * vec4(lights[i].pos, 1)).xyz;
        vec3 L = vec3(0);
        if (lights[i].type == DIRECTIONAL) {
            L = normalize((W2C * vec4(-lights[i].dir, 0)).xyz);
        }
        else if (lights[i].type == POINT) {
            continue;
        }
        else if (lights[i].type == SPOTLIGHT) {
            continue;
        }
        else if (lights[i].type == AMBIENT) {
            float ambient = lightIlluminance;
            intensity += ambient * mainColor;
            continue;
        }
        
        float NdotL = dot(N, L);
        float diffuse = max(0.0f, NdotL) * lightIlluminance;
            intensity += diffuse * mainColor;

        float specular = 0.0;
        if (NdotL > 0.0) {
            vec3 V = normalize(-frag_pos.xyz);
            vec3 H = normalize(L + V);
            specular = pow(max(dot(N, H), 0.0), 92.1) * lightIlluminance;
        }
        intensity += specular * mainColor;
    }
    vec2 screenSpace = gl_FragCoord.xy;
    
    // output_color = vec4(rgb2blackwhite(intensity), 1.0);
    // TODO: implement your own functions for NPR and do something with your functions to change the color value
    float gray = dot(intensity, vec3(0.299, 0.587, 0.114));
    if (gray > 0.5) {
        output_color = vec4(1, 1, 1, 1);
    }
    else if (gray > 0.3) {
        if ((int(screenSpace.x) + int(screenSpace.y)) / 2 % 3 == 0) output_color = vec4(0, 0, 0, 1);
        else output_color = vec4(1, 1, 1, 0);
    }
    else {
        if ((int(screenSpace.x) + int(screenSpace.y)) / 2 % 3 == 0 || (int(screenSpace.x) - int(screenSpace.y) + 1000) / 2 % 3 == 0) output_color = vec4(0, 0, 0, 1);
        else output_color = vec4(1, 1, 1, 0);
    }
    
    output_color.rgb = pow(output_color.rgb, vec3(1.0 / 2.2));  // Gamma correction
}

