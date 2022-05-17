import { setGLContext } from "./modules/gl.js";
import ExampleApp from "./modules/examples/example_app.js";
import GammaApp from "./modules/examples/gamma_app.js";
import EmptyApp from "./modules/empty_app.js";
import Lab1App from "./modules/labs/lab1.js";
import Lab2App from "./modules/labs/lab2.js";
import Lab4App from "./modules/labs/lab4.js";
import Lab5App from "./modules/labs/lab5.js";
import Lab6App from "./modules/labs/lab6.js";
import Lab7App from "./modules/labs/lab7.js";
import Lab8App from "./modules/labs/lab8.js";


import Assignment1 from "./modules/assignments/assignment1.js";
import Assignment2 from "./modules/assignments/assignment2.js";
import Assignment3 from "./modules/assignments/assignment3.js";
import Assignment4 from "./modules/assignments/assignment4.js";

/*
    WebGL app list whose entries are shown above gl canvas.
    Each app must be registered as
    (unique key) : {app: extension of cs380.BaseApp, title: string}
*/
const apps = {
  example: {
    app: ExampleApp,
    title: "Basic example",
  },
  empty: {
    app: EmptyApp,
    title: "Empty",
  },
  gamma: {
    app: GammaApp,
    title: "Gamma",
  },
  lab1: {
    app: Lab1App,
    title: "Lab 1",
  },
  lab2: {
    app: Lab2App,
    title: "Lab 2",
  },
  lab4: {
    app: Lab4App,
    title: "Lab 4",
  },
  lab5: {
    app: Lab5App,
    title: "Lab 5",
  },
  lab6: {
    app: Lab6App,
    title: "Lab 6",
  },
  lab7: {
    app: Lab7App,
    title: "Lab 7",
  },
  lab8: {
    app: Lab8App,
    title: "Lab 8",
  },
  assignment1: {
    app: Assignment1,
    title: "Assignment 1",
  },
  assignment2: {
    app: Assignment2,
    title: "Assignment 2",
  },
  assignment3: {
    app: Assignment3,
    title: "Assignment 3",
  },
  assignment4: {
    app: Assignment4,
    title: "Assignment 4",
  },
};

// Key of the very first app once you access localhost:8000
const defaultApp = "lab8";

function main() {
  const canvas = document.querySelector("#glcanvas");

  // Initialize the GL context
  const gl = canvas.getContext("webgl2", { stencil: true });
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //https://jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down/

  // If we don't have a GL context, give up now
  // Only continue if WebGL is available and working
  if (!gl) {
    alert("Unable to initialize WebGL. Try using the latest web browsers.");
    return;
  }
  setGLContext(gl);

  // Initialize app-selection list
  const input = document.getElementById("app-selection");
  for (const key in apps) {
    const { title } = apps[key];
    const opt = document.createElement("option");
    opt.value = key;
    opt.innerHTML = title;
    if (key === defaultApp) {
      opt.setAttribute("selected", "selected");
    }
    input.appendChild(opt);
  }

  let currentApp;
  input.onchange = () => {
    if (currentApp) {
      currentApp.stop();
      currentApp.finalize();
      document.getElementById("settings").innerHTML = "";
    }

    // replace currentApp with the new choice
    const { app } = apps[input.value] ?? {};
    if (app) {
      currentApp = new app();
      currentApp.run();
    }
  };
  input.onchange();
}

main();
