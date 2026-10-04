import Link from "next/link";

// Shown on the login screen and in the editor's top bar.
export function Logo() {
  return <img src="/radicubs-wordmark-green.png" alt="Radicubs" style={{ height: 44, width: "auto" }} />;
}

export function Icon() {
  return <img src="/favicon.svg" alt="Radicubs" style={{ height: 24, width: 24 }} />;
}

const shortcuts = [
  { href: "/admin/collections/blog-posts/create", title: "Write a blog post", copy: "Build-season updates, recaps and news." },
  { href: "/admin/collections/team-members", title: "Update the team", copy: "Add this season's members and their photos." },
  { href: "/admin/collections/albums", title: "Add photos", copy: "Create an album for an event and drop photos in." },
  { href: "/admin/globals/home-page", title: "Edit the homepage", copy: "Photo wall, discipline cards and season video." },
  { href: "/admin/collections/sponsors", title: "Manage sponsors", copy: "Logos, links and their order." },
  { href: "/admin/globals/site-settings", title: "Links & settings", copy: "Application form, socials, email, supporters." }
];

// Quick links above the full list of sections on the editor's home screen.
export function Welcome() {
  return <div style={{ marginBottom: "calc(var(--base) * 2)" }}>
    <h2 style={{ margin: "0 0 4px" }}>Welcome back</h2>
    <p style={{ margin: "0 0 calc(var(--base) * 1)", color: "var(--theme-elevation-500)" }}>
      Changes go live on radicubs.com as soon as you save. Blog posts can be saved as drafts first.
    </p>
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "calc(var(--base) / 2)", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
      {shortcuts.map((item) => <li key={item.href}>
        <Link
          href={item.href}
          style={{ display: "block", height: "100%", padding: "calc(var(--base) * 0.75)", border: "1px solid var(--theme-elevation-150)", borderRadius: "var(--style-radius-m)", textDecoration: "none", color: "inherit", background: "var(--theme-elevation-50)" }}
        >
          <strong style={{ display: "block", marginBottom: 4 }}>{item.title} →</strong>
          <span style={{ color: "var(--theme-elevation-500)", fontSize: 13 }}>{item.copy}</span>
        </Link>
      </li>)}
    </ul>
  </div>;
}
