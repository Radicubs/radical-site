import "server-only";

import { strapiFetch, strapiUrl } from "@/lib/strapi";

type UploadFile = {
  name: string;
  url: string;
  mime?: string;
};

const ROBOT_ASSETS = {
  background: "Robot Background.png",
  model: "2026-robot-hierarchical.glb",
  poster: "poster-assembled.webp",
  approach: "robot-approach-48fps.mp4",
  morphSource: "morph-source-final.jpg",
  morphEnvironment: "morph-environment-plate-1280.jpg",
} as const;

export type RobotAssetKey = keyof typeof ROBOT_ASSETS;

export async function getRobotAsset(key: RobotAssetKey) {
  const name = ROBOT_ASSETS[key];
  const files = await strapiFetch<UploadFile[]>("upload/files", {
    "filters[name][$eq]": name,
  });
  const file = files?.find((candidate) => candidate.name === name);
  const url = strapiUrl(file?.url);
  return url ? { ...file, url } : null;
}
