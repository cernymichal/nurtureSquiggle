import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const LINE_CONTROL_POINTS = 30;
const LINE_SAMPLES = 100;
const BLOSSOM_SIZE = new THREE.Vector3(1.0, 1.5, 1.0);
const BLOSSOM_OFFSET = BLOSSOM_SIZE.clone().multiplyScalar(0.5);
const LINE_DELTA = .04;

const ROTATION_SPEED = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(.5);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = ROTATION_SPEED;
controls.enablePan = false;
controls.enableZoom = false;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI * 0.65;
controls.minPolarAngle = Math.PI * 0.35;
controls.update();

const createRandomLinePoints = () => {
  let controlPoints = [new THREE.Vector3(0, -5, 0)];
  for (let i = 0; i < LINE_CONTROL_POINTS; i++) {
    let controlPoint = new THREE.Vector3(
      Math.random(),
      Math.random(),
      Math.random()
    );
    controlPoint.multiply(BLOSSOM_SIZE).sub(BLOSSOM_OFFSET);
    controlPoints.push(controlPoint);
  }
  controlPoints.push(new THREE.Vector3(0, 5, 0));
  const curve = new THREE.CatmullRomCurve3(controlPoints);
  return curve.getPoints(LINE_SAMPLES);
};

const createLine = (points) => {
  const material = new THREE.LineDashedMaterial({
    color: 0xffffff,
    scale: 1,
    dashSize: 0,
    gapSize: 0,
  });

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  line.length = line.geometry.getAttribute("lineDistance").array.slice(-1)[0];
  material.gapSize = line.length;
  return line;
};

let points = createRandomLinePoints();
let line = createLine(points);
scene.add(line);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize, false);
onWindowResize();

let delta = LINE_DELTA;
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  line.material.dashSize += delta;

  if (line.material.dashSize >= line.length && delta > 0) {
    delta *= -1;
    scene.remove(line);
    line = createLine(points.reverse());
    line.material.dashSize = line.length;
    scene.add(line);
  }

  if (line.material.dashSize <= 0 && delta < 0) {
    delta *= -1;
    scene.remove(line);
    points = createRandomLinePoints();
    line = createLine(points);
    line.material.dashSize = 0;
    scene.add(line);
  }

  renderer.render(scene, camera);
}

animate();
