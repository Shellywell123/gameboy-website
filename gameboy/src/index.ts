import { getGPUTier } from "detect-gpu";
import * as THREE from "three";

import Camera from "./camera";
import Cube from "./cube";
import { Queue } from "./queue";

const gpu = getGPUTier();

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

let STATE: "idle" | "selected" = "idle"

interface ShowcaseObject {
  url: URL,
  title: string
  description: string
  viewScore: number
  imageUrl?: string // this needs to be of content/type "binary/octet-stream"
}

const ShowcaseObjects = [
  {
    url: new URL('https://www.linkedin.com/in/ben-shellswell/'),
    title: 'Linkedin',
    description: `<span> Get in touch with me via linkedin. </span>`,
    viewScore: 0,
    imageUrl: './src/assets/linkedin.png'
  } as ShowcaseObject,
  {
    title: `nothing 4`,
    description: `Nothing here yet`,
    viewScore: 0,
    imageUrl: './src/assets/question-mark.png'
  } as ShowcaseObject,
  {
    url: new URL('https://shellywell123.github.io/Grind-Boy.gb/build/web/index.html'),
    title: `Grind Boy .gb`,
    description: `<span>Homebrew Skateboarding platformer game for the Nintendo GameBoy.</span>`,
    viewScore: 0,
    imageUrl: './src/assets/grind-boy.png'
  } as ShowcaseObject,
  {
    url: new URL('https://www.github.com/shellywell123'),
    title: 'GitHub',
    description: `<span> The home to all the code for my projects.</span>`,
    viewScore: 0,
    imageUrl: './src/assets/github.png'
  } as ShowcaseObject,
  // keeping for when I figure out 6 faces
  // {
  //   title: `nothing 1`,
  //   description: `Nothing here yet`,
  //   viewScore: 0,
  //   imageUrl: './src/assets/question-mark.png'
  // } as ShowcaseObject,
  // {
  //   title: `nothing 2`,
  //   description: `Nothing here yet`,
  //   viewScore: 0,
  //   imageUrl: './src/assets/question-mark.png'
  // } as ShowcaseObject,
]

function init() {
  console.log('⭐ Konami? ⭐')

  container = document.querySelector('.display');

  glRenderer = createGlRenderer();
  glScene = new THREE.Scene();

  container.appendChild(glRenderer.domElement);

  camera = new Camera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000,
    new THREE.Vector3(0, 200, 3300),
    new THREE.Euler(-Math.PI / 16, 0, 0)
  )
  camera.object.aspect = container.clientWidth / container.clientHeight;
  camera.object.updateProjectionMatrix();
  createLights();

  cube = new Cube(glScene, 900)

  ShowcaseObjects.forEach((object, index) => {
    cube.assignFacet(object.url, object.title, object.description, object.imageUrl)
  })

  createGameboy();
  showCubeMenu()
  updateCubeMenu()
  update()
  updateEveryQuarterSecond()

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
  var glRenderer = new THREE.WebGLRenderer({ alpha: true });

  glRenderer.setClearColor(`#e0f8d0`);
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

function playSound(id: string) {
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

function getShowCaseObjectWithHighestViewscore(): ShowcaseObject {
  let max = -1
  let result
  ShowcaseObjects.forEach(object => {
    if (object.viewScore > max || max == -1) {
      max = object.viewScore
      result = object
    }
  })
  return result
}

function hideCubeMenu() {
  const cubeMenu: any = document.getElementsByClassName('cube-menu')[0]
  cubeMenu.style.opacity = '0';
}

function showCubeMenu() {
  const cubeMenu: any = document.getElementsByClassName('cube-menu')[0]
  cubeMenu.style.opacity = '100%';
}

function updateCubeMenu() {
  ShowcaseObjects.forEach(object => object.viewScore = 0)
  ShowcaseObjects.forEach(object => {
    if (cube.faces.find(face => face && face.url == object.url)) {
      object.viewScore += 1
    }
  })

  const cubeMenu: any = document.getElementsByClassName('cube-menu')[0]
  cubeMenu.innerHTML = `<span>You're now viewing </span>
  ${ShowcaseObjects//.sort((a, b) => b.viewScore - a.viewScore)
      .map((object, index) => {
        if (getShowCaseObjectWithHighestViewscore().viewScore == object.viewScore) {
          if (cube.getFrontFace().url == object.url) {
            return `<p style="text-decoration-color: var(--gameboyColor); text-decoration-thickness: 0.1rem">${object.title}</p>`
          }
        }
      }).join('\n')}
  `
}

function hidePopup() {
  const popup: any = document.getElementsByClassName('popup')[0]
  popup.style.display = 'none';
}

function showAndUpdatePopup() {
  if (typeof window !== 'undefined' && window.innerWidth > 768) {
    const popup: any = document.getElementsByClassName('popup')[0]
    popup.style.display = 'block';
    const frontFace = cube.getFrontFace()
    popup.onclick = () => open(frontFace.url.toString())
    popup.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; line-height: 2rem">
      <div>
          <img style="height: 3rem" src="../assets/a.png" alt="A"></img>
          <span style="font-size: 2rem">or</span>
          <img style="height: 3rem" src="../assets/enter.png" alt="Enter"></img>
      </div>
      <span>to visit <i>${frontFace.title}</i> &rarr;</span>
      </div>
    `
  }
}

function updateInfoBanner() {
  const banner = document.getElementsByClassName('info-banner')[0]
  const bannerTitle = banner.getElementsByClassName('title')[0]
  const bannerContent = banner.getElementsByClassName('content')[0]
  bannerTitle.innerHTML = cube.getFrontFace().title
  bannerContent.innerHTML = cube.getFrontFace().description
}

function triggerKonami() {

  function resetGameboyColor() {
    document.documentElement.style.setProperty('--gameboyColor', `#E5D6CB`);
  }

  function assignGameboyRandomColor() {
    document.documentElement.style.setProperty('--gameboyColor', gameboyColors[Math.floor(Math.random() * gameboyColors.length)]);
  }

  playSound('konami')

  const r = setInterval(() => {
    assignGameboyRandomColor()
  }, 200)

  setInterval(() => {
    clearInterval(r)
    resetGameboyColor()
  }, 1000)  
}

function cameraMoveUpToShowInfoBanner() {
  const infoBannerHeightInPx: any = parseInt(getComputedStyle(document.documentElement.getElementsByClassName('info-banner')[0]).height.replace(/px/g, ""))
  camera.moveTo(new THREE.Vector3(
    camera.targetPosition.x,
    camera.targetPosition.y - infoBannerHeightInPx * 1,
    camera.targetPosition.z
  ))
}

function cameraMoveDownWhenHidingInfoBanner() {
  camera.moveTo(new THREE.Vector3(
    camera.targetPosition.x,
    camera.targetPosition.y + 500,
    camera.targetPosition.z
  ))
}

export function fireControl(command: Action) {

  // todo: refactor. Instead of doing logic per command do it per state. Much cleaner. Use unique helper function to trigger state change.
  switch (command) {

    case "up":
      cube.rotateUp()
      showAndUpdatePopup()
      break

    case "down":
      cube.rotateDown()
      showAndUpdatePopup()
      break

    case "left":
      cube.rotateLeft()
      showAndUpdatePopup()
      break

    case "right":
      cube.rotateRight()
      showAndUpdatePopup()
      break

    case "back":
      if (isHelpMenuOn()) toggleHelpMenu();
      switch (STATE) {
        case "selected":
          cube.rotateOverYAxis(0)
          camera.reset()
          hideInfoBanner()
          hidePopup()
          showCubeMenu()
          updateCubeMenu()
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
          camera.moveTo(
            new THREE.Vector3(0, 0, camera.object.position.z * 0.6),
            new THREE.Euler(0, camera.object.rotation.y, camera.object.rotation.z)
          )

          const transitionTime: number = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--infoBannerTransitionTimeInSeconds").replace("s", ""))
          window.setTimeout(() => cameraMoveUpToShowInfoBanner(), transitionTime / 3 * 1000)

          showAndUpdatePopup()
          hideCubeMenu()
          showInfoBanner()
          break

        case "selected":
          open(cube.getFrontFace().url.toString())
          break
      }
      break

    case "start":
      toggleHelpMenu()
      break

    case "select":
      triggerKonami()
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

function updateEveryQuarterSecond() {
  setInterval(() => {
    updateInfoBanner()
    updateCubeMenu()
  }, 250)
}

function update() {
  switch (STATE) {
    case "idle":
      cube.rotateOverYAxis(0.01) // spin
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
