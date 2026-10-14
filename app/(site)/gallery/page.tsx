import { pageMetadata, seoPages } from "@/lib/seo";
import { Navbar } from "@/components/sections/navbar";
import { GalleryArchive } from "@/components/gallery/gallery-archive";
import { Footer } from "@/components/sections/footer";
import { getPhotoAlbums, getSiteSettings } from "@/lib/cms";

export const metadata = pageMetadata("/gallery", seoPages["/gallery"]);

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
