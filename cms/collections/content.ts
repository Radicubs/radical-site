import { APIError, ValidationError, type CollectionBeforeDeleteHook, type CollectionBeforeValidateHook, type CollectionConfig, type FieldHook } from "payload";
import { BlocksFeature, CodeBlock, FixedToolbarFeature, lexicalEditor } from "@payloadcms/richtext-lexical";
import { contentAccess, contentHooks } from "../access";

export const slugify = (value: string) => value
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

// Fill the URL slug from the title unless an editor typed one.
const slugFromTitle: FieldHook = ({ value, data }) =>
  typeof value === "string" && value.trim() ? slugify(value) : data?.title ? slugify(data.title) : value;

const photo = (name: string, label: string, description?: string, required = false) => ({
  name,
  label,
  type: "upload" as const,
  relationTo: "media" as const,
  required,
  admin: description ? { description } : undefined
});

export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  labels: { singular: "Blog post", plural: "Blog posts" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    description: "Save Draft keeps a post in the editor. Publish makes it visible on the blog.",
    defaultColumns: ["title", "date", "_status", "updatedAt"],
    listSearchableFields: ["title", "excerpt"]
  },
  defaultSort: "-date",
  // Visitors only ever see published posts; drafts stay visible to editors.
  access: { ...contentAccess, read: ({ req }) => (req.user ? true : { _status: { equals: "published" } }) },
  hooks: contentHooks,
  versions: { drafts: true, maxPerDoc: 20 },
  fields: [
    { name: "title", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "date", type: "date", required: true, admin: { date: { pickerAppearance: "dayOnly", displayFormat: "MMMM d, yyyy" } } },
        photo("cover", "Cover photo", "Shown on the blog list and at the top of the post.")
      ]
    },
    { name: "excerpt", label: "Short summary", type: "textarea", admin: { description: "One or two sentences shown under the title on the blog list." } },
    {
      name: "content",
      type: "richText",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          BlocksFeature({ blocks: [CodeBlock({ defaultLanguage: "java" })] })
        ]
      }),
      admin: { description: "Use \"Heading 2\" to start each section (Mechanical, Programming, …)." }
    },
    {
      name: "youtubeVideo",
      label: "Video link instead of a post",
      type: "text",
      admin: { description: "Paste a YouTube link to make the card open that video instead of a post page." }
    },
    {
      name: "slug",
      label: "Page address",
      type: "text",
      unique: true,
      index: true,
      hooks: { beforeValidate: [slugFromTitle] },
      admin: { position: "sidebar", description: "Filled in from the title. The post lives at /blog/<this>." }
    }
  ]
};

// Required assignments must be removed before their dropdown option is deleted.
// Give editors an actionable message rather than a database constraint error.
const protectAssignedOption = (field: "role" | "season"): CollectionBeforeDeleteHook => async ({ id, req }) => {
  const { totalDocs } = await req.payload.count({ collection: "team-members", where: { [`memberships.${field}`]: { equals: id } }, req });
  if (totalDocs) throw new APIError(`This ${field} is assigned to ${totalDocs} team member${totalDocs === 1 ? "" : "s"}. Remove or change those season assignments before deleting it.`, 409);
};

export const TeamRoles: CollectionConfig = {
  slug: "team-roles",
  labels: { singular: "Team role", plural: "Team roles" },
  admin: { group: "People", useAsTitle: "name", defaultColumns: ["name"], description: "Reusable roles for season assignments. You can also create a role from a person's role dropdown." },
  defaultSort: "name",
  access: contentAccess,
  hooks: { ...contentHooks, beforeDelete: [protectAssignedOption("role")] },
  fields: [{ name: "name", type: "text", required: true, unique: true }]
};

export const TeamSeasons: CollectionConfig = {
  slug: "team-seasons",
  labels: { singular: "Team season", plural: "Team seasons" },
  admin: { group: "People", useAsTitle: "title", defaultColumns: ["title", "year"], description: "Create a season, then assign people to it in Team members. Related profiles appear below." },
  defaultSort: "-year",
  access: contentAccess,
  hooks: { ...contentHooks, beforeDelete: [protectAssignedOption("season")] },
  fields: [
    { name: "year", type: "number", required: true, unique: true, min: 2000, max: 2200, validate: (value: number | null | undefined) => (typeof value === "number" && Number.isInteger(value) && value >= 2000 && value <= 2200) || "Enter a whole starting year between 2000 and 2200.", admin: { description: "Starting year: 2025 means the 2025–2026 robotics season." } },
    { name: "title", type: "text", admin: { readOnly: true }, hooks: { beforeValidate: [({ data, originalDoc }) => { const year = data?.year ?? originalDoc?.year; return year != null ? `${year}–${Number(year) + 1}` : undefined; }] } },
    { name: "members", label: "People in this season", type: "join", collection: "team-members", on: "memberships.season", defaultSort: "name", admin: { allowCreate: false, defaultColumns: ["name", "photo"] } }
  ]
};

const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ");

const prepareTeamProfile: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  if (!data) return data;
  const name = normalizeName(data.name ?? originalDoc?.name ?? "");
  if (!name) throw new ValidationError({ collection: "team-members", errors: [{ path: "name", message: "Enter the person's name." }] });
  const identityKey = name.toLowerCase();
  const { docs } = await req.payload.find({
    collection: "team-members", depth: 0, limit: 1, req,
    where: { and: [
      { identityKey: { equals: identityKey } },
      ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : [])
    ] }
  });
  if (docs.length) throw new ValidationError({ collection: "team-members", errors: [{ path: "name", message: `${name} already has a profile. Open that person and add another season assignment.` }] });
  data.name = name;
  data.identityKey = identityKey;
  // Copy the default photo into new seasons. Changing a profile's default later
  // must not replace the photos already saved for previous seasons.
  if (Array.isArray(data.memberships)) {
    const existing = new Map((originalDoc?.memberships ?? []).map((row: { id: string; photo?: unknown }) => [row.id, row]));
    data.memberships = data.memberships.map((row: { id?: string; photo?: unknown }) => {
      if (row.photo !== undefined) return row;
      const old = row.id ? existing.get(row.id) as { photo?: unknown } | undefined : undefined;
      return { ...row, photo: old ? old.photo ?? null : data.photo !== undefined ? data.photo : originalDoc?.photo ?? null };
    });
  }
  return data;
};

export const TeamMembers: CollectionConfig = {
  slug: "team-members",
  labels: { singular: "Team member", plural: "Team members" },
  admin: {
    group: "People",
    useAsTitle: "name",
    defaultColumns: ["name", "photo", "memberships"],
    description: "Create each person once. Edit their profile to add a new season, keeping the old assignments. Each season has its own role and photo. Unassigned people do not appear on the website."
  },
  defaultSort: "name",
  access: contentAccess,
  hooks: { ...contentHooks, beforeValidate: [prepareTeamProfile] },
  fields: [
    { name: "name", type: "text", required: true },
    photo("photo", "Default profile photo", "Prefills new season assignments. Existing seasons keep their saved photos."),
    {
      name: "memberships", label: "Season assignments", type: "array",
      labels: { singular: "Season assignment", plural: "Season assignments" },
      admin: { description: "Returning member? Add a new row here and keep the old one. Edit a row to change only that season’s role or photo. The + buttons create seasons or roles." },
      validate: (value: unknown[] | null | undefined) => {
        const seasons = ((value ?? []) as { season?: number | { id: number } }[]).map((row) => typeof row.season === "object" ? row.season?.id : row.season).filter((id) => id != null);
        return new Set(seasons).size === seasons.length || "Assign each person to a season only once.";
      },
      fields: [{ type: "row", fields: [
        { name: "season", type: "relationship", relationTo: "team-seasons", required: true, admin: { allowCreate: true } },
        { name: "role", type: "relationship", relationTo: "team-roles", required: true, admin: { allowCreate: true } }
      ] }, photo("photo", "Photo for this season", "Changing this photo only affects this season. Leave empty to show initials.")]
    },
    { name: "identityKey", type: "text", unique: true, index: true, admin: { hidden: true } },
    { name: "mergedProfiles", type: "json", admin: { hidden: true }, access: { read: ({ req }) => Boolean(req.user), update: () => false } },
    // Retained for migration/older seed scripts; public rosters use assignments.
    { name: "role", type: "text", admin: { hidden: true } },
    { name: "season", type: "number", admin: { hidden: true } }
  ]
};

export const Mentors: CollectionConfig = {
  slug: "mentors",
  labels: { singular: "Mentor", plural: "Mentors" },
  orderable: true,
  admin: { group: "People", useAsTitle: "name", defaultColumns: ["name", "role", "photo"], description: "Drag rows to change the order on the Mentors page." },
  access: contentAccess,
  hooks: contentHooks,
  fields: [
    { type: "row", fields: [{ name: "name", type: "text", required: true }, { name: "role", type: "text", required: true }] },
    photo("photo", "Photo")
  ]
};

export const Sponsors: CollectionConfig = {
  slug: "sponsors",
  labels: { singular: "Sponsor", plural: "Sponsors" },
  orderable: true,
  admin: {
    group: "People",
    useAsTitle: "name",
    defaultColumns: ["name", "logo", "website"],
    description: "Company and foundation sponsors. Drag rows to change their order. Individual and family supporters are under Settings → Site settings."
  },
  access: contentAccess,
  hooks: contentHooks,
  fields: [
    { type: "row", fields: [{ name: "name", type: "text", required: true }, { name: "website", type: "text", required: true }] },
    photo("logo", "Logo", "White or light artwork on a transparent background (the site is dark).", true),
    {
      type: "collapsible",
      label: "Other logo versions (optional)",
      admin: { initCollapsed: true },
      fields: [
        photo("pageLogo", "Logo on the Sponsors page", "Only if the Sponsors page should show different artwork."),
        photo("wideLogo", "Wide logo for the scrolling strip", "Only if the homepage strip needs a wider version."),
        photo("lightLogo", "Dark-ink logo for the light theme"),
        photo("lightWideLogo", "Dark-ink wide logo for the light theme")
      ]
    }
  ]
};

export const Albums: CollectionConfig = {
  slug: "albums",
  labels: { singular: "Photo album", plural: "Photo albums" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "year", "updatedAt"],
    description: "Albums appear on the Gallery page, newest year first. A few photos from each also show up on the homepage."
  },
  defaultSort: "-year",
  access: contentAccess,
  hooks: contentHooks,
  fields: [
    { type: "row", fields: [{ name: "title", type: "text", required: true }, { name: "year", type: "number", admin: { description: "Season year, used to group albums." } }] },
    {
      name: "photos",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      admin: { description: "Select or drop in several photos at once. Drag to reorder." }
    },
    {
      name: "showOnHomepage",
      label: "Include photos from this album on the homepage",
      type: "checkbox",
      defaultValue: true
    }
  ]
};

export const JourneySeasons: CollectionConfig = {
  slug: "journey-seasons",
  labels: { singular: "Season", plural: "Seasons (Journey page)" },
  admin: { group: "Content", useAsTitle: "game", defaultColumns: ["year", "game", "record"] },
  defaultSort: "year",
  access: contentAccess,
  hooks: contentHooks,
  fields: [
    {
      type: "row",
      fields: [
        { name: "year", type: "number", required: true, unique: true },
        { name: "game", label: "Game name", type: "text", required: true }
      ]
    },
    { name: "summary", type: "textarea", required: true },
    {
      type: "row",
      fields: [
        { name: "record", type: "text", required: true, admin: { description: "e.g. \"21–22 official\"" } },
        { name: "districtRank", label: "District rank", type: "text", admin: { description: "e.g. \"FIT #61\"" } }
      ]
    },
    { name: "awards", type: "array", labels: { singular: "Award", plural: "Awards" }, fields: [{ name: "award", type: "text", required: true }] },
    photo("photo", "Robot photo"),
    { name: "photoNote", label: "Note when there's no photo", type: "text", admin: { condition: (_, sibling) => !sibling?.photo } },
    { name: "tbaUrl", label: "The Blue Alliance link", type: "text", required: true }
  ]
};

export const OutreachEvents: CollectionConfig = {
  slug: "outreach-events",
  labels: { singular: "Outreach event", plural: "Outreach events" },
  orderable: true,
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "year", "place", "photo"],
    description: "The \"Where we've been\" strip on the Outreach page. Drag rows to change the order."
  },
  access: contentAccess,
  hooks: contentHooks,
  fields: [
    { type: "row", fields: [{ name: "title", type: "text", required: true }, { name: "year", type: "number", required: true }] },
    { name: "place", type: "text", required: true },
    { name: "link", type: "text", admin: { description: "Optional. A blog post like /blog/off-season-updates, or any web address." } },
    photo("photo", "Photo"),
    { name: "showWholeImage", label: "Show the whole image (for flyers) instead of cropping it", type: "checkbox" }
  ]
};
