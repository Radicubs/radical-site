"use client";

import { useEffect, useRef } from "react";
import type { Material, Mesh } from "three";

// Same-origin server proxy for the hierarchy-preserving CMS GLB. This keeps
// CMS credentials private and avoids cross-origin loader failures.
const MODEL_URL = "/api/robot-assets/model";
const BACKGROUND_URL = "/api/robot-assets/background";

/** The calibrated assembled pose from the alignment bench. Keep this as the
 * single source of truth before introducing the exploded subsystem states. */
const ASSEMBLED = {
  position: [0, -0.3, -0.15] as const,
  rotationZ: 125.25,
  scale: 0.11,
  camera: [0, -13.3, 0.025] as const,
  fov: 66.1,
};

export function CmsRobotHero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let frame = 0;
    let observer: ResizeObserver | undefined;
    let renderer: import("three").WebGLRenderer | undefined;

    void (async () => {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const { MeshoptDecoder } = await import("three/examples/jsm/libs/meshopt_decoder.module.js");
      if (disposed || !stageRef.current || !canvasRef.current) return;

      const scene = new THREE.Scene();
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      canvasRef.current.replaceChildren(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(ASSEMBLED.fov, 16 / 9, 0.1, 1000);
      camera.position.set(...ASSEMBLED.camera);
      camera.lookAt(0, 0, 0);
      const model = new THREE.Group();
      model.position.set(...ASSEMBLED.position);
      model.rotation.z = THREE.MathUtils.degToRad(ASSEMBLED.rotationZ);
      model.scale.setScalar(ASSEMBLED.scale);

      const key = new THREE.DirectionalLight(0xffffff, 2.3);
      key.position.set(35, -35, 48);
      const fill = new THREE.HemisphereLight(0xdce8e3, 0x172421, 1.35);
      const rim = new THREE.DirectionalLight(0x78d66a, 0.75);
      rim.position.set(-28, 30, 24);
      scene.add(key, fill, rim, model);

      const resize = () => {
        const rect = stageRef.current?.getBoundingClientRect();
        if (!rect || !renderer) return;
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
        renderer.setSize(rect.width, rect.height, false);
        renderer.render(scene, camera);
      };
      observer = new ResizeObserver(resize);
      observer.observe(stageRef.current);
      resize();

      try {
        const response = await fetch(MODEL_URL);
        if (!response.ok) throw new Error(`CMS model returned ${response.status}`);
        const buffer = await response.arrayBuffer();
        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);
        loader.parse(buffer, "", (gltf) => {
          if (disposed) return;
          const loaded = gltf.scene;
          loaded.updateMatrixWorld(true);
          const bounds = new THREE.Box3().setFromObject(loaded);
          loaded.position.sub(bounds.getCenter(new THREE.Vector3()));
          loaded.traverse((child) => {
            if (!(child as Mesh).isMesh) return;
            const mesh = child as Mesh;
            const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).filter(
              (material): material is Material => Boolean(material),
            );
            materials.forEach((material) => {
              material.side = THREE.DoubleSide;
              if ((material.name ?? "").toLowerCase().includes("polycarbonate")) {
                material.transparent = true;
                material.opacity = 0.38;
                material.depthWrite = false;
              }
            });
          });
          model.add(loaded);
          resize();
        });
      } catch {
        // The CMS background remains a useful, intentional fallback if a
        // temporary asset/CDN issue prevents the CAD model from arriving.
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      renderer?.dispose();
      canvasRef.current?.replaceChildren();
    };
  }, []);

  return (
    <div className="rb-cms-hero" ref={stageRef} aria-label="Calibrated 2026 robot model on its competition-field plate">
      <img src={BACKGROUND_URL} alt="" />
      <div className="rb-cms-hero__canvas" ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
