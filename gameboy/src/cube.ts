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
      image.src = <string>await toDataURL('./src/assets/question-mark.png')
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
      new THREE.MeshPhongMaterial({ color: `#88c070`, opacity: 0.8 }),
      new THREE.MeshPhongMaterial({ color: `#88c070`, opacity: 0.8 }),
      new THREE.MeshPhongMaterial({ color: `#88c070`, opacity: 0.8 }),
      new THREE.MeshPhongMaterial({ color: `#88c070`, opacity: 0.8 }),
      new THREE.MeshPhongMaterial({ color: `#88c070`, opacity: 0.8 }),
      new THREE.MeshPhongMaterial({ color: `#88c070`, opacity: 0.8 })
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
      null,
    ]
  }

  update() {
    this.mesh.rotation.x = THREE.Math.lerp(this.mesh.rotation.x, this.targetRotation.x, 0.1);
    this.mesh.rotation.y = THREE.Math.lerp(this.mesh.rotation.y, this.targetRotation.y, 0.1);
    this.mesh.rotation.z = THREE.Math.lerp(this.mesh.rotation.z, this.targetRotation.z, 0.1);
  }

  rotateOverXAxis(amount: number) {
    this.targetRotation.x += amount
  }

  rotateOverYAxis(amount: number) {
    this.targetRotation.y += amount
  }

  rotateOverZAxis(amount: number) {
    this.targetRotation.z += amount
  }

  rotateLeft() {
    // if top face

    // if right way up side 
    this.rotateOverYAxis(Math.PI / 2)

    // if bottom face

    // if upsidedown todo
    // this.rotateOverYAxis(-Math.PI / 2)
  }

  rotateRight() {
    // if top face

    // if right way up side
    // if (Math.sin(this.mesh.rotation.x) == 0) {
      this.rotateOverYAxis(-Math.PI / 2)
    // }

    // if bottom space

    // if upsidedown todo
    // if (Math.sin(this.mesh.rotation.x) == 0) {
    //   this.rotateOverYAxis(-Math.PI / 2)
    // }
  }

  rotateUp() {
    // if right way up
    this.rotateOverXAxis(Math.PI / 2)
    // if upsidedown todo
    // this.rotateOverXAxis(Math.PI / 2)
  }
  
  rotateDown() {
    // if right way up
    this.rotateOverXAxis(-Math.PI / 2)
    // if upsidedown todo
    // this.rotateOverXAxis(-Math.PI / 2)
  }

  // rotateOverZAxis(amount number) {
  //   this.targetRotation.z += amount
  // }

  getNumberOfAvailableFaces(): number {
    let count = 0
    this.faces.forEach(face => {
      face == null ? count++ : null
    })
    return count
  }

  getFrontFace(baseRotationX: number = this.targetRotation.x, baseRotationY: number = this.targetRotation.y): CubeFace {
    return this.faces[this.getFrontFaceIndex(baseRotationX, baseRotationY)]
  }

  // axis is shifted (4th face is first, then (left rotation) 1st, 5th and 0th)
  getFrontFaceIndex(baseRotationX: number, baseRotationY: number): number {
    let x = (-Math.PI / 4) + (baseRotationX + Math.PI / 2) % (2 * Math.PI);
    let y = (-Math.PI / 4) + (baseRotationY + Math.PI / 2) % (2 * Math.PI);

    console.log("logsssss", x,y)

    // todo fire out how to do 6 faces
    // return 3 = bottom face
    // return 2 = top
    // todo figure out how to get top and bottom here
    // if (x == 3) {
    //     return 2
      
    // if (x >= 0) {
    //   if (x < Math.PI / 2) {
    //     return 6
    //   } else if (x < Math.PI) {
    //     return 5
    //   } else if (x < 3 * Math.PI / 2) {
    //     return 5
    //   } else if (x < 2 * Math.PI) {
    //     return 5
    //   }
    // }
    //  else {
    //   if (x > -Math.PI / 2) {
    //     return 6
    //   } else if (x > -Math.PI) {
    //     return 2
    //   } else if (x > -3 * Math.PI / 2) {
    //     return 3
    //   } else if (x > -2 * Math.PI) {
    //     return 6
    //   }
    // }

    // sides
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
      case 6:
        return this.getFrontFaceIndex(this.targetRotation.x + (0.50 * Math.PI), this.targetRotation.y + (0.00 * Math.PI)) // todo figure out x +
      case 5:
        return this.getFrontFaceIndex(this.targetRotation.x + (0.50 * Math.PI), this.targetRotation.y + (0.00 * Math.PI)) // todo figure out x + 
      case 4:
        return this.getFrontFaceIndex(this.targetRotation.x + (0.00 * Math.PI), this.targetRotation.y + (2.00 * Math.PI)) // todo figure out x +
      case 3:
        return this.getFrontFaceIndex(this.targetRotation.x + (0.00 * Math.PI), this.targetRotation.y + (1.50 * Math.PI))
      case 2:
        return this.getFrontFaceIndex(this.targetRotation.x + (0.00 * Math.PI), this.targetRotation.y + (1.00 * Math.PI))
      case 1:
        return this.getFrontFaceIndex(this.targetRotation.x + (0.00 * Math.PI), this.targetRotation.y + (0.50 * Math.PI))
      case 0:
        return this.getFrontFaceIndex(this.targetRotation.x - (0.50 * Math.PI), this.targetRotation.y + (0.00 * Math.PI))
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