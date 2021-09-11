import gsap from 'gsap'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import { CODE_A, CODE_ENTER, CODE_UP } from 'keycode-js'

const Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xf5986e,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
}

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

let mousePos = {
  x: 0.0,
  y: 0.0,
}

let prevMouseX = 0
let game = null
let scene = null
let camera = null
let renderer = null
let sea = null
let sky = null
let airPlane = null
let hemisphereLight = null
let ambientLight = null
let shadowLight = null
let coinManager = null
let newTime = new Date().getTime()
let oldTime = new Date().getTime()
let deltaTime = 0

const Sea = function () {
  const geom = new THREE.CylinderGeometry(game.seaRadius, game.seaRadius, game.seaLength, 40, 10)

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

function addEnergy() {
  game.energy += game.coinValue
  game.energy = Math.min(game.energy, 100)
  console.log(`AddEnergy / energy: ${game.energy}`)
}

function removeEnergy() {
  game.energy -= game.ennemyValue
  game.energy = Math.max(0, game.energy)

  console.error(`removeEnergy / energy: ${game.energy}`)
}

const Coin = function () {
  const geom = new THREE.TetrahedronBufferGeometry(5, 0)
  const mat = new THREE.MeshPhongMaterial({
    color: 0x009999,
    shininess: 0,
    specular: 0xffffff,
    flatShading: THREE.FlatShading,
  })
  this.mesh = new THREE.Mesh(geom, mat)
  this.mesh.castShadow = true
  this.angle = 0
  this.dist = 0
}
const CoinManager = function (count) {
  this.mesh = new THREE.Object3D()

  this.coinsInUse = []
  this.coinsPool = []
  for (let i = 0; i < count; i += 1) {
    const coin = new Coin()
    this.coinsPool.push(coin)
  }
}

CoinManager.prototype.spawnCoins = function () {
  const coinCount = 1 + Math.floor(Math.random() * 10)

  const distance =
    game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight - 20)

  const amplitude = 10 + Math.round(Math.random() * 10)
  const baseZ = Math.random() * 200

  for (let i = 0; i < coinCount; i += 1) {
    let coin = null

    if (this.coinsPool.length) {
      coin = this.coinsPool.pop()
    } else {
      coin = new Coin()
    }

    this.mesh.add(coin.mesh)
    this.coinsInUse.push(coin)
    coin.angle = -(i * 0.02)
    coin.dist = distance + Math.cos(i * 0.5) * amplitude
    coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle) * coin.dist
    coin.mesh.position.x = Math.cos(coin.angle) * coin.dist
    coin.mesh.position.z = baseZ + i * 5
  }
}

CoinManager.prototype.rotateCoins = function () {
  for (let i = 0; i < this.coinsInUse.length; i += 1) {
    const coin = this.coinsInUse[i]

    coin.angle += game.speed * deltaTime * game.coinsSpeed
    coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle) * coin.dist
    coin.mesh.position.x = Math.cos(coin.angle) * coin.dist
    coin.mesh.rotation.z += Math.random() * 0.1
    coin.mesh.rotation.y += Math.random() * 0.1

    const diffPos = airPlane.mesh.position.clone().sub(coin.mesh.position.clone())
    const d = diffPos.length()

    // if the airplane collides with the coin
    if (d < game.coinDistanceTolerance) {
      console.log('The coin collide with airplane!!!')
      this.coinsPool.unshift(this.coinsInUse.splice(i, 1)[0])
      this.mesh.remove(coin.mesh)
      addEnergy()
      i -= 1
    } else if (coin.angle > Math.PI) {
      this.coinsPool.unshift(this.coinsInUse.splice(i, 1)[0])
      this.mesh.remove(coin.mesh)
      i -= 1
    }
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
        x: game.cameraPlayingGamePos.x,
        y: game.cameraPlayingGamePos.y,
        z: game.cameraPlayingGamePos.z,
      },
      {
        x: game.cameraResultPos.x,
        y: game.cameraResultPos.y,
        z: game.cameraResultPos.z,
        duration: game.cameraGameToResultDuration,
        ease: 'none',
      },
    )
    .fromTo(
      camera.rotation,
      {
        x: game.cameraPlayingGameRot.x,
        y: game.cameraPlayingGameRot.y,
        z: game.cameraPlayingGameRot.z,
      },
      {
        x: game.cameraResultRot.x,
        y: game.cameraResultRot.y,
        z: game.cameraResultRot.z,
        duration: game.cameraGameToResultDuration,
        ease: 'none',
      },
      `-=${game.cameraGameToResultDuration}`,
    )
}

const airplaneMoveToResult = function () {
  gsap.timeline().to(airPlane.mesh.position, {
    x: game.planeResultPos.x,
    y: game.planeResultPos.y,
    z: game.planeResultPos.z,
  })
}

function updatePlane() {
  game.planeSpeed = normalize(mousePos.x, -0.5, 0.5, game.planeMinSpeed, game.planeMaxSpeed)
  const targetY = normalize(mousePos.y, -0.5, 0.5, game.planeMinY, game.planeMaxY)
  const targetZ = normalize(mousePos.x, -0.75, 0.75, game.planeMinZ, game.planeMaxZ)

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

function updateDistance() {
  game.distance += game.speed * deltaTime * game.ratioSpeedDistance
}

function updateEnergy() {
  game.energy -= game.speed * deltaTime * game.ratioSpeedEnergy
  game.energy = Math.max(0, game.energy)

  if (game.energy < 1) {
    game.status = 'gameover'
  }
}

function onWindowResize() {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

function onMouseMoveEvent(evt) {
  const tx = -1 + (evt.clientX / window.innerWidth) * 2
  const ty = 1 - (evt.clientY / window.innerHeight) * 2

  mousePos = {
    x: tx,
    y: ty,
  }
}

function onKeyupEvent(evt) {
  switch (evt.code) {
    case CODE_ENTER:
      cameraMoveToResult()
      airplaneMoveToResult()
      break
    case CODE_A:
      ambientLight.intensity = 2
      break
    default:
      break
  }
}

function resetGame() {
  console.log(`Reset Game`)
  game = {
    speed: 0,
    initSpeed: 0.00035,
    baseSpeed: 0.00035,
    targetBaseSpeed: 0.00035,
    incrementSpeedByTime: 0.0000025,
    incrementSpeedByLevel: 0.000005,
    distanceForSpeedUpdate: 100,
    speedLastUpdate: 0,

    distance: 0,
    ratioSpeedDistance: 50,
    energy: 100,
    ratioSpeedEnergy: 3,

    level: 1,
    levelLastUpdate: 0,
    distanceForLevelUpdate: 1000,

    planeDefaultHeight: 100,
    planeAmpHeight: 80,
    planeAmpWidth: 75,
    planeMoveSensivity: 0.005,
    planeRotXSensivity: 0.0008,
    planeRotZSensivity: 0.0004,
    planeFallSpeed: 0.001,
    planeMinSpeed: 1.2,
    planeMaxSpeed: 1.6,
    planeMaxY: 150,
    planeMinY: 10,
    planeMaxZ: 250,
    planeMinZ: -120,
    PlaneResultPos: {
      x: 0,
      y: 90,
      z: 3,
    },
    planeSpeed: 0,
    planeCollisionDisplacementX: 0,
    planeCollisionSpeedX: 0,

    planeCollisionDisplacementY: 0,
    planeCollisionSpeedY: 0,

    seaRadius: 600,
    seaLength: 800,

    wavesMinAmp: 5,
    wavesMaxAmp: 20,
    wavesMinSpeed: 0.001,
    wavesMaxSpeed: 0.003,

    cameraFarPos: 500,
    cameraNearPos: 150,
    cameraSensivity: 0.002,
    cameraGameToResultDuration: 1,
    cameraPlayingGamePos: {
      x: -235.104,
      y: 205.22,
      z: 118.99,
    },
    cameraPlayingGameRot: {
      x: -1.143,
      y: -1.048,
      z: -1.086,
    },
    cameraResultPos: {
      x: 83.521,
      y: 118.229,
      z: 70.522,
    },
    cameraResultRot: {
      x: -1.132,
      y: 1.054,
      z: 1.075,
    },

    coinDistanceTolerance: 15,
    coinValue: 3,
    coinsSpeed: 0.5,
    coinLastSpawn: 0,
    distanceForCoinsSpawn: 100,

    ennemyDistanceTolerance: 10,
    ennemyValue: 10,
    ennemiesSpeed: 0.6,
    ennemyLastSpawn: 0,
    distanceForEnnemiesSpawn: 50,

    status: 'playing',
  }
}

function createScene() {
  // canvas
  const canvas = document.querySelector('canvas.webgl')

  // scene
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950)

  // camera
  camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 1, 10000)
  camera.position.x = game.cameraPlayingGamePos.x
  camera.position.y = game.cameraPlayingGamePos.y
  camera.position.z = game.cameraPlayingGamePos.z
  camera.rotation.x = game.cameraPlayingGameRot.x
  camera.rotation.y = game.cameraPlayingGameRot.y
  camera.rotation.z = game.cameraPlayingGameRot.z

  // renderer
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvas,
  })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  window.addEventListener('resize', onWindowResize, false)
}

function createLights() {
  // hemisphere light
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9)

  // ambientLight
  ambientLight = new THREE.AmbientLight(0xdc8874, 0.5)
  ambientLight.intensity = 0

  // shadow light
  shadowLight = new THREE.DirectionalLight(0xffffff, 0.9)
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

  scene.add(hemisphereLight)
  scene.add(shadowLight)
  scene.add(ambientLight)
}

function createAirPlane() {
  airPlane = new AirPlane()
  airPlane.mesh.scale.set(0.25, 0.25, 0.25)
  airPlane.mesh.position.y = game.planeDefaultHeight
  scene.add(airPlane.mesh)
}

function createSea() {
  sea = new Sea()
  sea.mesh.position.y = -game.seaRadius
  scene.add(sea.mesh)
}

function createSky() {
  sky = new Sky()
  sky.mesh.position.y = -600
  scene.add(sky.mesh)
}

function createCoins() {
  coinManager = new CoinManager(20)
  scene.add(coinManager.mesh)
}

function onPlaying() {
  if (
    Math.floor(game.distance) % game.distanceForCoinsSpawn === 0 &&
    Math.floor(game.distance) > game.coinLastSpawn
  ) {
    console.warn(`spawn coins`)
    game.coinLastSpawn = Math.floor(game.distance)
    coinManager.spawnCoins()
  }

  if (
    Math.floor(game.distance) % game.distanceForSpeedUpdate === 0 &&
    Math.floor(game.distance) > game.speedLastUpdate
  ) {
    console.warn(`update game speed`)
    game.speedLastUpdate = Math.floor(game.distance)
    game.targetBaseSpeed += game.incrementSpeedByTime * deltaTime
  }

  updatePlane()
  updateDistance()
  updateEnergy()

  game.baseSpeed += (game.targetBaseSpeed - game.baseSpeed) * deltaTime * 0.02
  game.speed = game.baseSpeed * game.planeSpeed
}

function onGameOver() {
  console.log(`Game Over`)
  game.speed *= 0.99
  game.status = 'waitingReplay'
}

function onWaitingReplay() {}
function update() {
  newTime = new Date().getTime()
  deltaTime = newTime - oldTime
  oldTime = newTime

  switch (game.status) {
    case 'playing':
      onPlaying()
      break
    case 'gameover':
      onGameOver()
      break
    case 'waitingReplay':
      onWaitingReplay()
      break
    default:
      break
  }

  airPlane.propeller.rotation.x += 0.3
  sea.mesh.rotation.z += 0.005
  sky.mesh.rotation.z += 0.001

  if (ambientLight.intensity < 0.005) {
    ambientLight.intensity = 0
  } else {
    ambientLight.intensity += (0.0 - ambientLight.intensity) * deltaTime * 0.005
  }

  coinManager.rotateCoins()

  renderer.render(scene, camera)
  requestAnimationFrame(update)
}

function init() {
  console.log(`Init`)

  resetGame()

  createScene()
  createLights()
  createAirPlane()
  createSea()
  createSky()
  createCoins()

  document.addEventListener('mousemove', onMouseMoveEvent, false)
  document.addEventListener('keyup', onKeyupEvent, false)

  update()
}

function App() {
  window.onpageshow = init
}

export default App
