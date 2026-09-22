import type { Metadata } from "next";
import { Navbar } from "@/components/sections/navbar";
import { GalleryWall } from "@/components/gallery/gallery-wall";
import { getPhotoAlbum, getSiteSettings } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Gallery | Radicubs",
  description: "Photos from Team 7503's build seasons, competitions, and events."
};

export default async function GalleryPage() {
  const [settings, photos] = await Promise.all([getSiteSettings(), getPhotoAlbum()]);

  return (
    <main className="gallery-page">
      <div className="gallery-page-bg">
        <GalleryWall items={photos.map((photo) => ({ image: photo.src, previewImage: photo.thumbSrc, fullImage: photo.fullSrc, title: photo.alt }))} />
      </div>
      <Navbar settings={settings} />
    </main>
  );
}
