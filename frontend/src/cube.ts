import * as THREE from 'three'
import {CSS3DObject} from 'three/examples/jsm/renderers/CSS3DRenderer'

class CubeFace {
  plane: THREE.Mesh
  cssObject: CSS3DObject
  targetRotation: THREE.Euler
  targetPosition: THREE.Vector3

  constructor(plane: THREE.Mesh, cssObject: CSS3DObject) {
    this.plane = plane
    this.cssObject = cssObject
    this.targetPosition = new THREE.Vector3(
      this.plane.position.x,
      this.plane.position.y,
      this.plane.position.z
    )
    this.targetRotation = new THREE.Euler(
      this.plane.rotation.x,
      this.plane.rotation.y,
      this.plane.rotation.z
    )
  }

  update() {
    this.plane.position.x = THREE.Math.lerp(this.plane.position.x, this.targetPosition.x, 0.1);
    this.plane.position.y = THREE.Math.lerp(this.plane.position.y, this.targetPosition.y, 0.1);
    this.plane.position.z = THREE.Math.lerp(this.plane.position.z, this.targetPosition.z, 0.1);

    this.plane.rotation.y = THREE.Math.lerp(this.plane.rotation.y, this.targetRotation.y, 0.1);

    this.cssObject.position.x = this.plane.position.x
    this.cssObject.position.y = this.plane.position.y
    this.cssObject.position.z = this.plane.position.z

    this.cssObject.rotation.y = this.plane.rotation.y
  }

  rotateOverYAxis(theta: number) {
    this.targetRotation.y = this.targetRotation.y + theta
    this.targetPosition.setFromSphericalCoords(
      new THREE.Spherical().setFromVector3(this.targetPosition).radius,
      Math.PI / 2,
      this.targetRotation.y
    )
  }
}

class Cube {
  glScene: THREE.Scene
  cssScene: THREE.Scene
  mesh: THREE.Mesh
  readonly side: number
  targetRotation: THREE.Euler
  readonly faces: CubeFace[]
  onGoingTimeout: NodeJS.Timeout


  constructor(glScene: THREE.Scene, cssScene: THREE.Scene, side: number) {
    this.glScene = glScene
    this.cssScene = cssScene
    const geometry = new THREE.BoxBufferGeometry(side, side, side).center();
    this.mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
      color: `#e5e5e5`,
      opacity: 0.5
    }))
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.glScene.add(this.mesh)
    this.side = side
    this.targetRotation = new THREE.Euler(
      this.mesh.rotation.x,
      this.mesh.rotation.y,
      this.mesh.rotation.z
    )
    this.faces = []
  }

  update() {
    this.faces.forEach(face => face.update())
    this.mesh.rotation.y = THREE.Math.lerp(this.mesh.rotation.y, this.targetRotation.y, 0.1);
  }

  rotateOverYAxis(amount: number, hideFaces: boolean = true) {
    if (hideFaces) {
      this.faces.forEach(face => {
        face.plane.visible = false
        face.cssObject.visible = false
      })
      if (this.onGoingTimeout !== undefined) clearTimeout(this.onGoingTimeout)
      this.onGoingTimeout = setTimeout(() => {
        this.faces.forEach(face => {
          face.plane.visible = true
          face.cssObject.visible = true
        })
      }, 1000) // todo visual feedback that the face is "loading"
    }

    this.faces.forEach(face => face.rotateOverYAxis(amount))

    this.targetRotation.y += amount
  }

  assignFacet(face: 0 | 1 | 2 | 3, url: string) {
    let position = new THREE.Vector3()
    let rotation = new THREE.Euler()
    position.x = this.mesh.position.x
    position.y = this.mesh.position.y
    position.z = this.mesh.position.z

    rotation.x = this.mesh.rotation.x
    rotation.y = this.mesh.rotation.y
    rotation.z = this.mesh.rotation.z

    const buffer = -4

    switch (face) {
      case 0:
        position.z = this.side / 2 + buffer
        break
      case 1:
        position.x = this.side / 2 + buffer
        rotation.y = Math.PI / 2
        break
      case 2:
        position.z = -(this.side / 2 + buffer)
        rotation.y = Math.PI
        break
      case 3:
        position.x = -(this.side / 2 + buffer)
        rotation.y = 3 * Math.PI / 2
        break
    }

    let plane = Cube.createPlane(this.side + buffer / 2, this.side + buffer / 2, position, rotation)
    let object = Cube.createCssObject(this.side + buffer / 2, this.side + buffer / 2, position, rotation, url)
    this.faces.push(new CubeFace(plane, object))
    this.glScene.add(plane)
    this.cssScene.add(object)
  }

  private static createPlane(w, h, position, rotation) {

    const material = new THREE.MeshPhongMaterial({
      color: 0x000000,
      opacity: 0.0,
      side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneGeometry(w, h);

    let plane = new THREE.Mesh(geometry, material);

    plane.position.x = position.x;
    plane.position.y = position.y;
    plane.position.z = position.z;

    plane.rotation.x = rotation.x;
    plane.rotation.y = rotation.y;
    plane.rotation.z = rotation.z;

    return plane;
  }


  private static createCssObject(w, h, position, rotation, url) {

    const html = [

      '<div style="width:' + w + 'px; height:' + h + 'px;">',
      '<iframe src="' + url + '" width="' + w + '" height="' + h + '">',
      '</iframe>',
      '</div>'

    ].join('\n');

    let div = document.createElement('div')

    div.innerHTML = html

    let cssObject = new CSS3DObject(div);

    cssObject.position.x = position.x;
    cssObject.position.y = position.y;
    cssObject.position.z = position.z;

    cssObject.rotation.x = rotation.x;
    cssObject.rotation.y = rotation.y;
    cssObject.rotation.z = rotation.z;

    return cssObject;
  }

}

export default Cube