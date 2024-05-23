import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Cursor
const cursor = {
  x: 0,
  y: 0,
};

const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("/particles/2.png");

window.addEventListener("mousemove", (event) => {
  // Normalize the mouse position from -0.5 to 0.5
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // ? Update camera aspect ratio:
  camera.aspect = sizes.width / sizes.height;

  // ? When you change camera properties like aspect you also need to update the projection matrix:
  camera.updateProjectionMatrix();

  // ? Update renderer:
  renderer.setSize(sizes.width, sizes.height);

  // ? Update pixel ratio for performance (no need to render more pixels than the screen can display, or more than 2 in that manner):
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 100;
scene.add(camera);

// Brain
const gltfLoader = new GLTFLoader();

let mesh = new THREE.Mesh();
let particles = new THREE.Points();

const gui = new dat.GUI();

gltfLoader.load(
  "/models/my-small-brain.glb",
  (gltf) => {
    console.log("success");
    console.log(gltf);

    mesh = gltf.scene.children[0];

    // Get the geometry from the mesh
    const geometry = mesh.geometry;

    // Create a material for the particles
    const material = new THREE.PointsMaterial({
      color: 0xfcaaff,
      size: 1,
      transparent: true,
      alphaMap: particleTexture,
      // alphaTest: 0.001,
      // depthTest: false,
      // depthWrite: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    gui.add(material, "size").min(0).max(10).step(0.1).name("Texture size");

    // Create a points (particles) object
    particles = new THREE.Points(geometry, material);
    particles.rotateX(Math.PI / 2);

    // Normal mesh
    mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
    mesh.rotateX(Math.PI / 2);

    // Add the particles to the scene
    scene.add(particles);
    // scene.add(mesh);

    gui.add(camera.position, "z").min(0).max(500).step(0.1).name("Camera Z");
    gui
      .add(
        {
          scale: 1,
        },
        "scale"
      )
      .min(0)
      .max(10)
      .step(0.1)
      .name("Particles Scale")
      .onChange((value) => {
        particles.scale.set(value, value, value);
      });
  },
  (progress) => {
    console.log("progress");
    console.log(progress);
  },
  (error) => {
    console.log("error");
    console.log(error);
  }
);

// const axesHelper = new THREE.AxesHelper(4);
// scene.add(axesHelper);

const renderer = new THREE.WebGLRenderer({
  canvas,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0x191124, 1);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  renderer.render(scene, camera);

  const elapsedTime = clock.getElapsedTime();

  // Interpolate the position of the particles towards the target position
  particles.position.lerp(
    new THREE.Vector3(cursor.x * 35, -cursor.y * 35, 0),
    0.1
  );

  particles.rotation.z = elapsedTime * 0.1;
  mesh.rotation.z = elapsedTime * 0.1;

  window.requestAnimationFrame(tick);
};

tick();
