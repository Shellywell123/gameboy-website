import * as THREE from 'three'

class CubeFace {
  url: string
  texture: THREE.Texture

  constructor(url: string){
    this.url = url
  }

  async computeTexture(){
    const image = new Image();
    image.src = <string>await toDataURL(this.getImageUrl(this.url))
    let texture = new THREE.Texture();
    texture.image = image;
    image.onload = function () {
      texture.needsUpdate = true;
    };
    image.onload = () =>  { texture.needsUpdate = true };
    this.texture = texture
  }

  getImageUrl(url: string) {
    // todo make env var
    const bucket = "alramalhosandbox"
    return `https://${bucket}.s3.eu-west-1.amazonaws.com/screenshots/${url.replace(/\W/g, '')}-${new Date().toJSON().slice(0,7)}-fixed.png`
  }
}

class Cube {
  glScene: THREE.Scene
  mesh: THREE.Mesh
  readonly side: number
  targetRotation: THREE.Euler
  materialArray: THREE.MeshMaterial[]
  faces: [CubeFace | null, CubeFace | null, CubeFace | null, CubeFace | null, CubeFace | null, CubeFace | null]

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
    this.faces = [null, null, null, null, null, null]
  }

  update() {
    this.mesh.rotation.y = THREE.Math.lerp(this.mesh.rotation.y, this.targetRotation.y, 0.1);
  }

  rotateOverYAxis(amount: number) {
    this.targetRotation.y += amount
  }

  // axis is shifted (4th face is first, then (left rotation) 1st, 5th and 0th)
  getFrontFace(): CubeFace {
    let y = (-Math.PI / 4) + (this.targetRotation.y + Math.PI / 2) % (2*Math.PI);
    if (y >= 0) {
      if (y < Math.PI / 2) {
        return this.faces[4]
      } else if (y < Math.PI) {
        return this.faces[1]
      } else if (y < 3 * Math.PI / 2) {
        return this.faces[5]
      } else if (y < 2 * Math.PI) {
        return this.faces[0]
      }
    } else {
      if (y >- Math.PI / 2) {
        return this.faces[0]
      } else if (y >- Math.PI) {
        return this.faces[5]
      } else if (y >- 3 * Math.PI / 2) {
        return this.faces[1]
      } else if (y >- 2 * Math.PI) {
        return this.faces[4]
      }
    }
  }

  async assignFacet(face: 0 | 1 | 2 | 3 | 4 | 5, url: string) {
    this.faces[face] = new CubeFace(url)
    // httpswwwalramalhocom-2022-01-fixed.png
    await this.faces[face].computeTexture()

    this.materialArray[face] = new THREE.MeshBasicMaterial({map: this.faces[face].texture});
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