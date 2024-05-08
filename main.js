import * as THREE from 'three'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { color } from 'three/examples/jsm/nodes/Nodes.js'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xeeeeee) // Cambia el fondo a un color claro para ver las sombras
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }) // Material Phong por defecto

function centerCameraOnShapes() {
    // Calcular el centro de todas las formas geométricas
    const boundingBox = new THREE.Box3().setFromObject(scene)
    const center = boundingBox.getCenter(new THREE.Vector3())

    // Establecer la posición de la cámara para que apunte hacia el centro
    const distance =
        Math.max(
            boundingBox.max.x - boundingBox.min.x,
            boundingBox.max.y - boundingBox.min.y,
            boundingBox.max.z - boundingBox.min.z,
        ) * 1.5 // Multiplicador para asegurar que todas las formas sean visibles
    const direction = new THREE.Vector3(1, 1, 1).normalize()
    const offset = direction.multiplyScalar(distance)
    const newPosition = center.clone().add(offset)
    camera.position.copy(newPosition)
    camera.lookAt(center)
}

const esfera = new THREE.Mesh(new THREE.SphereGeometry(75, 20, 10), material)
scene.add(esfera)

const icosaedro = new THREE.Mesh(new THREE.IcosahedronGeometry(75, 1), material)
scene.add(icosaedro)

const octaedro = new THREE.Mesh(new THREE.OctahedronGeometry(75, 2), material)
scene.add(octaedro)

const tetraedro = new THREE.Mesh(new THREE.TetrahedronGeometry(75, 0), material)
scene.add(tetraedro)

const cubo = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100, 4, 4, 4), material)
scene.add(cubo)

const cilindro = new THREE.Mesh(new THREE.CylinderGeometry(20, 75, 100, 40, 5), material)
scene.add(cilindro)

const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff })

function addEdges(mesh) {
    const edgesGeometry = new THREE.EdgesGeometry(mesh.geometry)
    const lineSegments = new THREE.LineSegments(edgesGeometry, lineMaterial)
    mesh.add(lineSegments)
}

addEdges(esfera)
addEdges(icosaedro)
addEdges(octaedro)
addEdges(tetraedro)
addEdges(cubo)
addEdges(cilindro)

camera.position.set(5, 5, 5)
controls.update()

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
}

function createPanel() {
    const panel = new GUI({ width: 310 })

    const polygonShapes = {
        Esfera: 0,
        Icosaedro: 1,
        Octaedro: 2,
        Tetraedro: 3,
        Cubo: 4,
        Cono: 5,
    }

    const folder1 = panel.addFolder('Formas del Poligono')
    const folder2 = panel.addFolder('Propiedades del Poligono')

    const shapeControls = {}
    const materialControls = {}

    // Agregar un control deslizable para cada forma
    for (const shape in polygonShapes) {
        shapeControls[shape] = true // Por defecto, todas las formas están activadas
        folder1.add(shapeControls, shape).onChange(() => toggleShape(shape, shapeControls[shape]))
    }

    // Agregar control para cambiar el color del material
    materialControls.Color = material.color.getHex()
    folder2.addColor(materialControls, 'Color').onChange(color => {
        material.color.setHex(color)
        scene.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.material.color.setHex(color)
            }
        })
    })

    // Agregar control para cambiar el tamaño de todas las formas
    folder2.add({ Tamaño: 1 }, 'Tamaño', 0.1, 2).onChange(size => {
        scene.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.scale.set(size, size, size)
            }
        })
    })

    // Agregar un control deslizable para degradado de color
    const gradientControl = { 'Degradado de Color': 0 }
    folder2.add(gradientControl, 'Degradado de Color', -1, 1, 0.1).onChange(gradient => {
        // Calculamos el color base
        const baseColor = new THREE.Color(materialControls.Color)

        // Calculamos el color modificado con base en el degradado
        const modifiedColor = new THREE.Color().copy(baseColor).lerp(new THREE.Color(0xffffff), Math.abs(gradient))

        // Aplicamos el nuevo color a todas las formas
        material.color.copy(modifiedColor)
        scene.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.material.color.copy(modifiedColor)
            }
        })
    })

    function toggleShape(shape, enabled) {
        switch (shape) {
            case 'Esfera':
                esfera.visible = enabled
                break
            case 'Icosaedro':
                icosaedro.visible = enabled
                break
            case 'Octaedro':
                octaedro.visible = enabled
                break
            case 'Tetraedro':
                tetraedro.visible = enabled
                break
            case 'Cubo':
                cubo.visible = enabled
                break
            case 'Cono':
                cilindro.visible = enabled
                break
            default:
                break
        }
    }

    folder1.open()
    folder2.open()
}

if (WebGL.isWebGLAvailable()) {
    // Iniciar funciones o otras inicializaciones aquí
    animate()
    createPanel()
    centerCameraOnShapes()
} else {
    const warning = WebGL.getWebGLErrorMessage()
    document.getElementById('container').appendChild(warning)
}
