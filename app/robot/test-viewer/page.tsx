"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import "./viewer.css";

const views = ["assembled", "front", "rear", "left", "right", "top", "bottom"] as const;
type View = (typeof views)[number];
const directions: Record<View, [number, number, number]> = {
  // This CAD export is Z-up. Its intake sits on +X, so front/rear mean the
  // actual intake and shooter ends of the robot, not generic glTF axes.
  assembled: [1.2, -1.45, 0.9], front: [1.8, 0, 0.15], rear: [-1.8, 0, 0.2],
  left: [0, -1.8, 0.2], right: [0, 1.8, 0.2], top: [0, -0.08, 2.2], bottom: [0, 0.08, -2.2],
};
const focusNames: Partial<Record<View, string[]>> = {
  front: ["Intake v78_1", "Intake v78"],
  rear: ["Shooter v3 v42_1", "Shooter v3 v42"],
  top: ["Electrical Board_1", "Electrical Board"],
  bottom: ["Inverted MK4i Swerve Module v6_1", "Inverted MK4i Swerve Module v6_2", "Inverted MK4i Swerve Module v6_3_1", "Inverted MK4i Swerve Module v6_4_1"],
};

export default function TestViewerPage() {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ setView: (view: View) => void; setExposure: (value: number) => void; capture: () => void } | null>(null);
  const activeView = useRef<View>("assembled");
  const [active, setActive] = useState<View>("assembled");
  const [status, setStatus] = useState("Loading textured v10 model…");

  useEffect(() => {
    const element = host.current; if (!element) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.22;
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x070a08);
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 1000); const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
    const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture; pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xdce8e3, 0x0b1b0d, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(12, -10, 18); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key);
    const rim = new THREE.DirectionalLight(0x66ff55, 1.2); rim.position.set(-14, 12, 8); scene.add(rim);
    let robot: THREE.Object3D | undefined; let modelSize = 8;
    let focusRoots: Partial<Record<View, THREE.Object3D[]>> = {};
    const isInside = (object: THREE.Object3D, root: THREE.Object3D) => {
      let candidate: THREE.Object3D | null = object;
      while (candidate) { if (candidate === root) return true; candidate = candidate.parent; }
      return false;
    };
    const applyFocus = (view: View) => {
      if (!robot) return;
      const roots = focusRoots[view] ?? [];
      robot.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        const focused = roots.length === 0 || roots.some((root) => isInside(mesh, root));
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          const standard = material as THREE.MeshStandardMaterial;
          if (!standard.isMeshStandardMaterial) return;
          standard.opacity = focused ? 1 : 0.09;
          standard.transparent = !focused || Boolean(standard.userData.originalTransparent);
          standard.depthWrite = focused;
          standard.needsUpdate = true;
        });
      });
    };
    const resize = () => { const rect = element.getBoundingClientRect(); camera.aspect = rect.width / Math.max(rect.height, 1); camera.updateProjectionMatrix(); renderer.setSize(rect.width, rect.height, false); };
    const setView = (view: View) => {
      if (!robot) return; const node = robot;
      const box = new THREE.Box3().setFromObject(node); const center = box.getCenter(new THREE.Vector3()); const extent = box.getSize(new THREE.Vector3()).length() || modelSize;
      const distance = ["assembled", "front", "top", "rear"].includes(view) ? modelSize * 1.25 : Math.max(extent * 2.35, 4.2);
      camera.position.copy(center).add(new THREE.Vector3(...directions[view]).normalize().multiplyScalar(distance)); controls.target.copy(center); controls.update(); applyFocus(view); activeView.current = view; setActive(view); setStatus(`${view} camera ready · drag to fine-tune`);
    };
    const loader = new GLTFLoader();
    // The team's exported v10 model uses EXT_meshopt_compression. Registering
    // the bundled decoder lets GLTFLoader read it directly in the browser.
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load("/robot/models/2026-robot-v10-test.glb", (gltf) => {
      robot = gltf.scene; robot.updateMatrixWorld(true); const bounds = new THREE.Box3().setFromObject(robot); const center = bounds.getCenter(new THREE.Vector3()); modelSize = bounds.getSize(new THREE.Vector3()).length(); robot.position.sub(center); scene.add(robot);
      focusRoots = Object.fromEntries(Object.entries(focusNames).map(([view, nodeNames]) => [view, nodeNames.map((name) => robot?.getObjectByName(name)).filter((node): node is THREE.Object3D => Boolean(node))]));
      robot.traverse((child) => { const mesh = child as THREE.Mesh; if (!mesh.isMesh) return; mesh.castShadow = true; mesh.receiveShadow = true; const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material]; const materials = source.map((material) => material.clone()); mesh.material = Array.isArray(mesh.material) ? materials : materials[0]; materials.forEach((material) => { const standard = material as THREE.MeshStandardMaterial; if (standard.isMeshStandardMaterial) { standard.userData.originalTransparent = standard.transparent; standard.envMapIntensity = 1.45; } }); });
      setView("assembled");
    }, undefined, (error) => {
      console.error("Robot GLB load failed", error);
      setStatus(`Could not load the GLB: ${error instanceof Error ? error.message : "see browser console"}`);
    });
    const capture = () => {
      renderer.render(scene, camera);
      const link = document.createElement("a");
      link.download = `radicubs-7503-${activeView.current}-view.png`;
      link.href = renderer.domElement.toDataURL("image/png");
      link.click();
      setStatus("PNG downloaded from the current camera view.");
    };
    api.current = { setView, setExposure: (value) => { renderer.toneMappingExposure = value; }, capture };
    resize(); const observer = new ResizeObserver(resize); observer.observe(element); renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
    return () => { observer.disconnect(); renderer.setAnimationLoop(null); renderer.dispose(); element.replaceChildren(); };
  }, []);

  return <main className="viewer"><div className="viewer__host" ref={host} /><aside className="viewer__panel"><h1>7503 camera bench</h1><p>Drag to orbit · scroll to zoom · use a viewpoint to reset the shot.</p><div className="viewer__views">{views.map((view) => <button key={view} className={active === view ? "active" : ""} onClick={() => api.current?.setView(view)}>{view}</button>)}</div><button className="viewer__capture" onClick={() => api.current?.capture()}>Download current PNG</button><label>Exposure <input type="range" min="0.75" max="1.8" step=".01" defaultValue="1.22" onChange={(event) => api.current?.setExposure(Number(event.target.value))} /></label></aside><p className="viewer__status">{status}</p></main>;
}
