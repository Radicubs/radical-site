"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import MorphSlider from "@/components/MorphSlider";

const CMS_MODEL = "/api/robot-assets/model";

type Disposable = { dispose: () => void };

function styleRobotMeshes(robot: THREE.Object3D, resources: Disposable[]) {
  robot.updateMatrixWorld(true);
  robot.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.computeBoundingBox();
    const worldSize = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());
    const dimensions = [worldSize.x, worldSize.y, worldSize.z].sort((a, b) => a - b);
    const ancestry: string[] = [];
    let cursor: THREE.Object3D | null = mesh;
    while (cursor && cursor !== robot) { ancestry.push(cursor.name); cursor = cursor.parent; }
    const partName = ancestry.join(" ").toLowerCase();
    const isLargeVerticalSheet = worldSize.z > 10 && Math.max(worldSize.x, worldSize.y) > 9 && dimensions[0] < 1.1;
    const originals = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const styled = originals.map((original) => {
      const material = (original as THREE.MeshStandardMaterial).clone();
      if (!material.isMeshStandardMaterial) return original;
      if (isLargeVerticalSheet) {
        material.metalness = 0.02;
        material.roughness = 0.2;
        material.transparent = true;
        material.opacity = 0.3;
        material.depthWrite = false;
        material.side = THREE.DoubleSide;
        material.envMapIntensity = 1.15;
        material.color.multiplyScalar(0.24);
      } else if (/bumper/.test(partName)) {
        material.metalness = 0;
        material.roughness = 0.94;
        material.envMapIntensity = 0.28;
      } else if (/wheel|roller|tread|belt|nitrile/.test(partName)) {
        material.metalness = 0.02;
        material.roughness = 0.74;
        material.envMapIntensity = 0.55;
      } else if (/motor|gear|bearing|shaft|screw/.test(partName)) {
        material.metalness = 0.48;
        material.roughness = 0.34;
        material.envMapIntensity = 1.3;
      } else if (/tube|plate|support|bracket|frame/.test(partName)) {
        material.metalness = 0.72;
        material.roughness = 0.26;
        material.envMapIntensity = 1.5;
      } else {
        material.metalness = 0.04;
        material.roughness = 0.48;
        material.envMapIntensity = 0.75;
      }
      material.needsUpdate = true;
      resources.push(material);
      return material;
    });
    mesh.material = Array.isArray(mesh.material) ? styled : styled[0];
  });
}

function makeDecalTexture(label: string, arrow: boolean, resources: Disposable[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f7f7f2";
    if (arrow) {
      context.beginPath();
      context.moveTo(68, 128);
      context.lineTo(178, 34);
      context.lineTo(178, 92);
      context.lineTo(264, 92);
      context.lineTo(264, 164);
      context.lineTo(178, 164);
      context.lineTo(178, 222);
      context.closePath();
      context.fill();
    }
    context.font = "900 188px Arial Black, Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, arrow ? 650 : 512, 132, arrow ? 690 : 900);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  resources.push(texture);
  return texture;
}

function addRobotSurfaceDetails(
  rig: THREE.Group,
  robot: THREE.Object3D,
  nativeFront: THREE.Vector3,
  resources: Disposable[],
) {
  const bumper = robot.getObjectByName("bumper") ?? robot.getObjectByName("28in x 28in bumper v3");
  const bumperBounds = bumper ? new THREE.Box3().setFromObject(bumper) : new THREE.Box3().setFromObject(robot);
  const center = bumperBounds.getCenter(new THREE.Vector3());
  const size = bumperBounds.getSize(new THREE.Vector3());
  const half = new THREE.Vector2(size.x / 2, size.y / 2);
  const rawFront = nativeFront.clone().setZ(0).normalize();
  const front = Math.abs(rawFront.x) > Math.abs(rawFront.y)
    ? new THREE.Vector3(Math.sign(rawFront.x), 0, 0)
    : new THREE.Vector3(0, Math.sign(rawFront.y), 0);
  const side = new THREE.Vector3(-front.y, front.x, 0).normalize();
  const normals = [front, front.clone().negate(), side, side.clone().negate()];
  const frontTexture = makeDecalTexture("7503", false, resources);
  const sideTexture = makeDecalTexture("7503", true, resources);

  normals.forEach((normal, index) => {
    const xDistance = Math.abs(normal.x) > 0.001 ? half.x / Math.abs(normal.x) : Number.POSITIVE_INFINITY;
    const yDistance = Math.abs(normal.y) > 0.001 ? half.y / Math.abs(normal.y) : Number.POSITIVE_INFINITY;
    const faceDistance = Math.min(xDistance, yDistance);
    const geometry = new THREE.PlaneGeometry(index < 2 ? 19 : 19.5, 3.35);
    const material = new THREE.MeshBasicMaterial({
      map: index < 2 ? frontTexture : sideTexture,
      transparent: true,
      alphaTest: 0.08,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    const decal = new THREE.Mesh(geometry, material);
    const horizontal = new THREE.Vector3(-normal.y, normal.x, 0).normalize();
    const basis = new THREE.Matrix4().makeBasis(horizontal, new THREE.Vector3(0, 0, 1), normal);
    decal.quaternion.setFromRotationMatrix(basis);
    decal.position.copy(center).addScaledVector(normal, faceDistance + 1.15);
    decal.renderOrder = 12;
    rig.add(decal);
    resources.push(geometry, material);
  });

  const ledGeometry = new THREE.CircleGeometry(0.72, 32);
  const ledMaterial = new THREE.MeshStandardMaterial({
    color: 0xff2508,
    emissive: 0xff1600,
    emissiveIntensity: 1.8,
    roughness: 0.18,
    metalness: 0,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const led = new THREE.Mesh(ledGeometry, ledMaterial);
  const horizontal = new THREE.Vector3(-front.y, front.x, 0).normalize();
  led.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(horizontal, new THREE.Vector3(0, 0, 1), front));
  led.position.copy(center).addScaledVector(front, Math.min(
    Math.abs(front.x) > 0.001 ? half.x / Math.abs(front.x) : Number.POSITIVE_INFINITY,
    Math.abs(front.y) > 0.001 ? half.y / Math.abs(front.y) : Number.POSITIVE_INFINITY,
  ) + 1.18).addScaledVector(horizontal, -10.8);
  led.position.z = center.z + 10.1;
  led.renderOrder = 13;
  rig.add(led);
  resources.push(ledGeometry, ledMaterial);

  const ledCoreGeometry = new THREE.CircleGeometry(0.34, 24);
  const ledCoreMaterial = new THREE.MeshBasicMaterial({ color: 0xfff7de, toneMapped: false, side: THREE.DoubleSide });
  const ledCore = new THREE.Mesh(ledCoreGeometry, ledCoreMaterial);
  ledCore.quaternion.copy(led.quaternion);
  ledCore.position.copy(led.position).addScaledVector(front, 0.04);
  ledCore.renderOrder = 14;
  rig.add(ledCore);
  resources.push(ledCoreGeometry, ledCoreMaterial);
}

function smooth(a: number, b: number, value: number) {
  const x = Math.min(1, Math.max(0, (value - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

function LiveStrapiRobot({ progress }: { progress: MutableRefObject<number> }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current; if (!element) return;
    let disposed = false;
    const resources: Disposable[] = [];
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0); renderer.setPixelRatio(Math.min(devicePixelRatio, 1)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92; element.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(28.5, 16 / 9, 0.1, 1000); camera.position.set(0, -13.3, 0.2); camera.lookAt(0, 0, 0);
    const rig = new THREE.Group(); rig.position.set(-0.216, -0.1, -0.417); rig.scale.set(0.149, 0.155, 0.15); scene.add(rig);
    const pmrem = new THREE.PMREMGenerator(renderer); const environment = pmrem.fromScene(new RoomEnvironment(), 0.04); scene.environment = environment.texture; pmrem.dispose();
    const key = new THREE.DirectionalLight(0xfff5e8, 1.9); key.position.set(35, -35, 48); const fill = new THREE.HemisphereLight(0xdce8e3, 0x172421, 0.82); const rim = new THREE.DirectionalLight(0x78d66a, 0.72); rim.position.set(-28, 30, 24); scene.add(key, fill, rim);
    let renderDirty = true;
    const resize = () => { const rect = element.getBoundingClientRect(); camera.aspect = rect.width / Math.max(rect.height, 1); camera.updateProjectionMatrix(); renderer.setSize(rect.width, rect.height, false); renderDirty = true; };
    resize(); const observer = new ResizeObserver(resize); observer.observe(element);
    const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
    void fetch(CMS_MODEL).then((response) => { if (!response.ok) throw new Error(`Strapi robot returned ${response.status}`); return response.arrayBuffer(); }).then((buffer) => new Promise<import("three/examples/jsm/loaders/GLTFLoader.js").GLTF>((resolve, reject) => loader.parse(buffer, "", resolve, reject))).then((gltf) => {
      if (disposed) return;
      const robot = gltf.scene; robot.updateMatrixWorld(true); const bounds = new THREE.Box3().setFromObject(robot); const center = bounds.getCenter(new THREE.Vector3()); robot.position.sub(center); robot.updateMatrixWorld(true);
      const shooter = robot.getObjectByName("Shooter_v3_v42_1") ?? robot.getObjectByName("Shooter v3 v42_1") ?? robot.getObjectByName("Shooter_v3_v42") ?? robot.getObjectByName("Shooter v3 v42");
      const direction = shooter ? new THREE.Box3().setFromObject(shooter).getCenter(new THREE.Vector3()) : new THREE.Vector3(-1, 1, 0);
      rig.rotation.z = shooter ? -Math.PI / 2 - Math.atan2(direction.y, direction.x) : THREE.MathUtils.degToRad(125.25);
      styleRobotMeshes(robot, resources);
      rig.add(robot);
      addRobotSurfaceDetails(rig, robot, direction, resources);
      element.dataset.loaded = "true";
      renderDirty = true;
    }).catch((error) => { if (!disposed) element.dataset.error = error instanceof Error ? error.message : "Strapi GLB failed"; });
    let lastOpacity = -1;
    renderer.setAnimationLoop(() => {
      const opacity = smooth(0.78, 1, progress.current);
      if (!renderDirty && Math.abs(opacity - lastOpacity) <= 0.0001) return;
      renderer.domElement.style.opacity = String(opacity);
      renderer.render(scene, camera);
      lastOpacity = opacity;
      renderDirty = false;
    });
    return () => { disposed = true; observer.disconnect(); renderer.setAnimationLoop(null); resources.forEach((resource) => resource.dispose()); environment.dispose(); renderer.dispose(); element.replaceChildren(); };
  }, [progress]);
  return <div className="robot-morph-overlay__live" ref={host} aria-label="2026 robot model loaded from Strapi" />;
}

export function RobotMorphOverlay({ progress }: { progress: MutableRefObject<number> }) {
  const items = useMemo(() => [{ image: "/api/robot-assets/morphSource" }, { image: "/api/robot-assets/morphEnvironment" }], []);
  return <div className="robot-morph-overlay"><div className="robot-morph-overlay__shader"><MorphSlider items={items} progressRef={progress} transition="melt" intensity={0.62} scale={2.8} aberration={0.14} drift={0} radius={0} loop={false} overlayColor="#000000" showCaptions={false} showControls={false} showIndicators={false} /></div><LiveStrapiRobot progress={progress} /></div>;
}
