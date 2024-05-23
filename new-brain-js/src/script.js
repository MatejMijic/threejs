import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { InstancedUniformsMesh } from "three-instanced-uniforms-mesh";
import { gsap } from "gsap";

import brainVertexShader from "./shaders/brain/vertex.glsl";
import brainFragmentShader from "./shaders/brain/fragment.glsl";

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let intersects = [];
let point = new THREE.Vector3();
let hover = false;
let uniforms = {
  uHover: 0,
};

window.addEventListener("mousemove", (event) => {
  onMousemove(event);
});

let brain;
let instancedMesh;
let material;

const colors = [
  new THREE.Color(0xe3b8f6),
  new THREE.Color(0xbd96d6),
  new THREE.Color(0x9875b6),
  new THREE.Color(0x745698),
  new THREE.Color(0x51387a),
];

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const axisHelper = new THREE.AxesHelper(100);

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

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.set(0, 0, 1.2);

const light = new THREE.DirectionalLight(0xffffff, 1);
scene.add(light);

scene.add(camera);

const gltfLoader = new GLTFLoader();

const gui = new dat.GUI();
gui.add(camera.position, "z").min(1).max(200).step(1);

gltfLoader.load("/models/my-small-brain.glb", (gltf) => {
  brain = gltf.scene.children[0];

  // Create the `InstancedMesh`
  // Create the `InstancedMesh`
  const geometry = new THREE.TorusGeometry(0.5, 0.1, 5, 100);
  geometry.rotateX(Math.PI * 0.5);
  geometry.rotateZ(Math.PI * 0.5);

  material = new THREE.ShaderMaterial({
    vertexShader: brainVertexShader,
    fragmentShader: brainFragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color() },
      uSize: { value: 0 },
      uTime: { value: 0 },
    },
  });

  instancedMesh = new InstancedUniformsMesh(
    geometry,
    material,
    brain.geometry.attributes.position.count
  );

  const parent = new THREE.Object3D();
  parent.rotateX(Math.PI * 0.5);
  parent.rotateZ(Math.PI * 0.5);
  parent.add(instancedMesh);

  // Add the `InstancedMesh` to the scene
  scene.add(parent);

  // Dummy `Object3D` that will contain the matrix of each instance
  const dummy = new THREE.Object3D();

  // Get the X, Y and Z values of each vertex of the geometry and use them to
  // set the position of each instance.
  // Also set the `uColor` and `uRotation` uniforms.
  const positions = brain.geometry.attributes.position.array;

  let minZ = positions[2];
  let maxZ = positions[2];

  for (let i = 2; i < positions.length; i += 3) {
    minZ = Math.min(minZ, positions[i]);
    maxZ = Math.max(maxZ, positions[i]);
  }

  // Calculate the range and the size of each part
  const range = maxZ - minZ;
  const partSize = range / 5;

  for (let i = 0; i < positions.length; i += 3) {
    dummy.position.set(positions[i + 0], positions[i + 1], positions[i + 2]);

    dummy.updateMatrix();

    instancedMesh.setMatrixAt(i / 3, dummy.matrix);

    instancedMesh.setUniformAt(
      "uSize",
      i / 3,
      THREE.MathUtils.randFloat(0.3, 1)
    );

    const z = positions[i + 2];
    const colorIndex = Math.min(
      Math.floor((z - minZ) / partSize),
      colors.length - 1
    );

    instancedMesh.setUniformAt("uColor", i / 3, colors[colorIndex]);
  }

  // Update the instance matrices
  instancedMesh.instanceMatrix.needsUpdate = true;
});

const renderer = new THREE.WebGLRenderer({
  canvas,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0x191124, 1);

const clock = new THREE.Clock();

var prevIntersected = [];

const tick = () => {
  renderer.render(scene, camera);

  const elapsedTime = clock.getElapsedTime();

  if (material) {
    material.uniforms.uTime.value = elapsedTime;
  }

  window.requestAnimationFrame(tick);
};

tick();

function onMousemove(e) {
  const x = (e.clientX / canvas.offsetWidth) * 2 - 1;
  const y = -((e.clientY / canvas.offsetHeight) * 2 - 1);

  mouse.set(x, y);
}

function animateHoverUniform(value) {}
