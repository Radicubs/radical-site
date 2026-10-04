import type { Metadata } from "next";
import { Navbar } from "@/components/sections/navbar";
import { GalleryArchive } from "@/components/gallery/gallery-archive";
import { Footer } from "@/components/sections/footer";
import { getPhotoAlbums, getSiteSettings } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Gallery | Radicubs",
  description: "Photos from Team 7503's build seasons, competitions, and events."
};

export default async function GalleryPage() {
  const [settings, albums] = await Promise.all([getSiteSettings(), getPhotoAlbums()]);

  return (
    <main className="gallery-archive-page">
      <Navbar settings={settings} />
      <div className="wrap gallery-archive-intro"><p className="eyebrow">Team moments</p><h1>Gallery</h1><p className="section-copy">Build nights, competitions, outreach, and the moments in between.</p></div>
      <div className="wrap"><GalleryArchive albums={albums} /></div>
      <Footer />
    </main>
  );
}
