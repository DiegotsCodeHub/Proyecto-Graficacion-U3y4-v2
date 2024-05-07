import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

const scene = new THREE.Scene()
scene.background = null
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer({ alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

const geometry = new THREE.BoxGeometry(5, 5, 5)
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

// Resaltar aristas
const edges = new THREE.EdgesGeometry(geometry)
const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x0000ff }))
scene.add(line)

camera.position.set(5, 5, 5)
controls.update()

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
}

function createPanel() {
    const panel = new GUI({ width: 310 })

    const folder1 = panel.addFolder('Visibility')
    const folder2 = panel.addFolder('Activation/Deactivation')
    const folder3 = panel.addFolder('Pausing/Stepping')
    const folder4 = panel.addFolder('Crossfading')
    const folder5 = panel.addFolder('Blend Weights')
    const folder6 = panel.addFolder('General Speed')

    settings = {
        'show model': true,
        'show skeleton': false,
        'deactivate all': deactivateAllActions,
        'activate all': activateAllActions,
        'pause/continue': pauseContinue,
        'make single step': toSingleStepMode,
        'modify step size': 0.05,
        'from walk to idle': function () {
            prepareCrossFade(walkAction, idleAction, 1.0)
        },
        'from idle to walk': function () {
            prepareCrossFade(idleAction, walkAction, 0.5)
        },
        'from walk to run': function () {
            prepareCrossFade(walkAction, runAction, 2.5)
        },
        'from run to walk': function () {
            prepareCrossFade(runAction, walkAction, 5.0)
        },
        'use default duration': true,
        'set custom duration': 3.5,
        'modify idle weight': 0.0,
        'modify walk weight': 1.0,
        'modify run weight': 0.0,
        'modify time scale': 1.0,
    }

    folder1.add(settings, 'show model').onChange(showModel)
    folder1.add(settings, 'show skeleton').onChange(showSkeleton)

    folder2.add(settings, 'deactivate all')
    folder2.add(settings, 'activate all')

    folder3.add(settings, 'pause/continue')
    folder3.add(settings, 'make single step')
    folder3.add(settings, 'modify step size', 0.01, 0.1, 0.001)

    crossFadeControls.push(folder4.add(settings, 'from walk to idle'))
    crossFadeControls.push(folder4.add(settings, 'from idle to walk'))
    crossFadeControls.push(folder4.add(settings, 'from walk to run'))
    crossFadeControls.push(folder4.add(settings, 'from run to walk'))
    folder4.add(settings, 'use default duration')
    folder4.add(settings, 'set custom duration', 0, 10, 0.01)

    folder5
        .add(settings, 'modify idle weight', 0.0, 1.0, 0.01)
        .listen()
        .onChange(function (weight) {
            setWeight(idleAction, weight)
        })
    folder5
        .add(settings, 'modify walk weight', 0.0, 1.0, 0.01)
        .listen()
        .onChange(function (weight) {
            setWeight(walkAction, weight)
        })
    folder5
        .add(settings, 'modify run weight', 0.0, 1.0, 0.01)
        .listen()
        .onChange(function (weight) {
            setWeight(runAction, weight)
        })

    folder6.add(settings, 'modify time scale', 0.0, 1.5, 0.01).onChange(modifyTimeScale)

    folder1.open()
    folder2.open()
    folder3.open()
    folder4.open()
    folder5.open()
    folder6.open()
}

if (WebGL.isWebGLAvailable()) {
    // Initiate function or other initializations here
    animate()
    createPanel()
} else {
    const warning = WebGL.getWebGLErrorMessage()
    document.getElementById('container').appendChild(warning)
}
