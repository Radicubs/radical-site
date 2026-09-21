import { NextResponse } from "next/server";
import { site } from "@/data/site";
import {
  getBlogPosts,
  getDisciplineImages,
  getHomepageGallery,
  getMentors,
  getPhotoAlbum,
  getRobotFilmVideo,
  getSponsors,
  getJourneyImages,
  getTeamRosters
} from "@/lib/cms";

export const revalidate = 300;

// Every image the site can show anywhere, so the boot loader can warm the
// browser cache for it before the user ever navigates to that page — the
// gallery/team/sponsors pages otherwise fetch these for the first time only
// once you land on them, which reads as a blank/half-loaded page.
export async function GET() {
  const [posts, rosters, mentors, sponsors, homepageGallery, photoAlbum, journeyImages, disciplineImages, robotFilmVideo] =
    await Promise.all([
      getBlogPosts(),
      getTeamRosters(),
      getMentors(),
      getSponsors(),
      getHomepageGallery(),
      getPhotoAlbum(),
      getJourneyImages(),
      getDisciplineImages(),
      getRobotFilmVideo()
    ]);

  // The loader only gets a short window before it reveals the site and lets
  // the rest keep loading in the background. A team/sponsor avatar missing
  // just shows an existing placeholder (see TeamCard) — a few of those
  // lagging behind is barely noticeable. The photo album has no such
  // fallback: it's a pure image grid, so a partially-loaded /gallery reads
  // as broken in a way nothing else does. It goes first, in full, right
  // after the tiny local assets; everything else round-robins after it so
  // no other single page gets starved either.
  const local = ([site.markImage, site.wordmarkImage, site.robotImage] as string[]).filter(Boolean);
  const photoAlbumAll = photoAlbum.flatMap((photo) => [photo.thumbSrc, photo.src]).filter(Boolean);

  const byPage: string[][] = [
    rosters.flatMap((roster) => roster.members.map((member) => member.image)),
    sponsors.corporate.map((sponsor) => sponsor.logo),
    posts.flatMap((post) => (post.cover ? [post.cover] : [])),
    homepageGallery.photos.map((photo) => photo.src),
    mentors.flatMap((mentor) => (mentor.image ? [mentor.image] : [])),
    Object.values(journeyImages),
    Object.values(disciplineImages)
  ].map((list) => list.filter((url): url is string => Boolean(url)));

  const seen = new Set<string>();
  const images: string[] = [];
  for (const url of [...local, ...photoAlbumAll]) if (!seen.has(url)) { seen.add(url); images.push(url); }
  for (let i = 0; ; i++) {
    let any = false;
    for (const page of byPage) {
      const url = page[i];
      if (!url) continue;
      any = true;
      if (!seen.has(url)) { seen.add(url); images.push(url); }
    }
    if (!any) break;
  }

  // Lightbox full-res / hover-swap variants only ever matter after an
  // interaction, so they go last regardless of page.
  for (const photo of homepageGallery.photos) if (photo.fullSrc && !seen.has(photo.fullSrc)) { seen.add(photo.fullSrc); images.push(photo.fullSrc); }
  for (const sponsor of sponsors.corporate) {
    if (sponsor.loopLogo && !seen.has(sponsor.loopLogo)) { seen.add(sponsor.loopLogo); images.push(sponsor.loopLogo); }
    if (sponsor.pageLogo && !seen.has(sponsor.pageLogo)) { seen.add(sponsor.pageLogo); images.push(sponsor.pageLogo); }
  }

  // Heavy media (video/3D) is warmed in the background without gating the
  // loader on it — fully downloading these before showing the site would
  // make first load painfully slow.
  const heavy = new Set<string>();
  if (robotFilmVideo) heavy.add(robotFilmVideo);
  heavy.add("/robot/fullvideo-scroll.mp4");
  heavy.add("/robot/models/2026-robot-hierarchical.glb");

  return NextResponse.json({ images, heavy: [...heavy] });
}
