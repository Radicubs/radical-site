import "server-only";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Album, Media } from "@/cms/payload-types";
import { blogPosts as fallbackBlogPosts, type BlogBlock, type BlogPost, type BlogSection } from "@/data/blog";
import { disciplines as fallbackDisciplines } from "@/data/disciplines";
import { journeySeasons as fallbackJourney, type JourneySeason } from "@/data/journey";
import { outreachEvents as fallbackOutreachEvents, outreachPartners as fallbackPartners, outreachPrograms as fallbackPrograms, outreachStats as fallbackStats, type OutreachEvent, type OutreachProgram } from "@/data/outreach";
import { site } from "@/data/site";
import { corporateSponsors as fallbackCorporateSponsors, individualSponsors as fallbackIndividualSponsors, type Sponsor } from "@/data/sponsors";
import { teamMembers as fallbackTeamMembers, type TeamMember } from "@/data/team";

export type SiteSettings = Omit<typeof site, "name" | "description" | "applyUrl" | "donateUrl" | "email" | "instagram" | "linkedin" | "tiktok" | "tba" | "nonprofit" | "teamNumber" | "location"> & {
  name: string;
  teamNumber: string;
  location: string;
  description: string;
  nonprofit: string;
  applyUrl: string;
  donateUrl: string;
  email: string;
  instagram: string;
  linkedin: string;
  tiktok: string;
  tba: string;
  applicationSeason: number;
};

export type CmsImage = { src: string; srcSet?: string };
export type Mentor = { name: string; role: string; image?: string };
export type GalleryPhoto = {
  id: string;
  src: string;
  fullSrc: string;
  thumbSrc: string;
  srcSet?: string;
  alt: string;
  width: number;
  height: number;
};
export type GalleryAlbum = { title: string; year: number | null; photos: GalleryPhoto[] };
export type DisciplineImages = Partial<Record<"mechanical" | "cad" | "electrical" | "programming" | "business" | "grants" | "media" | "outreach", string>>;
export type TeamRoster = { year: number; members: TeamMember[] };
export type DisciplineCard = { key: string; title: string; copy: string; tags: string[]; alt: string; image?: CmsImage };
export type OutreachStat = { value: number; suffix?: string; label: string; plain?: boolean };
export type OutreachReelEvent = OutreachEvent & { photo?: CmsImage };
export type OutreachContent = {
  heroVideo?: string;
  heroPoster?: string;
  intro?: CmsImage;
  stats: OutreachStat[];
  programs: OutreachProgram[];
  partners: string[];
  events: OutreachReelEvent[];
};
export type HomeVideos = { video?: string; mobileVideo?: string; poster?: string };

// ---------------------------------------------------------------------------
// Reading from Payload

const payloadClient = () => getPayload({ config });

// Deduplicate reads within a request. Never persist an offline/build fallback
// after an editor changes content, and never resurrect deleted CMS records.
function cmsRead<T>(key: string, load: () => Promise<T>, fallback: T): () => Promise<T> {
  return cache(async () => {
    if (!process.env.DATABASE_URL) return fallback;
    try {
      return await load();
    } catch (error) {
      console.error(`CMS read failed for ${key}:`, error instanceof Error ? error.message : error);
      throw error;
    }
  });
}

const loadHome = cache(async () => (await payloadClient()).findGlobal({ slug: "home-page", depth: 1 }));

const asMedia = (value: unknown): Media | undefined =>
  value && typeof value === "object" && "url" in value ? value as Media : undefined;

type Size = "thumbnail" | "small" | "medium" | "large";

function variant(media: Media, preferred: Size[]): { url: string; width?: number; height?: number } | undefined {
  for (const key of preferred) {
    const size = media.sizes?.[key];
    if (size?.url) return { url: size.url, width: size.width ?? undefined, height: size.height ?? undefined };
  }
  return media.url ? { url: media.url, width: media.width ?? undefined, height: media.height ?? undefined } : undefined;
}

// Every resized copy as an <img srcset>, so the browser downloads the smallest
// one that fills the slot. The original is left out when resized copies exist.
function srcSet(media: Media): string | undefined {
  const byWidth = new Map<number, string>();
  for (const size of Object.values(media.sizes ?? {})) {
    if (size?.url && size.width) byWidth.set(size.width, size.url);
  }
  if (byWidth.size < 2) return undefined;
  return [...byWidth.entries()].sort(([a], [b]) => a - b).map(([width, url]) => `${url} ${width}w`).join(", ");
}

function imageUrl(value: unknown, preferred: Size[] = ["large", "medium", "small"]): string | undefined {
  const media = asMedia(value);
  return media ? variant(media, preferred)?.url : undefined;
}

function cmsImage(value: unknown, preferred: Size[] = ["medium", "large", "small"]): CmsImage | undefined {
  const media = asMedia(value);
  const url = media && variant(media, preferred)?.url;
  return media && url ? { src: url, srcSet: srcSet(media) } : undefined;
}

const fileUrl = (value: unknown) => asMedia(value)?.url ?? undefined;

const formatDate = (value?: string | null) => value
  ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(value))
  : "";

// ---------------------------------------------------------------------------
// Site settings

export const getSiteSettings = cmsRead("site-settings", async (): Promise<SiteSettings> => {
  const payload = await payloadClient();
  const settings = await payload.findGlobal({ slug: "site-settings", depth: 0 });
  return {
    ...site,
    name: settings.name || site.name,
    teamNumber: settings.teamNumber || site.teamNumber,
    location: settings.location || site.location,
    description: settings.description || site.description,
    nonprofit: settings.nonprofit || site.nonprofit,
    applyUrl: settings.applyUrl || site.applyUrl,
    donateUrl: settings.donateUrl || process.env.DONATE_URL || site.donateUrl,
    email: settings.email || process.env.CONTACT_EMAIL || site.email,
    instagram: settings.instagram || site.instagram,
    linkedin: settings.linkedin || site.linkedin,
    tiktok: settings.tiktok || site.tiktok,
    tba: settings.tba || site.tba,
    applicationSeason: settings.applicationSeason || 2026
  };
}, { ...site, applicationSeason: 2026 });

// ---------------------------------------------------------------------------
// Blog

type LexicalNode = {
  type?: string;
  tag?: string;
  text?: string;
  listType?: string;
  children?: LexicalNode[];
  value?: unknown;
  fields?: { blockType?: string; code?: string; language?: string };
};

const nodeText = (node: LexicalNode): string =>
  node.type === "linebreak" ? "\n" : node.text ?? (node.children ?? []).map(nodeText).join("");

const emptySection = (heading: string): BlogSection => ({ heading, paragraphs: [], blocks: [] });

// The post template lays a post out as titled sections, so each Heading in the
// editor starts a new section. Anything before the first heading goes under "Update".
function lexicalToSections(content: unknown): BlogSection[] | undefined {
  const nodes = (content as { root?: LexicalNode } | null)?.root?.children;
  if (!nodes?.length) return undefined;

  const sections: BlogSection[] = [];
  let current = emptySection("Update");
  const flush = () => { if (current.blocks!.length) sections.push(current); };
  const push = (block: BlogBlock) => current.blocks!.push(block);

  for (const node of nodes) {
    if (node.type === "heading") {
      const text = nodeText(node).trim();
      if (!text) continue;
      flush();
      current = emptySection(text);
    } else if (node.type === "list") {
      const items = (node.children ?? []).map((item) => nodeText(item).trim()).filter(Boolean);
      if (items.length) push({ kind: "list", ordered: node.listType === "number", items });
    } else if (node.type === "upload") {
      const media = asMedia(node.value);
      const image = media && variant(media, ["large", "medium", "small"]);
      if (media && image) push({ kind: "image", src: image.url, srcSet: srcSet(media), alt: media.alt ?? "" });
    } else if (node.type === "block" && node.fields?.blockType === "Code") {
      const code = node.fields.code?.replace(/\s+$/, "");
      if (code) push({ kind: "code", code, lang: node.fields.language || undefined });
    } else {
      const text = nodeText(node).trim();
      if (text) push({ kind: "text", text });
    }
  }
  flush();
  return sections.length ? sections : undefined;
}

// Blog publishing must not reuse a build-time snapshot of posts or media.
// React cache deduplicates metadata/page reads within one request only.
export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  if (!process.env.DATABASE_URL) return fallbackBlogPosts;
  try {
    const payload = await payloadClient();
    const { docs } = await payload.find({ collection: "blog-posts", sort: "-date", limit: 1000, depth: 2, overrideAccess: false, draft: false });
    return docs.map((post) => {
      const cover = asMedia(post.cover);
      return {
        slug: post.slug || "",
        date: formatDate(post.date),
        title: post.title,
        excerpt: post.excerpt || "",
        cover: cover ? variant(cover, ["large", "medium", "small"])?.url : undefined,
        coverSrcSet: cover ? srcSet(cover) : undefined,
        sections: lexicalToSections(post.content),
        sourceUrl: post.youtubeVideo || undefined,
        external: Boolean(post.youtubeVideo)
      } satisfies BlogPost;
    });
  } catch (error) {
    console.error("CMS read failed for blog-posts:", error instanceof Error ? error.message : error);
    // A configured CMS is authoritative, even when empty or temporarily offline.
    // Restoring the bundled archive would bring back unpublished/deleted posts.
    return process.env.DATABASE_URL ? [] : fallbackBlogPosts;
  }
});

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  return (await getBlogPosts()).find((post) => post.slug === slug);
}

// ---------------------------------------------------------------------------
// People

const roleOrder = ["freshman", "sophomore", "junior", "senior", "lead", "captain"];
const roleWeight = (role: string) => roleOrder.reduce((weight, value, index) => role.toLowerCase().includes(value) ? weight + index + 1 : weight, 0);
const sortRoster = (members: TeamMember[]): TeamMember[] =>
  [...members].sort((a, b) => roleWeight(b.role) - roleWeight(a.role) || a.name.localeCompare(b.name));

// Season used for the offline fallback roster (2025–2026).
const FALLBACK_TEAM_YEAR = 2025;
const fallbackRosters: TeamRoster[] = [{ year: FALLBACK_TEAM_YEAR, members: sortRoster(fallbackTeamMembers) }];

export const getTeamRosters = cmsRead("team-rosters", async (): Promise<TeamRoster[]> => {
  const payload = await payloadClient();
  const [{ docs }, { docs: seasons }] = await Promise.all([
    payload.find({ collection: "team-members", sort: "name", limit: 5000, depth: 1, select: { name: true, memberships: true } }),
    payload.find({ collection: "team-seasons", sort: "-year", limit: 500, depth: 0, joins: { members: false } })
  ]);
  const byYear = new Map<number, TeamMember[]>(seasons.map((season) => [season.year, []]));
  for (const member of docs) {
    for (const assignment of member.memberships ?? []) {
      const season = typeof assignment.season === "object" ? assignment.season : seasons.find((season) => season.id === assignment.season);
      const role = typeof assignment.role === "object" ? assignment.role : undefined;
      if (!season || !role) continue;
      const roster = byYear.get(season.year) ?? [];
      roster.push({ name: member.name, role: role.name, image: imageUrl(assignment.photo, ["medium", "small", "thumbnail"]) ?? "" });
      byYear.set(season.year, roster);
    }
  }
  return [...byYear.entries()]
    .map(([year, members]) => ({ year, members: sortRoster(members) }))
    .sort((a, b) => b.year - a.year);
}, fallbackRosters);

export async function getTeamMembers(): Promise<TeamMember[]> {
  const [current] = await getTeamRosters();
  return current?.members ?? [];
}

export const getMentors = cmsRead("mentors", async (): Promise<Mentor[]> => {
  const payload = await payloadClient();
  const { docs } = await payload.find({ collection: "mentors", sort: "_order", limit: 1000, depth: 1 });
  return docs.map((mentor) => ({ name: mentor.name, role: mentor.role, image: imageUrl(mentor.photo, ["medium", "small", "thumbnail"]) }));
}, []);

const fallbackSponsors = {
  corporate: fallbackCorporateSponsors.filter((sponsor) => sponsor.logo),
  individual: fallbackIndividualSponsors
};

export const getSponsors = cmsRead("sponsors", async (): Promise<{ corporate: Sponsor[]; individual: string[] }> => {
  const payload = await payloadClient();
  const [{ docs }, settings] = await Promise.all([
    payload.find({ collection: "sponsors", sort: "_order", limit: 1000, depth: 1 }),
    payload.findGlobal({ slug: "site-settings", depth: 0 })
  ]);
  const logo = (value: unknown) => imageUrl(value, ["medium", "small", "thumbnail"]);
  const wide = (value: unknown) => imageUrl(value, ["large", "medium", "small"]);
  const corporate = docs.flatMap((sponsor): Sponsor[] => {
    const src = logo(sponsor.logo);
    return src ? [{
      name: sponsor.name,
      href: sponsor.website,
      logo: src,
      pageLogo: wide(sponsor.pageLogo),
      loopLogo: wide(sponsor.wideLogo),
      lightLogo: wide(sponsor.lightLogo),
      lightLoopLogo: wide(sponsor.lightWideLogo)
    }] : [];
  });
  return {
    corporate,
    individual: settings.individualSponsors?.map((entry) => entry.name) ?? []
  };
}, fallbackSponsors);

// ---------------------------------------------------------------------------
// Gallery

function galleryPhoto(media: Media, id: string, alt: string): GalleryPhoto | null {
  if (!media.mimeType?.startsWith("image/")) return null;
  const panel = variant(media, ["medium", "large", "small"]);
  const full = variant(media, ["large", "medium", "small"]);
  const thumb = variant(media, ["thumbnail", "small", "medium"]);
  if (!panel || !full || !thumb) return null;
  return {
    id,
    src: panel.url,
    fullSrc: full.url,
    thumbSrc: thumb.url,
    srcSet: srcSet(media),
    alt: media.alt || alt,
    width: panel.width || media.width || 1600,
    height: panel.height || media.height || 1067
  };
}

const loadAlbums = cache(async (): Promise<Album[]> => {
  const payload = await payloadClient();
  const { docs } = await payload.find({ collection: "albums", sort: "-year", limit: 1000, depth: 1 });
  return docs;
});

const albumPhotos = (album: Album): GalleryPhoto[] => (album.photos ?? []).flatMap((value, index) => {
  const media = asMedia(value);
  const photo = media && galleryPhoto(media, `${album.id}-${media.id}`, `${album.title} photo ${index + 1}`);
  return photo ? [photo] : [];
});

export const getPhotoAlbums = cmsRead("photo-albums", async (): Promise<GalleryAlbum[]> => {
  const albums = await loadAlbums();
  return albums
    .map((album) => ({ title: album.title, year: album.year ?? null, photos: albumPhotos(album) }))
    .filter((album) => album.photos.length > 0)
    .sort((a, b) => (b.year ?? -1) - (a.year ?? -1) || a.title.localeCompare(b.title));
}, []);

export async function getPhotoAlbum(): Promise<GalleryPhoto[]> {
  return (await getPhotoAlbums()).flatMap((album) => album.photos);
}

// The homepage wall alternates the chosen wall photos with a spread of photos
// from albums marked "Include on the homepage".
export const getHomeWallPhotos = cmsRead("home-wall", async (): Promise<GalleryPhoto[]> => {
  const [home, albums] = await Promise.all([loadHome(), loadAlbums()]);
  const wall = (home.wallPhotos ?? []).flatMap((value, index) => {
    const media = asMedia(value);
    const photo = media && galleryPhoto(media, `wall-${media.id}`, `Radicubs gallery photo ${index + 1}`);
    return photo ? [photo] : [];
  });

  const sampledAlbums = albums.filter((album) => album.showOnHomepage !== false).map(albumPhotos).filter((photos) => photos.length).map((photos) => {
    const count = Math.min(12, photos.length);
    return Array.from({ length: count }, (_, index) => photos[Math.floor(((index + 0.5) * photos.length) / count)]);
  });
  const eventPhotos: GalleryPhoto[] = [];
  for (let index = 0; index < 12; index++) {
    for (const album of sampledAlbums) if (album[index]) eventPhotos.push(album[index]);
  }

  const result: GalleryPhoto[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < Math.max(wall.length, eventPhotos.length); index++) {
    for (const photo of [wall[index], eventPhotos[index]]) {
      const key = photo?.src;
      if (photo && key && !seen.has(key)) {
        result.push(photo);
        seen.add(key);
      }
      if (result.length === 20) return result;
    }
  }
  return result;
}, [{ id: "fallback", src: site.robotImage, fullSrc: site.robotImage, thumbSrc: site.robotImage, alt: "Radicubs robot from the 2026 season", width: 1600, height: 1200 }]);

// ---------------------------------------------------------------------------
// Homepage sections

const fallbackDisciplineCards: DisciplineCard[] = fallbackDisciplines.map(({ key, title, copy, tags, alt }) => ({ key, title, copy, tags, alt }));

export const getDisciplines = cmsRead("disciplines", async (): Promise<DisciplineCard[]> => {
  const home = await loadHome();
  const cards = (home.disciplines ?? []).map((card) => ({
    key: card.id || card.title,
    title: card.title,
    copy: card.copy,
    tags: (card.tags ?? []).map((entry) => entry.tag),
    alt: asMedia(card.photo)?.alt || card.title,
    image: cmsImage(card.photo)
  }));
  return cards;
}, fallbackDisciplineCards);

export const getHomeVideos = cmsRead("home-videos", async (): Promise<HomeVideos> => {
  const home = await loadHome();
  return { video: fileUrl(home.seasonVideo), mobileVideo: fileUrl(home.seasonVideoMobile), poster: imageUrl(home.seasonPoster) };
}, {});

// ---------------------------------------------------------------------------
// Journey

export type JourneyEntry = JourneySeason;

export const getJourneySeasons = cmsRead("journey", async (): Promise<JourneySeason[]> => {
  const payload = await payloadClient();
  const { docs } = await payload.find({ collection: "journey-seasons", sort: "year", limit: 100, depth: 1 });
  return docs.map((season) => ({
    year: season.year,
    game: season.game,
    summary: season.summary,
    record: season.record,
    districtRank: season.districtRank || undefined,
    awards: (season.awards ?? []).map((entry) => entry.award),
    image: imageUrl(season.photo),
    imageNote: season.photoNote || undefined,
    tbaUrl: season.tbaUrl
  }));
}, fallbackJourney);

// ---------------------------------------------------------------------------
// Outreach

const fallbackOutreach: OutreachContent = {
  stats: fallbackStats,
  programs: fallbackPrograms,
  partners: fallbackPartners,
  events: fallbackOutreachEvents
};

export const getOutreach = cmsRead("outreach", async (): Promise<OutreachContent> => {
  const payload = await payloadClient();
  const [page, { docs }] = await Promise.all([
    payload.findGlobal({ slug: "outreach-page", depth: 1 }),
    payload.find({ collection: "outreach-events", sort: "_order", limit: 500, depth: 1 })
  ]);
  const stats = (page.stats ?? []).map(({ value, suffix, label, plain }) => ({ value, label, suffix: suffix || undefined, plain: plain || undefined }));
  const programs = (page.programs ?? []).map(({ id, title, copy, where }) => ({ key: id || title, title, copy, where }));
  const partners = (page.partners ?? []).map((entry) => entry.name);
  return {
    heroVideo: fileUrl(page.heroVideo),
    heroPoster: imageUrl(page.heroPoster),
    intro: cmsImage(page.introPhoto),
    stats,
    programs,
    partners,
    events: docs.map((event) => ({
          year: event.year,
          title: event.title,
          place: event.place,
          source: event.link || undefined,
          fit: event.showWholeImage ? "contain" as const : undefined,
          photo: cmsImage(event.photo)
        }))
  };
}, fallbackOutreach);
