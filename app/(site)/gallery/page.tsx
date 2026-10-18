import { textMetadata } from "@/lib/seo";
import { Navbar } from "@/components/sections/navbar";
import { GalleryArchive } from "@/components/gallery/gallery-archive";
import { Footer } from "@/components/sections/footer";
import { getPageText, getPhotoAlbums, getSiteSettings } from "@/lib/cms";
import { rich } from "@/components/ui/rich-text";

export async function generateMetadata() {
  return textMetadata("/gallery", (await getPageText()).gallery);
}

export default async function GalleryPage() {
  const [settings, albums, { gallery: t }] = await Promise.all([getSiteSettings(), getPhotoAlbums(), getPageText()]);

  return (
    <main className="gallery-archive-page">
      <Navbar settings={settings} />
      <div className="wrap gallery-archive-intro"><p className="eyebrow">{t.eyebrow}</p><h1>{rich(t.title)}</h1><p className="section-copy">{t.copy}</p></div>
      <div className="wrap"><GalleryArchive albums={albums} emptyText={t.empty} /></div>
      <Footer />
    </main>
  );
}
