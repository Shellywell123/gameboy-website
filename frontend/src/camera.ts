import * as THREE from 'three'

class Camera {
  object: THREE.PerspectiveCamera
  targetPosition: THREE.Vector3
  targetRotation: THREE.Euler
  initialPosition: THREE.Vector3
  initialRotation: THREE.Euler

  constructor(
    fov: number,
    aspect: number,
    near: number,
    far: number,
    position: THREE.Vector3,
    rotation: THREE.Euler
  ) {
    this.object = new THREE.PerspectiveCamera(
      fov,
      aspect,
      near,
      far
  );

    this.object.position.set(position.x, position.y, position.z);
    this.object.rotation.x = rotation.x

    this.targetPosition = new THREE.Vector3(position.x, position.y, position.z)
    this.targetRotation = new THREE.Euler(rotation.x, rotation.y, rotation.z)

    this.initialPosition = new THREE.Vector3(position.x, position.y, position.z)
    this.initialRotation = new THREE.Euler(rotation.x, rotation.y, rotation.z)
  }

  reset() {
    this.targetRotation.set(
      this.initialRotation.x,
      this.initialRotation.y,
      this.initialRotation.z
    )
    this.targetPosition.set(
      this.initialPosition.x,
      this.initialPosition.y,
      this.initialPosition.z
    )
  }

  update() {
    this.object.position.set(
      THREE.Math.lerp(this.object.position.x, this.targetPosition.x, 0.2),
      THREE.Math.lerp(this.object.position.y, this.targetPosition.y, 0.2),
      THREE.Math.lerp(this.object.position.z, this.targetPosition.z, 0.2)
    )

    this.object.rotation.set(
      THREE.Math.lerp(this.object.rotation.x, this.targetRotation.x, 0.2),
      THREE.Math.lerp(this.object.rotation.y, this.targetRotation.y, 0.2),
      THREE.Math.lerp(this.object.rotation.z, this.targetRotation.z, 0.2)
    )
  }

  move(position: THREE.Vector3, rotation: THREE.Euler) {
    this.targetPosition.set(position.x, position.y, position.z)
    this.targetRotation.set(rotation.x, rotation.y, rotation.z)
  }
}

export default Camera