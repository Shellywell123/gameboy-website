import * as THREE from 'three'

class CubeFace {
  url: URL
  title: string
  texture: THREE.Texture
  description: string

  constructor(url: URL, title: string, description: string) {
    this.url = url
    this.title = title
    this.description = description
  }

  async computeTexture(imageUrl?: string) {
    const image = new Image();
    let texture = new THREE.Texture();
    if (imageUrl !== undefined) {
      image.src = <string>await toDataURL(imageUrl)
    } else {
      image.src = <string>await toDataURL(this.getImageUrl(this.url))
    }
    image.onload = function () {
      texture.needsUpdate = true;
    };
    image.onload = () => {
      texture.needsUpdate = true
    };
    texture.image = image;
    this.texture = texture
  }

  getImageUrl(url: URL) {
    // todo make env var
    const bucket = "alramalhosandbox"
    return `https://${bucket}.s3.eu-west-1.amazonaws.com/screenshots/${url.toString().replace(/\W/g, '')}-${new Date().toJSON().slice(0, 7)}-fixed.png`
  }
}

class Cube {
  glScene: THREE.Scene
  mesh: THREE.Mesh
  readonly side: number
  targetRotation: THREE.Euler
  materialArray: THREE.MeshMaterial[]
  faces: [CubeFace | null, CubeFace | null, CubeFace, CubeFace, CubeFace | null, CubeFace | null]

  constructor(glScene: THREE.Scene, side: number) {
    this.glScene = glScene
    const geometry = new THREE.BoxBufferGeometry(side, side, side).center();
    this.mesh = new THREE.Mesh(geometry)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.glScene.add(this.mesh)
    this.side = side
    this.materialArray = [
      new THREE.MeshPhongMaterial({ color: `#e5e5e5`, opacity: 0.5 }),
      new THREE.MeshPhongMaterial({ color: `#e5e5e5`, opacity: 0.5 }),
      new THREE.MeshPhongMaterial({ color: `#e5e5e5`, opacity: 0.5 }),
      new THREE.MeshPhongMaterial({ color: `#e5e5e5`, opacity: 0.5 }),
      new THREE.MeshPhongMaterial({ color: `#e5e5e5`, opacity: 0.5 }),
      new THREE.MeshPhongMaterial({ color: `#e5e5e5`, opacity: 0.5 })
    ]
    this.targetRotation = new THREE.Euler(
      this.mesh.rotation.x,
      this.mesh.rotation.y,
      this.mesh.rotation.z
    )
    this.faces = [
      null,
      null,
      new CubeFace(new URL('http://www.irrelevant.pt'), '', ''),
      new CubeFace(new URL('http://www.irrelevant.pt'), '', ''),
      null,
      null
    ]
  }

  update() {
    this.mesh.rotation.y = THREE.Math.lerp(this.mesh.rotation.y, this.targetRotation.y, 0.1);
  }

  bump(side: "left" | "right") {
    switch (side) {
      case "left":
        this.rotateOverYAxis(-Math.PI / 16)
        setTimeout(() => this.rotateOverYAxis(Math.PI / 16), 100)
        break
      case "right":
        this.rotateOverYAxis(Math.PI / 16)
        setTimeout(() => this.rotateOverYAxis(-Math.PI / 16), 100)
        break
    }
  }

  rotateOverYAxis(amount: number) {
    this.targetRotation.y += amount
  }

  getNumberOfAvailableFaces(): number {
    let count = 6
    this.faces.forEach(face => {
      face !== null ? count-- : null
    })
    return count
  }

  getFrontFace(baseRotation: number = this.targetRotation.y): CubeFace {
    return this.faces[this.getFrontFaceIndex(baseRotation)]
  }
  // axis is shifted (4th face is first, then (left rotation) 1st, 5th and 0th)
  getFrontFaceIndex(baseRotation: number): number {
    let y = (-Math.PI / 4) + (baseRotation + Math.PI / 2) % (2 * Math.PI);
    if (y >= 0) {
      if (y < Math.PI / 2) {
        return 4
      } else if (y < Math.PI) {
        return 1
      } else if (y < 3 * Math.PI / 2) {
        return 5
      } else if (y < 2 * Math.PI) {
        return 0
      }
    } else {
      if (y > -Math.PI / 2) {
        return 0
      } else if (y > -Math.PI) {
        return 5
      } else if (y > -3 * Math.PI / 2) {
        return 1
      } else if (y > -2 * Math.PI) {
        return 4
      }
    }
  }

  getAvailableFaceIndex(): number {
    let numberOfAvailableFaces = this.getNumberOfAvailableFaces()
    switch (numberOfAvailableFaces) {
      case 4:
        return this.getFrontFaceIndex(this.targetRotation.y)
      case 3:
        return this.getFrontFaceIndex(this.targetRotation.y + Math.PI / 2)
      case 2:
        return this.getFrontFaceIndex(this.targetRotation.y + Math.PI)
      case 1:
        return this.getFrontFaceIndex(this.targetRotation.y + 3 * Math.PI / 2)
      case 0:
        return this.getFrontFaceIndex(this.targetRotation.y + Math.PI)
    }
  }

  async assignFacet(url: URL, title: string, description: string, imageUrl: string | undefined = undefined) {
    const faceIndex = this.getAvailableFaceIndex()
    this.faces[faceIndex] = new CubeFace(url, title, description)
    await this.faces[faceIndex].computeTexture(imageUrl)

    this.materialArray[faceIndex] = new THREE.MeshBasicMaterial({ map: this.faces[faceIndex].texture });
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