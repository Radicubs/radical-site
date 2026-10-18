import { LinkArrow } from "@/components/ui/link-arrow";
import Link from "@/components/ui/intent-link";
import { NotFoundScene } from "@/components/NotFoundScene";
import { rich } from "@/components/ui/rich-text";
import { getPageText } from "@/lib/cms";

export default async function NotFound() {
  const { notFound: t } = await getPageText();
  return (
    <div className="notfound">
      <NotFoundScene />
      <div className="notfound-vignette" />
      <div className="notfound-content">
        <p className="notfound-kicker">{t.kicker}</p>
        <p className="notfound-code">404</p>
        <h1 className="notfound-title">{rich(t.title)}</h1>
        <p className="notfound-copy">{t.copy}</p>
        <p className="notfound-hint">{t.hint}</p>
        <div className="notfound-actions">
          <Link className="btn btn-dark" href="/">{t.homeButton} <LinkArrow direction="right" /></Link>
          <Link className="btn btn-light" href="/journey">{t.journeyButton}</Link>
        </div>
      </div>
    </div>
  );
}
