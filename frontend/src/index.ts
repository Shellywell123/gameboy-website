import * as THREE from "three"
import {getGPUTier} from "detect-gpu";

import {CSS3DRenderer} from 'three/examples/jsm/renderers/CSS3DRenderer'
import Cube from "./cube";
import Camera from "./camera";

const gpu = getGPUTier();
console.log(gpu);


let container;
let camera: Camera;
let glRenderer: THREE.WebGLRenderer;
let cssRenderer: CSS3DRenderer;
let glScene: THREE.Scene;
let cssScene: THREE.Scene;
let cube: Cube;
let iframe: HTMLIFrameElement

let STATE: "idle" | "selected" | "frame" = "idle"

function init() {

  container = document.querySelector("#scene-container");

  glRenderer = createGlRenderer();
  cssRenderer = createCssRenderer();
  glScene = new THREE.Scene();
  cssScene = new THREE.Scene();

  document.body.appendChild(cssRenderer.domElement);
  cssRenderer.domElement.appendChild(glRenderer.domElement);

  camera = new Camera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000,
    new THREE.Vector3(0, 400, 3000),
    new THREE.Euler(-Math.PI / 16, 0, 0)
  )
  createLights();


  cube = new Cube(glScene, 800)
  cube.assignFacet(4, new URL('https://www.alramalho.com'))
  cube.assignFacet(1, new URL('https://www.ipo-track.com'))
  cube.assignFacet(5, new URL('https://www.alramalho.com'))
  cube.assignFacet(0, new URL('https://www.ipo-track.com'))


  createControls();

  update()
}

function createLights() {
  const light = new THREE.SpotLight(0xffffff);
  light.position.set(600, 0, 600);
  // const helper = new THREE.CameraHelper( light.shadow.camera )

  light.castShadow = true;
  light.intensity = 0.5;
  light.shadow.radius = 10

  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 2048;

  glScene.add(light);
  // glScene.add(helper);
}

function createGlRenderer() {
  var glRenderer = new THREE.WebGLRenderer({alpha: true});

  glRenderer.setClearColor(`#2f2f2f`);
  glRenderer.setPixelRatio(window.devicePixelRatio);
  glRenderer.setSize(window.innerWidth, window.innerHeight);

  glRenderer.domElement.style.position = 'absolute';
  glRenderer.domElement.style.zIndex = 1;
  glRenderer.domElement.style.top = 0;

  glRenderer.shadowMap.enabled = true
  glRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

  return glRenderer;
}

function createCssRenderer() {

  var cssRenderer = new CSS3DRenderer();

  cssRenderer.setSize(window.innerWidth, window.innerHeight);

  cssRenderer.domElement.style.position = 'absolute';
  glRenderer.domElement.style.zIndex = 0;
  cssRenderer.domElement.style.top = 0;

  return cssRenderer;
}

function createControls() {
  document.addEventListener('keydown', function (event) {
    switch (event.key) {
      case "ArrowLeft":
        cube.rotateOverYAxis(-Math.PI / 2)
        break;
      case "ArrowRight":
        cube.rotateOverYAxis(Math.PI / 2)
        break;
      case "Enter":
        switch (STATE) {
          case "idle":
            STATE = "selected"
            const anchor = Math.PI / 2
            const leftover = cube.targetRotation.y % anchor
            if (leftover > (anchor - leftover)) {
              cube.rotateOverYAxis(anchor - leftover)
            } else {
              cube.rotateOverYAxis(-leftover)
            }
            camera.move(
              new THREE.Vector3(0, 0, camera.object.position.z / 2),
              new THREE.Euler(0, camera.object.rotation.y, camera.object.rotation.z)
            )

            break
          case "selected":
            history.pushState({}, "", cube.getFrontFace().url.host)
            loadFrame(cube.getFrontFace().url)

            STATE = 'frame'
            break
        }
        break
      case "Backspace":
        switch (STATE) {
          case "selected":
            cube.rotateOverYAxis(0)
            camera.reset()
            STATE = "idle"
            break
        }
        break
    }
  });
}

function update() {

  switch (STATE) {
    case "idle":
      cube.rotateOverYAxis(0.01)
      break

    case "selected":
      break

  }

  cube.update()
  camera.update()

  glRenderer.render(glScene, camera.object);
  cssRenderer.render(cssScene, camera.object);
  requestAnimationFrame(update);
}

init();

window.onpopstate = function (event) {
  iframe.remove()
  STATE = 'selected'

  glRenderer.domElement.style.display = 'block'
  cssRenderer.domElement.style.display = 'block'
}

function loadFrame(url: URL) {

  iframe = document.createElement('iframe');
  iframe.src = url.toString();
  iframe.style.width = '100vw';
  iframe.style.height = `calc(100vh)`;
  iframe.style.display = 'fixed';
  iframe.style.zIndex = '1000';

  container.prepend(iframe);

  glRenderer.domElement.style.display = 'none'
  cssRenderer.domElement.style.display = 'none'


  // const controls = document.createElement('controls');
  // controls.innerHTML = `
  //       <style>
  //         div {
  //           color: #37352f;
  //           background-color: #f7f6f2;
  //           padding: 1rem;
  //           position: absolute;
  //           z-index: 10;
  //           top: 0;
  //           right: 0;
  //           font-family: ui-sans-serif;
  //         }
  //         a {
  //           text-decoration: underline;
  //         }
  //       </style>
  //       <div>
  //         <a href="javascript:cube.getFrontFace().url">Open real webpage &rAarr;</a>
  //       </div>
  //     `;
  //
  // iframe.prepend(controls)

}

function onWindowResize() {
  camera.object.aspect = container.clientWidth / container.clientHeight;
  camera.object.updateProjectionMatrix();

  glRenderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize, false);
