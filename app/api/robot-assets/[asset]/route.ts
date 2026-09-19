import { NextRequest } from "next/server";
import { getRobotAsset, type RobotAssetKey } from "@/lib/robot-cms";

export const dynamic = "force-dynamic";

const validAssets = new Set<RobotAssetKey>(["background", "model", "poster", "approach", "morphSource", "morphEnvironment"]);

export async function GET(request: NextRequest, { params }: { params: Promise<{ asset: string }> }) {
  const { asset } = await params;
  if (!validAssets.has(asset as RobotAssetKey)) return new Response("Not found", { status: 404 });

  const file = await getRobotAsset(asset as RobotAssetKey);
  if (!file) return new Response("Robot CMS asset is unavailable", { status: 404 });

  const range = request.headers.get("range");
  const upstream = await fetch(file.url, {
    cache: "no-store",
    headers: range ? { Range: range } : undefined,
  });
  if (!upstream.ok || !upstream.body) return new Response("Could not retrieve robot CMS asset", { status: 502 });

  const headers = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? file.mime ?? "application/octet-stream",
    "Cache-Control": "public, max-age=300, s-maxage=300",
  });
  for (const name of ["accept-ranges", "content-length", "content-range"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      ...Object.fromEntries(headers.entries()),
    },
  });
}
