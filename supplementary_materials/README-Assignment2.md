# 22' Spring CS380 Assignment #2: An Avatar of Lost Arcball

## Due: Tuesday, April 26th, 2022 (11:59 PM)

## Contact: cs380_ta@cgv.kaist.ac.kr

# Important notices

- **No score** will be given for plagiarised works.
- **Do not share** your works online or offline. If noticed, they will be reguarded as plagiarised works.
  - Consider not to upload your works on public repositories like GitHub.
  - If you do, you _must_ set a proper visibility settings for your project to prevent any plagiarism.
- For any **late submissions**, TAs will deduct 0.5 points every 12 hours.

# Overview

In this assignment, you will make your own interactive avatar
with 3D hierarchical modeling.
You will also improve your knowledge and skills that you get in the last assignment and previous lab sessions.

To complete this assignment,

1. you have to implement to generate cone and cylinder mesh in `modules/cs380/primitives.js`;
2. your avatar must consist of spheres, cones, and cylinders in with hierarchical structures;
3. your avatar needs to be implemented so that it can change the posture from the user's keyboard/mouse input.

You can start your work based on your scene of assignment #1 if you want,
but we recommend you to start from scratch in `modules/assignments/assignment2.js`.

When you receive and run the skeleton code, the start-up app would be set as `Lab4App`.
To change it to `Assignment2`, open `main.js` and edit the line containing `defaultApp` variable to
be `assignment2` from `lab4`.

From this second assignment, there would be a lot of work to get high scores with the basic requirements + challenges. **Start early, and good luck!**

# Basic Requirements (Due: April 26th)

## 1. 3D Geometric Objects

Implement `generateCone` and `generateCylinder` functions in `modules/cs380/primitives.js`.

One of the practice task in Lab #4 is to generate sphere object
by modifying `generateSphere` function in `modules/cs380/primitives.js`.
In this assignments, you have to modify `generateCone` and `generateCylinder` as well so that
you can use the meshes to build your avatar.

The type of the return values must be an object that
contains vertex positions (`vertices` array), and
the surface normal unit-vectors (`vertexNormals` array).
You may also construct `indices` array for VBO indexing if you want. (Please refer to implementation of `generateCube`)
For now, you can leave the `textures` field as an empty array as it may be going to be filled in assignment #4.

Here is the intended spec of the functions.

- `generateCone(sides, radius, height)` - 1 pt
  - A 3D cone with a radius of `radius` at the bottom. The top vertex is at `height`, and the number of bottom face's sides is `sides`.
- `generateCylinder(sides, radius, height)` - 1 pt
  - A 3D cylinder with a radius of `radius` at the bottom and top. The top face is at `height`, and the number of bottom face's sides is `sides`.

When you are confused about any implementation detail, please write your assumption about that in your report. Any reasonable assumption would be accepted.

## 2. Hierarchical Modeling of Avatar

Create your own avatar with hierarchical structures.

Your avatar components should consist of several kinds of 3D objects.
Specifically, it should have

- at least one sphere,
- at least one cone,
- at least one cylinder,
- (optional) any other objects such as cubes, snowflakes, stars, etc.

Additionally, your avatar should have a basic structure as follows:

![Avatar Parts Requirements](/pics/avatar-parts.png)

That is, there should be at least 10 objects for your avatar.
You can freely choose which mesh/shape each component is rendered as.
You may divide each part into subparts if you want.
For example, the body part may be divided into middle/lower body parts.

To manage hierarchical transformation of each object,
you will need to use `Transform.setParent()` so frequently.
If you are to hard-code such transforms, your work on "Interactive Avatar Pose" will become much more difficult.

## 3. Interactive Avatar Pose

Your avatar must respond to the user's input and change its pose, including the rotation of arms and legs.

You must deal with the following user input events:

1. Keyboard input
2. Mouse input for at least one `PickableObject`

Otherwise, there would be a 0.5 pts deduction per each.

For `PickableObject`, please refer to our Lab #4 slides.

You may create HTML components e.g. `<button>`, `<select>` to support HTML interaction as well,
but those should not be the only interaction methods.

**For posing, please include at least**

1. **rotations of arms and legs,** - 1pt
2. **transforms of the camera** - 1 pt

by any of the intended input.

There is no detailed restriction about the pose changes except the two requirements.
These things are totally up to your thinking:

- how much angle/distance each part can rotate/translate;
- which inputs each part responds to;
- whether the change is shown as a smooth animation or a discontinuous one, etc.

Show your creativity in this task!

## 4. Creativity

Briefly write down on your report in which part your creativity is shown.
It can be the interesting choice of the objects or animation.
Any artistic aspects of your assignment should be written here.
(Any technical aspects should be written in basic requirements or challenges.)

## Specifications and Points

| Specification                      | Point |
| ---------------------------------- | ----- |
| 1. 3D geometric objects            | 2     |
| 2. Hierarchical modeling of avatar | 1     |
| 3. Interactive avatar pose         | 2     |
| 4. Creativity                      | 1     |
| Total                              | 6     |

# Challenges

Note: Challenges are _optional_, but you should gather 7 points from challenges to get the full score at the end of the term project.
For more detailed description, please refer to the term project introduction slides.
Listed challenges are TA-recommended challenges which are helpful for the current assignment and the whole project.

## 1. Advanced Keyframe-based 3D Animation

Implement keyframe-based animation system of 3D transformations with advanced features.

The basic requirements are similar to "keyframe-based 2D animation" in assignment #1. Your system should be able to 1) define a movement as keyframes containing (at least) a timestamp and a _3D_ transformation (translation, rotation, and scaling; e.g. `cs380.Transform`,) and 2) add at least one animated object, driven by your animation system that updates the objects transformation by interpolating between transformations of two keyframes. This system is for 3D, however, so your previous implementation might have to be changed, especially for rotation. This requirement will get you 0.5 pts.

Also, your system should support at least one of the following features, getting you +0.5 pts.

1. (Easy) **Transition function** : Most of the previous implementations for keyframe-based animation would be using _linear_ interpolation between two keyframes with respect to time. In addition to that, your system should support nonlinear transition, such as ease-in or ease-out animation, between two keyframes.
2. (Hard) **Interpolation of Hierarchical `cs380.Transform`** : `cs380.Transform` would be implemented to be hierarchical by calculating `parent`'s transformation from Lab #5. Your system should consider the hierarchical modeling. That is, if your previous system takes `cs380.Transform` objects as keyframes, you may need to change the implementation so that the keyframes represent their (global) world transforms instead of its `local` transforms. Note that just interpolating two `worldMatrix` linearly would produce wrong transformations when they include different rotations.

Please write your implementation detail about your system's features on your report; how you designed the interface for the features, for instance.

## 2. Arcball

Add arcball functionality to objects, manipulated by mouse inputs (drags).

See the following materials:

- Supplementary PDF of arcball reference on KLMS
- [Youtube: ArcBall 3d rotation - rattilus](https://www.youtube.com/watch?v=YxNjjyv8W0I)
- [Youtube: Arcball test - Charlie Burns](https://www.youtube.com/watch?v=4YgVQArWQnY)
- [Youtube: Arcball demo for CS171, Caltech - Hamik Mukelyan](https://www.youtube.com/watch?v=bXqydwakVDg)

to see what an arcball exactly is and how it works.

It doesn't have to be implemented for every object.
You can earn challenge points with just the arcball for single object.
When you are confused about the implementation detail, please write your assumption about that in your report.

| Challenge                               | Point |
| --------------------------------------- | ----- |
| 1. Advanced keyframe-based 3D animation | 1     |
| 2. Arcball                              | 2     |

## Make-your-own challenge

Other than listed challenges, you may declare your own challenges on your report.
They must have a significant technical challenges to get the point, and if so TAs will grant challenge points by the similar criteria used for listed challenges.

# Deliverables

## Report

Thoroughly explain about your implementations of each requirements (or optionally, challenges.)
TAs will _only_ grade features you wrote on the report.
Only .docx, .pdf, and .md formats are allowed.
Include your report within your code directory.

## Code

Compress your project directory (+ report) given Python script `archive.py`.
Running `python3 archive.py [Student ID]` will create a submission file for you.
TAs will run your code _as-is_ on Mozila Firefox, so double-check whether the submission file is working or not.
Only .zip format is allowed.
