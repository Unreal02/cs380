# 22' Spring CS380 Lab #4: 3D Viewing

## Due: Friday, April 8st, 2022 (19:00 KST)

## Contact: cs380_ta@cgv.kaist.ac.kr

# Important Notices

- **No score** will be given for plagiarised works.
- **Do not share** your works online or offline. If noticed, they will be reguarded as plagiarised works.
  - Consider not to upload your works on public repositories like GitHub.
  - If you do, you _must_ set a proper visibility settings for your project to prevent any plagiarism.

# Overview

This lab will cover 3D viewing with an hierarchical modeling technique.

Your main responsibility is to

1. implement hierarchical frame in `cs380.Transform.worldMatrix`, and
2. construct your interactive solar system:
   - the earth moving around the sun, the moon moving around the earth
   - clicking each object to make the camera follow the object

You will edit `modules/labs/lab5.js` and `modules/cs380/transform.js` in this lab.
Fill in the section commented with `TODO:` and write your own helper functions if necessary.

For more information, refer to the lab session slides on KLMS.

These links will be your forever-friends:

- [Javascript Math library](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)
- [glMatrix documentation](https://glmatrix.net/docs/)

# Specifications and Points

Submit **3 screenshots** of your final scene, where the camera looks at the sun, the earth, and the moon, respectively.

| Specification                                              | Point |
| ---------------------------------------------------------- | ----- |
| 1. Hierarchical modeling with your solar system and camera | 1     |
| **Total**                                                  | **1** |
