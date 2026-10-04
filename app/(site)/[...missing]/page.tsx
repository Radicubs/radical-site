import { notFound } from "next/navigation";

// The site and the editor each have their own root layout, so unknown URLs are
// routed here to render the site's 404 page inside the site layout.
export default function Missing() {
  notFound();
}
