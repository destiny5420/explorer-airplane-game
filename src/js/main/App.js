import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'

const Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xf5986e,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
}

const Sea = function () {
  const geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10)

  geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2))

  const mat = new THREE.MeshPhongMaterial({
    color: Colors.blue,
    transparent: true,
    opacity: 6,
    flatShading: THREE.FlatShading,
  })

  this.mesh = new THREE.Mesh(geom, mat)

  this.mesh.receiveShadow = true
}

const Cloud = function () {
  this.mesh = new THREE.Object3D()

  const geom = new THREE.BoxGeometry(20, 20, 20)

  const mat = new THREE.MeshPhongMaterial({
    color: Colors.white,
  })

  const blockCnt = 3 + Math.floor(Math.random() * 3)

  for (let i = 0; i < blockCnt; i += 1) {
    const m = new THREE.Mesh(geom, mat)

    m.position.x = i * 15
    m.position.y = Math.random() * 10
    m.position.z = Math.random() * 10
    m.rotation.z = Math.random() * Math.PI * 2
    m.rotation.y = Math.random() * Math.PI * 2

    const scale = 0.1 + Math.random() * 0.9
    m.scale.set(scale, scale, scale)

    m.castShadow = true
    m.receiveShadow = true

    this.mesh.add(m)
  }
}

const Sky = function () {
  this.mesh = new THREE.Object3D()

  this.cloudCnt = 20

  const stepAngle = (Math.PI * 2) / this.cloudCnt

  for (let i = 0; i < this.cloudCnt; i += 1) {
    const cloud = new Cloud()

    const a = stepAngle * i
    const h = 750 + Math.random() * 200

    cloud.mesh.position.y = Math.sin(a) * h
    cloud.mesh.position.x = Math.cos(a) * h

    cloud.mesh.rotation.z = a + Math.PI / 2

    cloud.mesh.position.z = -400 - Math.random() * 400

    const scale = 1 + Math.random() * 2
    cloud.mesh.scale.set(scale, scale, scale)

    this.mesh.add(cloud.mesh)
  }
}

const createSea = function () {
  const self = this

  const sea = new Sea()
  sea.mesh.position.y = -600
  self.scene.add(sea.mesh)
}

const createSky = function () {
  const self = this

  const sky = new Sky()
  sky.mesh.position.y = -600
  self.scene.add(sky.mesh)
}

function App() {
  const self = this
  console.log('The construct of App.')

  /**
   * Base
   */
  // Debug
  const gui = new dat.GUI()

  // Canvas
  const canvas = document.querySelector('canvas.webgl')

  // Scene
  self.scene = new THREE.Scene()
  self.scene.fog = new THREE.Fog(0xf7d9aa, 100, 950)

  /**
   * Lights
   */

  // Hemisphere light
  const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9)

  // Directional light
  const shadowLight = new THREE.DirectionalLight(0xffffff, 0.9)

  shadowLight.position.set(150, 350, 350)
  shadowLight.castShadow = true

  shadowLight.shadow.camera.left = -400
  shadowLight.shadow.camera.right = 400
  shadowLight.shadow.camera.top = 400
  shadowLight.shadow.camera.bottom = -400
  shadowLight.shadow.camera.near = 1
  shadowLight.shadow.camera.far = 1000

  shadowLight.shadow.mapSize.width = 2048
  shadowLight.shadow.mapSize.height = 2048

  self.scene.add(hemisphereLight)
  self.scene.add(shadowLight)

  /**
   * Materials
   */
  const material = new THREE.MeshStandardMaterial()
  material.roughness = 0.7
  gui.add(material, 'metalness').min(0).max(1).step(0.001)
  gui.add(material, 'roughness').min(0).max(1).step(0.001)

  /**
   * Objects
   */
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material)
  sphere.castShadow = true

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material)
  plane.rotation.x = -Math.PI * 0.5
  plane.position.y = -0.5
  plane.receiveShadow = true

  self.scene.add(sphere, plane)

  createSea.call(self)
  createSky.call(self)

  /**
   * Sizes
   */
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  /**
   * Camera
   */
  // Base camera
  const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 1, 10000)
  camera.position.x = 0
  camera.position.y = 200
  camera.position.z = 100
  self.scene.add(camera)

  // Controls
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true

  /**
   * Renderer
   */
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvas,
  })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  /**
   * Animate
   */
  const clock = new THREE.Clock()

  const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(self.scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
  }

  tick()

  window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })
}

export default App
