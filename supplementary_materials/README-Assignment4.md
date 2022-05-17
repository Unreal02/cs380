# 22' Spring CS380 Assignment #4: Virtual Photo Booth (Final Project)

## Due: Tuesday, June 7th, 2022 (11:59 PM)

## Contact: cs380_ta@cgv.kaist.ac.kr

# Important notices

- **No score** will be given for plagiarised works.
- **Do not share** your works online or offline. If noticed, they will be reguarded as plagiarised works.
  - Consider not to upload your works on public repositories like GitHub.
  - If you do, you _must_ set a proper visibility settings for your project to prevent any plagiarism.
- For any **late submissions**, TAs will deduct 0.5 points every 12 hours.

# Overview

This is the final assignment of CS380 class.
In this assignment, you should merge your prior works throughout the course and render objects with shadow.
You will also improve your knowledge and skills that you get in the last assignment and previous lab sessions.

To complete this assignment,

1. You have to merge what you did during last 3 assignments.
2. You have to add camera effects on your virtual photo booth.
3. Finally, you have to create your own virtual photo booth.

We recommend you to use `modules/assignments/assignment4.js` skeleton code.
This skeleton code offers some functions for your photo booth. Please check TA's demo video to figure out what you need to implement.

When you receive and run the skeleton code, the start-up app would be set as `Lab8App`.
To change it to `Assignment4`, open `main.js` and edit the line containing `defaultApp` variable to be `assignment4` from `lab8`.

For your better understanding, we attached supplementary video 'Assignment4 Example.mp4'.

This is the final assignment, and there are a lot of interesting challenges to get scores. **Good luck!**

# Basic Requirements

## 1. Reuse HW1: Animated background (1pt)
You implemented animated background with fractal-like objects in assignment #1. This time, you will merge your first assignment to this final project. Your 2d animated canvas implemented in assignment#1 is your photo booth background. Render your first assignment on the texture, and use it as your photo booth background.

## 2. Reuse HW2: Avatar with adjustable pose (0.5pt)
You implemented avatar with adjustable pose in the assignment #2. Your avatar is the one being photographed in the virtual photo booth. Let's merge your avatar into this final project. 

## 3. Reuse HW3: Blinn-Phong lightings (1pt)
You already implemented Blinn-Phong lightings in assignment #3: point, spot, and directional lights. Arrange the light sources in your virtual photo booth creatively. 

## 4. Skybox (0.5pt)
We implemented skybox in lab 8. Just as we developed in the lab session, insert the skybox in your virtual photo booth. You might be able to use free skybox images on the internet.

## 5. Camera effects (2pt)
Let's implement fun camera effects for your virtual photo booth. In lab 9, you experience an edge detection camera effect. As you implemented in the lab session, render your photo booth to the texture, and apply the camera effect, selected from the dropbox, to the texture using shader. Then, render the texture on the canvas.
Since it takes 2 points, you need to create some effects from the below lists to get full score.

Reference for color inversion: 
Reference for blurring and shrpening: https://en.wikipedia.org/wiki/Kernel_(image_processing)#Details

- Color inversion (0.5pt)
- Sepia or Grayscale (0.5pt) (At most one will be counted for basic requirement point.)
- Sharpening or Blurring (1pt) (At most one will be counted for basic requirement point.)
- Fish-eye (1pt)
- Chromatic aberration (1pt)
- Depth of field (2pt)
- Motion blur (2pt)

## 6. Creativity (1pt)

Briefly write down on your report in which part your creativity is shown.
It can be the interesting choice of the objects or animation.
Any artistic aspects of your assignment should be written here.
(Any technical aspects should be written in basic requirements or challenges.)

## Specifications and Points

| Specification                             | Point |
| ----------------------------------------- | ----- |
| 1. Reuse HW1: Animated background         | 1     |
| 2. Reuse HW2: Avatar with adjustable pose | 0.5   |
| 3. Reuse HW3: Blinn-Phong lightings       | 1     |
| 4. Skybox                                 | 0.5   |
| 5. Camera Effects                         | 2     |
| 6. Creativity                             | 1     |
| Total                                     | 6     |

# Challenges

Note: Challenges are _optional_, but you should gather **7 points** from challenges to get the full score at the end of the term project.
For more detailed description, please refer to the term project introduction slides.
Listed challenges are TA-recommended challenges which are helpful for the current assignment and the whole project.

- This is the final assignment. Don't forget to submit your challenge tasks ! You have to earn 7 challenge points to get full score!

- Challenges that have already earned challenge points in previous assignments do not need to be resubmitted.

- This time, some challenge lists overlap with some basic requirements. Please note that the functions that earned basic requirements points is not counted for the challenge points.

## 0. Previous challenge lists

- Assignment #1
    - Keyframe-based 2D animation (1pt)
- Assignment #2
    - Advanced keyframe-based 3D animation (1pt)
    - Arcball (2pt)
- Assignment #3
    - Perlin noise (2pt)
    - Toon shading (1pt)

## 1. Bump map
We already offered the code for computing tangent in 'modules/cs380/mesh.js'. If you build your mesh with the function buildMesh(mesh, data, **buildTangent = true**), tangent information is also saved to your mesh. Exploit tangent values, you can generate bump map. Please refer to your textbook 387 page for the implentation.

Reference: textbook 387p.

wiki: https://en.wikipedia.org/wiki/Bump_mapping#Methods

## 2. Fish-eye
wiki: https://en.wikipedia.org/wiki/Fisheye_lens#Mapping_function
## 3. Chromatic aberration
wiki: https://en.wikipedia.org/wiki/Chromatic_aberration

## 4. Depth of field
Reference: textbook 404p.

wiki: https://en.wikipedia.org/wiki/Depth_of_field

## 5. Motion blur
Reference: textbook 404p.

wiki: https://en.wikipedia.org/wiki/Motion_blur#Computer_graphics

## 6. Shadow map with directional light
Reference: textbook 300p.

## 7. Screen space ambient occlusion
wiki: https://en.wikipedia.org/wiki/Screen_space_ambient_occlusion

opengl resource: https://learnopengl.com/Advanced-Lighting/SSAO

## 8. Screen space reflection
https://lettier.github.io/3d-game-shaders-for-beginners/screen-space-reflection.html


| Challenge                     | Point |
| ----------------------------- | ----- |
| 1. Bump map                   | 1     | 
| 2. Fish-eye                   | 1     | 
| 3. Chromatic aberration       | 1     |
| 4. Depth of field             | 2     |
| 5. Motion blur                | 2     |
| 6. Shadow map                 | 2     |
| 7. Screen space ambient occlusion          | 3     |
| 8. Screen space reflection    | 3     |

## Make-your-own challenge

Other than listed challenges above, you may declare your own challenges on your report.
They must have a significant technical challenges to get the point, and if so TAs will grant challenge points by the similar criteria used for listed challenges. If you want to check whether your own challenge could be counted for challenge points, come to office hour session before submission.

# Deliverables

## Report

**TAs will _only_ grade features you wrote on the report.**

Thoroughly explain about your implementations of each requirements and challenges.
Only .docx, .pdf, and .md formats are allowed.
Include your report within your code directory.

## Code

Compress your project directory (+ report) given Python script `archive.py`.
Running `python3 archive.py [Student ID]` will create a submission file for you.
TAs will run your code _as-is_ on Mozila Firefox, so double-check whether the submission file is working or not.
Only .zip format is allowed.
