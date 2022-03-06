import * as THREE from "three"
import {getGPUTier} from "detect-gpu";

import {CSS3DRenderer} from 'three/examples/jsm/renderers/CSS3DRenderer'
import Cube from "./cube";
import Camera from "./camera";
import {Queue} from "./queue";

const gpu = getGPUTier();
console.log(gpu);

type Action = "left" | "right" | "back" | "enter" | "up" | "down" | "middle"

const gameboyColors = [`#4f50db`, `#a7f700`, `#f12d48`, `#08b6d5`]

let container;
let camera: Camera;
let glRenderer: THREE.WebGLRenderer;
let glScene: THREE.Scene;
let cube: Cube;
let iframe: HTMLIFrameElement
let popup
let last10Moves = new Queue<Action>(10)

let STATE: "idle" | "selected" | "frame" = "idle"

function init() {

  container = document.querySelector('.display');

  glRenderer = createGlRenderer();
  glScene = new THREE.Scene();

  container.appendChild(glRenderer.domElement);

  camera = new Camera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000,
    new THREE.Vector3(0, 400, 3000),
    new THREE.Euler(-Math.PI / 16, 0, 0)
  )
  camera.object.aspect = container.clientWidth / container.clientHeight;
  camera.object.updateProjectionMatrix();
  createLights();


  cube = new Cube(glScene, 800)
  cube.assignFacet(4, new URL('https://www.alramalho.com'))
  cube.assignFacet(1, new URL('https://www.ipo-track.com'))
  cube.assignFacet(5, new URL('https://www.alramalho.com'))
  cube.assignFacet(0, new URL('https://www.ipo-track.com'))


  createGameboy();

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

  glRenderer.domElement.style.position = 'fixed';
  glRenderer.domElement.style.zIndex = 1;
  glRenderer.domElement.style.top = 0;
  glRenderer.domElement.style.left = 0;


  glRenderer.shadowMap.enabled = true
  glRenderer.shadowMap.type = THREE.PCFSoftShadowMap;


  return glRenderer;
}

function playSound() {
  // @ts-ignore
  const audio: HTMLAudioElement = document.getElementById("audio");
  audio.play();
}

export function fireControl(command: Action) {
  switch (command) {
    case "left":
      cube.rotateOverYAxis(-Math.PI / 2)
      break
    case "right":
      cube.rotateOverYAxis(Math.PI / 2)
      break
    case "back":
      switch (STATE) {
        case "selected":
          cube.rotateOverYAxis(0)
          camera.reset()
          STATE = "idle"
          break
        case "frame":
          history.back()
          container.classList.add('sepia')

          break
      }
      break
    case "enter":
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
          container.classList.remove('sepia')
          break
      }
      break
  }
  last10Moves.enqueue(command)

  function checkKonamiCode(): boolean {
    const lastMoves = last10Moves.getArray()
    if (lastMoves.length != 10) return false

    const konamiCode = [
      'up' as Action,
      'up' as Action,
      'down' as Action,
      'down' as Action,
      'left' as Action,
      'left' as Action,
      'right' as Action,
      'right' as Action,
      'back' as Action,
      'enter' as Action,
    ]


    for (let i = 0; i < lastMoves.length; i++) {
      console.log(lastMoves[i] + ' == ' + konamiCode[i])
      if (lastMoves[i] != konamiCode[i]) {
        return false
      }
    }
    return true
  }

  if (checkKonamiCode()) {
    console.log('⭐ Konami ⭐')
    document.documentElement.style.setProperty('--gameboyColor', gameboyColors[Math.floor(Math.random() * gameboyColors.length)]);
  }
}

function createGameboy() {

  // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  });

  function createButton(fnCallback: () => void, innerHTML: string, extraClassNames?: string[]) {
    const button = document.createElement('div')
    button.onclick = () => { fnCallback(); playSound() }
    button.innerHTML = innerHTML
    if (extraClassNames !== undefined) {
      button.className = extraClassNames.join(' ')
    }
    return button
  }

  const ABWrapper = document.getElementsByClassName('a-b')[0]
  const DPADWrapper = document.getElementsByClassName('dpad')[0]
  DPADWrapper.appendChild(createButton(() => fireControl("up"), '<i class="fa fa-caret-up">', ['up']))
  DPADWrapper.appendChild(createButton(() => fireControl("left"), '<i class="fa fa-caret-left">', ['left']))
  DPADWrapper.appendChild(createButton(() => fireControl("right"), '<i class="fa fa-caret-right">', ['right']))
  DPADWrapper.appendChild(createButton(() => fireControl("down"), '<i class="fa fa-caret-down">', ['down']))
  DPADWrapper.appendChild(createButton(() => fireControl("middle"), '', ['middle']))
  ABWrapper.appendChild(createButton(() => fireControl("back"), '<span>B</span>', ['b']))
  ABWrapper.appendChild(createButton(() => fireControl("enter"), '<span>A</span>', ['a']))

  document.addEventListener('keydown', function (event) {
    switch (event.key) {
      case "ArrowLeft":
        fireControl('left')
        playSound()
        break;
      case "ArrowRight":
        fireControl('right')
        playSound()
        break;
      case "ArrowUp":
        fireControl('up')
        playSound()
        break;
      case "ArrowDown":
        fireControl('down')
        playSound()
        break;
      case "Backspace":
      case "B":
      case "b":
        fireControl("back")
        playSound()
        break
      case "Enter":
      case "A":
      case "a":
        fireControl("enter")
        playSound()
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
  requestAnimationFrame(update);
}

init();

function exitIframe() {
  iframe.remove()
  STATE = 'selected'
  popup.style.display = 'none'

  glRenderer.domElement.style.display = 'block'
}

window.onpopstate = function () {
  exitIframe();
}

function loadFrame(url: URL) {

  iframe = document.createElement('iframe');
  iframe.id = 'iframe'
  iframe.src = url.toString();
  iframe.style.width = '100%';
  iframe.style.height = `100%`;
  iframe.style.display = 'fixed';

  container.append(iframe);

  glRenderer.domElement.style.display = 'none'

  popup = document.createElement('div')
  popup.onclick = () => open(url.toString())
  popup.className = 'popup'
  popup.style.display = 'block';
  popup.style.zIndex = '11';
  popup.innerHTML = `Visit ${url.host} &rarr;`

  document.body.appendChild(popup)

}

function onWindowResize() {
  camera.object.aspect = container.clientWidth / container.clientHeight;
  camera.object.updateProjectionMatrix();

  glRenderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize, false);
