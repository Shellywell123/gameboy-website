import * as THREE from "three"
import {getGPUTier} from "detect-gpu";

import Cube from "./cube";
import Camera from "./camera";
import {Queue} from "./queue";

const gpu = getGPUTier();
console.log(gpu);

type Action =
  "left"
  | "right"
  | "back"
  | "enter"
  | "up"
  | "down"
  | "middle"
  | "select"
  | "start"

const gameboyColors = [`#4f50db`, `#a7f700`, `#f12d48`, `#08b6d5`, `#f2ae00`]

let container;
let camera: Camera;
let glRenderer: THREE.WebGLRenderer;
let glScene: THREE.Scene;
let cube: Cube;
let last10Moves = new Queue<Action>(10)

let STATE: "idle" | "selected"  = "idle"

interface ShowcaseObject {
  url: URL,
  description: string
  viewScore: number
}
const ShowcaseObjects = [
  {
    url: new URL('https://hire.alramalho.com'),
    description: "SHOWCASE: Page for getting in contact with me with project proposals.",
    viewScore: 0
  } as ShowcaseObject,
  {
    url: new URL('https://www.ipo-track.com'),
    description: "SHOWCASE: Page for getting in contact with me with project proposals.",
    viewScore: 0
  } as ShowcaseObject,
  {
    url: new URL('https://blog.alramalho.com'),
    description: "OPEN-SOURCE: Subscribe to IPOs for free.",
    viewScore: 0
  } as ShowcaseObject,
  {
    url: new URL('https://www.radialcor.pt'),
    description: "BLOG: Personal Software Development & Testing blog",
    viewScore: 0
  } as ShowcaseObject,
  {
    url: new URL('https://compound-composer.alramalho.com'),
    description: "SHOWCASE: Interests calculator & visualizer for retail investment",
    viewScore: 0
  } as ShowcaseObject,
]

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

  ShowcaseObjects.forEach((object, index) => {
    if (index <= 3) {
      cube.assignFacet(object.url, object.description)
      object.viewScore += 1
    }
  })

  createGameboy();

  update()

  setInterval(updateEverySecond, 1000)
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

function playSound(id: string = "success") {
  // @ts-ignore
  const audio: HTMLAudioElement = document.getElementById(id);
  audio.play();
}

function hideInfoBanner() {
  const banner: any = document.getElementsByClassName('info-banner')[0]
  banner.style.transform = 'translateY(100%)'
}

function showInfoBanner() {
  const banner: any = document.getElementsByClassName('info-banner')[0]
  banner.style.transform = 'translateY(0)'
  updateInfoBanner()
}

function isHelpMenuOn() {
  const helpMenu: any = document.getElementsByClassName('help-menu')[0]
  return helpMenu.style.display == "block"
}

function toggleHelpMenu() {
  const helpMenu: any = document.getElementsByClassName('help-menu')[0]
  if (isHelpMenuOn()) {
    helpMenu.style.display = 'none'
  } else {
    helpMenu.style.display = 'block'
  }
}

function hidePopup() {
  const popup: any = document.getElementsByClassName('popup')[0]
  popup.style.display = 'none';
}

function showAndUpdatePopup() {
  const popup: any = document.getElementsByClassName('popup')[0]
  popup.style.display = 'block';
  const url = cube.getFrontFace().url
  popup.onclick = () => open(url.toString())
  popup.innerHTML = `Click 'A' to visit ${url.host} &rarr;`
}

function updateInfoBanner() {
  const banner = document.getElementsByClassName('info-banner')[0]
  const bannerTitle = banner.getElementsByClassName('title')[0]
  const bannerContent = banner.getElementsByClassName('content')[0]
  bannerTitle.textContent = cube.getFrontFace().url.toString()
  bannerContent.textContent = cube.getFrontFace().description
}

function triggerKonami() {
  function assignGameboyRandomColor() {
    document.documentElement.style.setProperty('--gameboyColor', gameboyColors[Math.floor(Math.random() * gameboyColors.length)]);
  }

  console.log('⭐ Konami ⭐')
  playSound('konami')

  const r = setInterval(() => {
    assignGameboyRandomColor()
  }, 200)

  setInterval(() => {
    clearInterval(r)
  }, 1000)
}

export function fireControl(command: Action) {
  function getShowCaseObjectWithLowestViewscore(): ShowcaseObject {
    let min = -1
    let result
    ShowcaseObjects.forEach(object => {
      if (object.viewScore < min || min == -1) {
        min = object.viewScore
        result = object
      }
    })
    return result
  }

  function changeFacets(): void{
    if (ShowcaseObjects.length > 4) {
      const object = getShowCaseObjectWithLowestViewscore()
      cube.assignFacet(object.url, object.description)
      object.viewScore += 1
    }
  }
  // todo: refactor. Instead of doing logic per command do it per state. Much cleaner. Use unique helper function to trigger state change.
  switch (command) {
    case "up":
      switch (STATE) {
        case "selected":
        showInfoBanner()
          playSound()
          break
        case "idle":
          playSound('error')
      }
      break
    case "down":
      switch (STATE) {
        case "selected":
          hideInfoBanner()
          playSound()
          break
        case "idle":
          playSound('error')
      }
      break
    case "left":
      cube.rotateOverYAxis(-Math.PI / 2)
      switch (STATE) {
        case "selected":
          showAndUpdatePopup()
          break
      }
      changeFacets()
      showAndUpdatePopup()
      playSound()
      break
    case "right":
      cube.rotateOverYAxis(Math.PI / 2)
      switch (STATE) {
        case "selected":
          showAndUpdatePopup()
          break
      }
      changeFacets()
      showAndUpdatePopup()
      playSound()
      break
    case "back":
      if (isHelpMenuOn()) toggleHelpMenu();
      switch (STATE) {
        case "selected":
          cube.rotateOverYAxis(0)
          camera.reset()
          hideInfoBanner()
          hidePopup()
          playSound()
          STATE = "idle"
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
          playSound()
          showAndUpdatePopup()
          break
        case "selected":
          playSound()
          open(cube.getFrontFace().url.toString())
          break
      }
      break
    case "start":
      playSound()
      toggleHelpMenu()
      break
    case "select":
      playSound()
      open("https://alramalhosandbox.s3.eu-west-1.amazonaws.com/Curriculo.pdf")
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
      if (lastMoves[i] != konamiCode[i]) {
        return false
      }
    }
    return true
  }

  if (checkKonamiCode()) {
    triggerKonami()
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
    button.onclick = () => {
      fnCallback();
    }
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

  const StartSelectWrapper = document.getElementsByClassName('start-select')[0]
  StartSelectWrapper.appendChild(createButton(() => fireControl("select"), 'SELECT', ['select']))
  StartSelectWrapper.appendChild(createButton(() => fireControl("start"), 'START', ['start']))


  document.addEventListener('keydown', function (event) {
    switch (event.key) {
      case "ArrowLeft":
        fireControl('left')
        break;
      case "ArrowRight":
        fireControl('right')
        break;
      case "ArrowUp":
        fireControl('up')
        break;
      case "ArrowDown":
        fireControl('down')
        break;
      case "Backspace":
      case "B":
      case "b":
        fireControl("back")
        break
      case "Enter":
      case "A":
      case "a":
        fireControl("enter")
        break
      case "Z":
      case "z":
        fireControl("select")
        break
      case "X":
      case "x":
        fireControl("start")
        break
    }
  });
}

function updateEverySecond() {
  updateInfoBanner()
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

function onWindowResize() {
  camera.object.aspect = container.clientWidth / container.clientHeight;
  camera.object.updateProjectionMatrix();

  glRenderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize, false);
