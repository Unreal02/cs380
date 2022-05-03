# README-Lab6

# 22’ Spring CS380 Lab #6: Lighting and Shading

## Due: Wednesday, May 4th, 2022 (19:00 KST)

## Contact: cs380_ta@cgv.kaist.ac.kr

# Important Notices

- **No score** will be given for plagiarized works.
- **Do not share** your works online or offline. If noticed, they will be regarded as plagiarised works.
    - Consider not to upload your works on public repositories like GitHub.
    - If you do, you *must* set a proper visibility settings for your project to prevent any plagiarism.

# Overview

This lab covers importing 3D objects, and  Blinn-Phong reflection model supporting directional light source.

Your main responsibility is to

1. Import at least one wavefront format 3D object (*.obj), and render it in `modules/labs/lab6.js`. 
2. Implement ambient and diffuse reflections for directional light source in `resources/blinn_phong.frag` 
    - You may refer `resources/simple.frag`.
3. Implement specular reflection for directional light source in `resources/blinn_phong.frag`.

You will edit `modules/labs/lab6.js` and `resources/simple.frag` in this lab. Fill in the section commented with `TODO:` and write your own helper functions if necessary.

For more information, refer to the lab session slides on KLMS.

These links will be your forever-friends:

- [Javascript Math library](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)
- [glMatrix documentation](https://glmatrix.net/docs/)

# Specifications and Points

Make your own rendering result by changing lighting parameters (ambient/diffuse/specular coefficients, and shininess) and submit one **screenshot** of your final scene that ambient, diffuse, and specular reflections are well recognized. 

| Specification                                              | Point |
| ---------------------------------------------------------- | ----- |
| 1. Import a 3D model and implement Blinn-Phong reflection model for directional light source | 1     |
| **Total**                                                  | **1** |
