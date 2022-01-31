import * as THREE from 'three'

class Cube {
  glScene: THREE.Scene
  mesh: THREE.Mesh
  readonly side: number
  targetRotation: THREE.Euler
  onGoingTimeout: NodeJS.Timeout
  materialArray: THREE.MeshMaterial[]

  constructor(glScene: THREE.Scene, side: number) {
    this.glScene = glScene
    const geometry = new THREE.BoxBufferGeometry(side, side, side).center();
    this.mesh = new THREE.Mesh(geometry)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.glScene.add(this.mesh)
    this.side = side
    this.materialArray = [
      new THREE.MeshPhongMaterial({color: `#e5e5e5`, opacity: 0.5}),
      new THREE.MeshPhongMaterial({color: `#e5e5e5`, opacity: 0.5}),
      new THREE.MeshPhongMaterial({color: `#e5e5e5`, opacity: 0.5}),
      new THREE.MeshPhongMaterial({color: `#e5e5e5`, opacity: 0.5}),
      new THREE.MeshPhongMaterial({color: `#e5e5e5`, opacity: 0.5}),
      new THREE.MeshPhongMaterial({color: `#e5e5e5`, opacity: 0.5})
    ]
    this.targetRotation = new THREE.Euler(
      this.mesh.rotation.x,
      this.mesh.rotation.y,
      this.mesh.rotation.z
    )
  }

  update() {
    this.mesh.rotation.y = THREE.Math.lerp(this.mesh.rotation.y, this.targetRotation.y, 0.1);
  }

  rotateOverYAxis(amount: number) {
    this.targetRotation.y += amount
  }

  async assignFacet(face: 0 | 1 | 2 | 3 | 4 | 5, url: string) {
    // httpswwwalramalhocom-2022-01-30-fixed.png
    const image = new Image();
    image.src = <string>await toDataURL(url)
    let texture = new THREE.Texture();
    texture.image = image;
    image.onload = function () {
      texture.needsUpdate = true;
    };
    image.onload = () =>  { texture.needsUpdate = true };

    console.log(this.materialArray)
    this.materialArray[face] = new THREE.MeshBasicMaterial({map: texture});
    console.log(this.materialArray)
    this.mesh.material = this.materialArray
  }

}

const toDataURL = (url: string) => {
  return fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    }))
    .then(dataUrl => dataUrl)
    .catch(() => console.error("Couldn't load " + url))
}


export default Cube