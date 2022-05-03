# README-Assignment3

# 22’ Spring CS380 Assignment #3: Let There Be Light

## Due: Tuesday, May 17th, 2022 (11:59 PM)

## Contact: cs380_ta@cgv.kaist.ac.kr

# Important notices

- **No score** will be given for plagiarized works.
- **Do not share** your works online or offline. If noticed, they will be regarded as plagiarised works.
    - Consider not to upload your works on public repositories like GitHub.
    - If you do, you *must* set a proper visibility settings for your project to prevent any plagiarism.
- For any **late submissions**, TAs will deduct 0.5 points every 12 hours.

# Overview

In this assignment, you will upgrade your Blinn-Phong reflection model to support point light, and spotlight sources, colored illuminance, and materials. You will also improve your skills of shader programming, and the knowledge about shaders in WebGL.

To complete this assignment,

1. you have to upgrade the given code so that the illuminance may have color in `modules/blinn_phong.js`, and `resources/blinn_phong.frag`;
2. you have to complete the shader so that it supports Blinn-Phong reflection model for point light and spotlight sources;
3. you have to write more shaders for different material. You can start by copying your `modules/blinn_phong.js`, and `resources/blinn_phong.frag`.

You can start your work from scratch in `modules/assignments/assignment2.js` if you want, but we recommend you to start based on your scene of assignment #2  .

When you receive and run the skeleton code, the start-up app would be set as `Lab6App`. To change it to `Assignment3`, open `main.js` and edit the line containing `defaultApp` variable to be `assignment3` from `lab6`.

There would be a lot of work to get high scores with the basic requirements + challenges. **Start early, and good luck!**

# Basic Requirements (Due: May 17th)

## 1. Colored Illuminance

Update `Light` class, and `BlinnPhongShader.setUniform` function in `modules/blinn_phong.js`, and update `Light` struct, and `main` function in `resources/blinn_phong.frag`.

In Lab #6, the illuminance of a light source used to be a real number in the range of [0..1]. Keeping in mind that a color consists of red, green, and blue, update the class, and struct definition in `modules/blinn_phong.js`, and `resources/blinn_phong.frag`. Then, update `BlinnPhongShader.setUniform`function in `modules/blinn_phong.js` so that it can pass a color (not a float) to the shader, and `main` function in `resources/blinn_phong.frag` so that it can compute colored reflections.

For the light source initialization, just copying, and pasting the code from `modules/labs/lab6.js` may not work. You need to assign an appropriate color value for the illuminance attribute of a `Light` object. 

You have to include at least two light sources with distinctive colors in your scene. You have to update the original code using proper data type, and compute the reflection properly to get **1 pt**.

## 2. Point Light, and Spotlight Sources

Update POINT branch, and SPOTLIGHT branch in `main` function in `resources/blinn_phong.frag`. Complete the empty branches to implement Blinn-Phong reflection for point light and spotlight sources. You may utilize the space outside the if branches in the for loop for overlapping calculations for each light source.

In the light source initialization phase, you can change the type of the light source by adding `light.type = LightType.POINT` or  `light.type = LightType.SPOTLIGHT`. Keep in mind that the point light source has a position attribute, and the spotlight source has a position, angle, and smoothness attributes. You can get the position vector from the light transform using `light.pos`

We regard that your work satisfies each sub-criteria only if both diffuse, and specular reflections are completely implemented for each light source.

1. point light source - **1 pt**
2. spotlight source - **1 pt**

You have to include both point light, and spotlight sources in your scene, and they have to be recognized respectively.

## 3. Materials

Write your own shader program to support material difference. You can start your work by copying `modules/blinn_phong.js`, and `resources/blinn_phong.frag`. **DO NOT** redefine `LightType`, and `Light` in your JavaScript code. You can reuse it by adding `import { LightType, Light } from "./blinn_phong.js";` at the top of your code.

All coefficients should be passed to the shader as uniform variables, and you have to update `setUniform` function which is inherited from `cs380.BaseShader` class in your own JavaScript code to add new uniform variables. You may create a new class for the material coefficients, or you may just hard-code the values in  `modules/assignments/assignment3.js`. The path of your own shader codes should be given in `source` function which is inherited from `cs380.BaseShader` class in your own JavaScript code. 

There are two options for ambient, diffuse, and specular coefficients:

1. Reuse `mainColor`, and let those coefficients be the multiples of `mainColor` - **1 pt** (Half credit)
2. Let ambient, diffuse, and specular reflections have red, green, and blue coefficients respectively - **2 pts** (full credit)

## 4. Creativity

Briefly write down on your report in which part your creativity is shown. It may be hard to show color difference, light source difference, and material differences in one static scene. We recommend you to implement animation, or keyboard/mouse interactions to make your work more recognizable. Any artistic aspects of your assignment should be written here. (Any technical aspects should be written in basic requirements or challenges.)

## Specifications and Points

| Specification                      | Point |
| ---------------------------------- | ----- |
| 1. Colored illuminance          | 1     |
| 2. Point light and spotlight sources | 2     |
| 3. Materials         | 2     |
| 4. Creativity                      | 1     |
| Total                              | 6     |

# Challenges

Note: Challenges are *optional*, but you should gather 7 points from challenges to get the full score at the end of the term project. For more detailed description, please refer to the term project introduction slides. Listed challenges are TA-recommended challenges which are helpful for the current assignment and the whole project.

## 1. Perlin Noise

Implement Perlin noise and a shader using it to give an object a procedurally generated pattern on the surface.

Refer this [paper](https://dl.acm.org/doi/10.1145/325165.325247) for more detailed information.

You are already given the `random` function in `resources/blinn_phong.frag`, which takes a vec3 as a parameter and return a random real number [0..1). Using this you can add some random effects to your rendering result. However, the white noise generated by the mere `random` function will make the surface rough because of the high-frequency content in the noise. You may solve this problem using Perlin noise. Refer “10.10 PROCEDURAL NOISE” in your textbook, and implement it on your scene. 

To get a full credit (**2 pts**), you have to satisfy the following steps:

1. Implement the Perlin noise function in your shader which gets a 3D coordinate as a parameter and return a random float value [0..1).
2. Update your shader to make some of your objects have stain-like, or spot-like textures on their surfaces according to the Perlin noise value.
3. Allow switching your scene between the Perlin version, and the original version, so that we can still see your original rendering result.

Please write your implementation detail about your system’s features on your report; how you designed the interface for the features, for instance.

## 2. Toon shading

Implement a toon shader, and apply to your original scene.

In many applications, computer graphics aim to render a realistic scene, but sometimes not. Refer what you have practice (or will practice) in lab #7, implement a toon shading with discrete colors, and outlines.

To get a full credit (**1 pt**), you have to satisfy the following steps:

1. Implement the simple toon shader using step functions as you have practiced in lab #7.
2. Add outline rendering on your shader. You can implement outline detection using normals, or you can utilize other methods.
3. Allow switching your scene between the toon version, and the original version, so that we can still see your original rendering result.

Please write your implementation detail about your system’s features on your report; how you designed the interface for the features, for instance.

| Challenge                               | Point |
| --------------------------------------- | ----- |
| 1. Perlin noise  | 2     |
| 2. Toon shading                              | 1     |

## Make-your-own challenge

Other than listed challenges, you may declare your own challenges on your report. They must have a significant technical challenges to get the point, and if so TAs will grant challenge points by the similar criteria used for listed challenges.

# Deliverables

## Report

Thoroughly explain about your implementations of each requirements (or optionally, challenges.) TAs will *only* grade features you wrote on the report. Only .docx, .pdf, and .md formats are allowed. Include your report within your code directory.

## Code

Compress your project directory (+ report) given Python script `archive.py`. Running `python3 archive.py [Student ID]` will create a submission file for you. TAs will run your code *as-is* on Mozila Firefox, so double-check whether the submission file is working or not. Only .zip format is allowed.