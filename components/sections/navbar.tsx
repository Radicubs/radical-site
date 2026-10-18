import { getPageText, getSiteSettings, type SiteSettings } from "@/lib/cms";
import { NavbarClient } from "./navbar-client";

// Loads the menu wording from the CMS; pages that already have the settings can pass them in.
export async function Navbar({ settings, handoff }: { settings?: SiteSettings; handoff?: boolean }) {
  const [site, text] = await Promise.all([settings ?? getSiteSettings(), getPageText()]);
  return <NavbarClient donateUrl={site.donateUrl} text={text.shared} handoff={handoff} />;
}
