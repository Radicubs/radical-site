import type { CollectionConfig, FieldHook } from "payload";
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

export const TeamMembers: CollectionConfig = {
  slug: "team-members",
  labels: { singular: "Team member", plural: "Team members" },
  admin: {
    group: "People",
    useAsTitle: "name",
    defaultColumns: ["name", "role", "season", "photo"],
    description: "One entry per person per season. The Team page groups them by season."
  },
  defaultSort: "-season",
  access: contentAccess,
  hooks: contentHooks,
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "role", type: "text", required: true, admin: { description: "e.g. Senior Captain, Programming Lead, Sophomore" } },
        { name: "season", type: "number", required: true, admin: { description: "The year the season starts, e.g. 2025 for 2025–26." } }
      ]
    },
    photo("photo", "Photo", "A square-ish headshot works best.")
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
