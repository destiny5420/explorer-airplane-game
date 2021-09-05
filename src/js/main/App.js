import gsap from 'gsap'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import { CODE_ENTER } from 'keycode-js'

const Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xf5986e,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
}

const cameraData = {
  gameToResultDuration: 1,
  gamePos: {
    x: -235.104,
    y: 205.22,
    z: 118.99,
  },
  gameRot: {
    x: -1.143,
    y: -1.048,
    z: -1.086,
  },
  resultPos: {
    x: 83.521,
    y: 118.229,
    z: 70.522,
  },
  resultRot: {
    x: -1.132,
    y: 1.054,
    z: 1.075,
  },
}

const airPlaneData = {
  resultPos: {
    x: 0,
    y: 90,
    z: 3,
  },
}

const gameData = {
  status: 0, // 0: idle / 1: playing / 2: game over
}

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

let camera = null
let renderer = null

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

const AirPlane = function () {
  this.mesh = new THREE.Object3D()

  // Create the cabin
  const geomCockpit = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1)
  const matCockpit = new THREE.MeshPhongMaterial({
    color: Colors.red,
    flatShading: THREE.FlatShading,
  })
  const cockpit = new THREE.Mesh(geomCockpit, matCockpit)
  cockpit.castShadow = true
  cockpit.receiveShadow = true
  this.mesh.add(cockpit)

  // Create the engine
  const geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1)
  const matEngine = new THREE.MeshPhongMaterial({
    color: Colors.white,
    flatShading: THREE.FlatShading,
  })
  const engine = new THREE.Mesh(geomEngine, matEngine)
  engine.position.x = 40
  engine.castShadow = true
  engine.receiveShadow = true
  this.mesh.add(engine)

  // Create the tail
  const geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1)
  const matTailPlane = new THREE.MeshPhongMaterial({
    color: Colors.red,
    flatShading: THREE.FlatShading,
  })
  const tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane)
  tailPlane.position.set(-35, 25, 0)
  tailPlane.castShadow = true
  tailPlane.receiveShadow = true
  this.mesh.add(tailPlane)

  // Create the wing
  const geomSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1)
  const matSideWing = new THREE.MeshPhongMaterial({
    color: Colors.red,
    flatShading: THREE.FlatShading,
  })
  const sideWing = new THREE.Mesh(geomSideWing, matSideWing)
  sideWing.castShadow = true
  sideWing.receiveShadow = true
  this.mesh.add(sideWing)

  // propeller
  const geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1)
  const matPropeller = new THREE.MeshPhongMaterial({
    color: Colors.brown,
    flatShading: THREE.FlatShading,
  })
  this.propeller = new THREE.Mesh(geomPropeller, matPropeller)
  this.propeller.castShadow = true
  this.propeller.receiveShadow = true

  // blades
  const geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1)
  const matBlade = new THREE.MeshPhongMaterial({
    color: Colors.brownDark,
    flatShading: THREE.FlatShading,
  })

  const blade = new THREE.Mesh(geomBlade, matBlade)
  blade.position.set(8, 0, 0)
  blade.castShadow = true
  blade.receiveShadow = true
  this.propeller.add(blade)
  this.propeller.position.set(50, 0, 0)
  this.mesh.add(this.propeller)
}

let sea = null
const createSea = function () {
  const self = this

  sea = new Sea()
  sea.mesh.position.y = -600
  self.scene.add(sea.mesh)
}

let sky = null
const createSky = function () {
  const self = this

  sky = new Sky()
  sky.mesh.position.y = -600
  self.scene.add(sky.mesh)
}

let airPlane = null
const createAirPlane = function () {
  const self = this

  airPlane = new AirPlane()
  airPlane.mesh.scale.set(0.25, 0.25, 0.25)
  airPlane.mesh.position.y = 100
  self.scene.add(airPlane.mesh)
}

let prevMouseX = 0

let mousePos = {
  x: 0.0,
  y: 0.0,
}
const handleMouseMove = function (evt) {
  const tx = -1 + (evt.clientX / window.innerWidth) * 2
  const ty = 1 - (evt.clientY / window.innerHeight) * 2

  mousePos = {
    x: tx,
    y: ty,
  }
}

const normalize = function (v, vmin, vmax, tmin, tmax) {
  const nv = Math.max(Math.min(v, vmax), vmin)
  const dv = vmax - vmin
  const pc = (nv - vmin) / dv
  const dt = tmax - tmin
  const tv = tmin + pc * dt
  return tv
}

const cameraMoveToResult = function () {
  gsap
    .timeline()
    .fromTo(
      camera.position,
      {
        x: cameraData.gamePos.x,
        y: cameraData.gamePos.y,
        z: cameraData.gamePos.z,
      },
      {
        x: cameraData.resultPos.x,
        y: cameraData.resultPos.y,
        z: cameraData.resultPos.z,
        duration: cameraData.gameToResultDuration,
        ease: 'none',
      },
    )
    .fromTo(
      camera.rotation,
      {
        x: cameraData.gameRot.x,
        y: cameraData.gameRot.y,
        z: cameraData.gameRot.z,
      },
      {
        x: cameraData.resultRot.x,
        y: cameraData.resultRot.y,
        z: cameraData.resultRot.z,
        duration: cameraData.gameToResultDuration,
        ease: 'none',
      },
      `-=${cameraData.gameToResultDuration}`,
    )
}

const airplaneMoveToResult = function () {
  gsap.timeline().to(airPlane.mesh.position, {
    x: airPlaneData.resultPos.x,
    y: airPlaneData.resultPos.y,
    z: airPlaneData.resultPos.z,
  })
}

const updatePlane = function () {
  if (gameData.status === 2) {
    return
  }

  const targetY = normalize(mousePos.y, -0.5, 0.5, 10, 130)
  const targetZ = normalize(mousePos.x, -0.75, 0.75, -100, 200)

  airPlane.mesh.position.y += (targetY - airPlane.mesh.position.y) * 0.1
  airPlane.mesh.position.z += (targetZ - airPlane.mesh.position.z) * 0.05
  airPlane.mesh.rotation.z = (targetY - airPlane.mesh.position.y) * 0.0128
  airPlane.mesh.rotation.y = (airPlane.mesh.position.y - targetY) * 0.005

  airPlane.propeller.rotation.x += 0.3

  // console.log(
  //   `airPlane / x: ${airPlane.mesh.position.x} / y: ${airPlane.mesh.position.y} / z: ${airPlane.mesh.position.z}`,
  // )

  if (prevMouseX > mousePos.x) {
    gsap.timeline().to(airPlane.mesh.rotation, {
      x: -0.5,
      duration: 0.5,
      ease: 'none',
    })
  } else if (prevMouseX < mousePos.x) {
    gsap.timeline().to(airPlane.mesh.rotation, {
      x: 0.5,
      duration: 0.5,
      ease: 'none',
    })
  } else {
    gsap.timeline().to(airPlane.mesh.rotation, {
      x: 0,
      duration: 0.5,
      ease: 'none',
    })
  }

  prevMouseX = mousePos.x
}

const eventObj = function () {
  const self = this

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

  window.addEventListener('keyup', function (e) {
    if (e.code === CODE_ENTER) {
      gameData.status = 2
      cameraMoveToResult()
      airplaneMoveToResult()
    }
  })

  document.addEventListener('mousemove', handleMouseMove, false)
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

  createSea.call(self)
  createSky.call(self)
  createAirPlane.call(self)

  /**
   * Camera
   */
  // Base camera
  camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 1, 10000)
  camera.position.x = cameraData.gamePos.x
  camera.position.y = cameraData.gamePos.y
  camera.position.z = cameraData.gamePos.z
  camera.rotation.x = cameraData.gameRot.x
  camera.rotation.y = cameraData.gameRot.y
  camera.rotation.z = cameraData.gameRot.z
  self.scene.add(camera)

  // Controls÷

  /**
   * Renderer
   */
  renderer = new THREE.WebGLRenderer({
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

    // // Update controls
    // if (gameData.status !== 2) {

    // }

    airPlane.propeller.rotation.x += 0.3
    sea.mesh.rotation.z += 0.005
    sky.mesh.rotation.z += 0.001

    updatePlane()

    // Render
    renderer.render(self.scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
  }

  tick()

  eventObj.call(self)
}

export default App
