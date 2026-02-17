import * as THREE from 'three'

export type CubeCameraProps = {
  /** Resolution of the FBO, default: 256 */
  resolution?: number
  /** Camera near, default: 0.1 */
  near?: number
  /** Camera far, default: 1000 */
  far?: number
  /** How many frames it will render, set it to Infinity for runtime, default: Infinity */
  frames?: number
  /** Custom environment map that is temporarily set as the scene's background */
  envMap?: THREE.Texture
  /** Custom fog that is temporarily set as the scene's fog */
  fog?: THREE.Fog | THREE.FogExp2
}

export type CubeCameraType = {
  /** Group whose children are hidden during cube capture, add your meshes here */
  group: THREE.Group
  /** The cube camera instance (added to group automatically) */
  camera: THREE.CubeCamera
  /** The render target */
  fbo: THREE.WebGLCubeRenderTarget
  /** The resulting cube texture, use as envMap */
  texture: THREE.CubeTexture
  /** Mutable params */
  params: CubeCameraProps
  /** Call in your render loop */
  update: () => void
}

export const CubeCamera = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  { resolution = 256, near = 0.1, far = 1000, frames = Infinity, envMap, fog }: CubeCameraProps = {}
): CubeCameraType => {
  const params: CubeCameraProps = { resolution, near, far, frames, envMap, fog }

  const fbo = new THREE.WebGLCubeRenderTarget(resolution)
  fbo.texture.type = THREE.HalfFloatType

  const camera = new THREE.CubeCamera(near, far, fbo)

  // hidden during cube filming
  const group = new THREE.Group()
  group.add(camera)

  let count = 0

  function update() {
    if (frames === Infinity || count < frames) {
      group.visible = false
      const originalFog = scene.fog
      const originalBackground = scene.background
      scene.background = params.envMap || originalBackground
      scene.fog = params.fog || originalFog
      camera.update(renderer, scene)
      scene.fog = originalFog
      scene.background = originalBackground
      group.visible = true
      count++
    }
  }

  return { group, camera, fbo, texture: fbo.texture, params, update }
}
