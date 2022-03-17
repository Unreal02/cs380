# 22' Spring CS380 Lab #1: Getting started with WebGL

## Due: Friday, March 11th, 2022 (11:59 PM)

## Contact: cs380_ta@cgv.kaist.ac.kr

# Important notices

* **No score** will be given for plagiarised works.
* **Do not share** your works online or offline. If noticed, they will be reguarded as plagiarised works.
    * Consider not to upload your works on public repositories like GitHub.
    * If you do, you *must* set a proper visibility settings for your project to prevent any plagiarism.

# Overview

This lab is a "Hello, world!" for WebGL framework.
Your responsibility in this lab is to render an RGB triangle in the canvas.
You only need to edit `modules/labs/lab1.js` file in this lab.
Fill in the section commented with `TODO:` and write your own helper functions if necessary.

If you are new to Javascript, [W3Schools Javascript tutorial](https://www.w3schools.com/js/default.asp) provides great online resources for you to start.
[MDN web tutorials](https://developer.mozilla.org/en-US/docs/Web/Tutorials) also provides in-depth materials on HTML and Javascript.
Also, future labs and assignments use [glMatrix](https://glmatrix.net/) for matrix and vector arithmetics on Javascript.
You can read documentation on the glMatrix's website.

# How to run

Due to the security reasons, you *cannot* directly open `index.html` with web browsers.

Instead, you should start a local testing web server within the directory containing `index.html`.
With Python3 installed, simply execute `python3 ./run.py` on the shell and you can run your works by connecting `http://localhost:8000` via web browsers.

About the web browsers, do not use old web browser such as Internet Explorer.
We will grade your works on the latest Mozila Firefox, but any modern web browsers are probably fine.

During test runs, you may find that your modifications to code are not shown on the web browser after multiple refreshes.
This is possibly due to your web browser cacheing `.js` files.
You can prevent this behavior by disabling cache in the browser's developer tools.
For example, in Mozila Firefox, open developer tools by pressing F12 key, go to Network tab, and check Disable cache.

![Disable cache option](/pics/disable-cache.png)

If you want to inspect the internal status (framebuffers, global flags, etc.) of WebGL, try using [spector.js](https://spector.babylonjs.com/).
Spector.js is a Firefox/Chrome extension for WebGL debugging.
It captures every WebGL function calls and lets you inspect the internal status between function calls, which is usually not visible without debugging tools.

# Specifications and Points

Submit a screenshot of your rendered RGB triangle.

| Specification                  | Point |
|--------------------------------|------:|
| 1. Render an RGB triangle      |     1 |
| Total                          |     1 |
