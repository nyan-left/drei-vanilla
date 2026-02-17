import * as THREE from 'three'
import { Setup } from '../Setup'
import { Meta } from '@storybook/html'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

import { CubeCamera, CubeCameraType } from '../../src/core/CubeCamera'

export default {
  title: 'Camera/CubeCamera',
} as Meta

let gui: GUI

export const CubeCameraStory = async () => {
  const { renderer, scene, camera, render } = Setup()
  gui = new GUI({ title: CubeCameraStory.storyName })

  camera.position.set(0, 10, 40)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.update()

  scene.fog = new THREE.Fog('#f0f0f0', 100, 200)
  scene.background = new THREE.Color('#f0f0f0')

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5 * Math.PI)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 2)
  dirLight.position.set(10, 10, 10)
  scene.add(dirLight)

  const box = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshStandardMaterial({ color: 'hotpink' }))
  box.position.y = 2.5
  scene.add(box)

  scene.add(new THREE.GridHelper(100, 10))

  const sphere1 = createReflectiveSphere(renderer, scene, { position: [-10, 10, 0], frames: Infinity })
  const sphere2 = createReflectiveSphere(renderer, scene, { position: [10, 9, 0], frames: Infinity })

  scene.add(sphere1.cubeCamera.group)
  scene.add(sphere2.cubeCamera.group)

  const folder = gui.addFolder('Sphere 1')
  folder.add(sphere1.mesh.position, 'x', -20, 20)
  folder.add(sphere1.mesh.position, 'y', 0, 20)
  folder.add(sphere1.mesh.position, 'z', -20, 20)

  let elapsed = 0
  render((time) => {
    const dt = time * 0.001
    elapsed = dt
    controls.update()

    sphere1.mesh.position.y = Math.sin(elapsed) * 5 + 10
    sphere2.mesh.position.y = Math.sin(2000 + elapsed) * 5 + 9

    sphere1.cubeCamera.update()
    sphere2.cubeCamera.update()
  })
}

function createReflectiveSphere(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  opts: { position: [number, number, number]; frames?: number }
) {
  const cubeCamera = CubeCamera(renderer, scene, { resolution: 256, frames: opts.frames })

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(5, 64, 64),
    new THREE.MeshStandardMaterial({ roughness: 0, metalness: 1, envMap: cubeCamera.texture })
  )
  mesh.position.set(...opts.position)
  cubeCamera.group.add(mesh)

  cubeCamera.camera.position.copy(mesh.position)

  return { cubeCamera, mesh }
}

CubeCameraStory.storyName = 'Default'
