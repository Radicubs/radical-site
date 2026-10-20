import type { Field, GlobalAfterReadHook, GlobalBeforeValidateHook, GlobalConfig } from "payload";
import { fillDefaults, pageTextSchema } from "../lib/page-text";
import { anyone, refreshGlobal, signedIn } from "./access";

const access = { read: anyone, update: signedIn };
const hooks = { afterChange: [refreshGlobal] };

// Names pasted into "Add several at once" join the supporter list, skipping any already
// on it, and the box clears on save.
const addPastedSupporters: GlobalBeforeValidateHook = ({ data }) => {
  const pasted = typeof data?.pastedSupporters === "string" ? data.pastedSupporters : "";
  if (!data || !pasted.trim()) return data;
  const rows: { name?: string }[] = Array.isArray(data.individualSponsors) ? data.individualSponsors : [];
  const known = new Set(rows.map((row) => row.name?.trim().toLowerCase()));
  for (const line of pasted.split(/\r?\n/)) {
    const name = line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim().replace(/\s+/g, " ");
    if (name && !known.has(name.toLowerCase())) {
      rows.push({ name });
      known.add(name.toLowerCase());
    }
  }
  return { ...data, individualSponsors: rows, pastedSupporters: "" };
};

const upload = (name: string, label: string, description?: string): Field => ({
  name,
  label,
  type: "upload",
  relationTo: "media",
  admin: description ? { description } : undefined
});

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site settings",
  admin: { group: "Settings", description: "Team details, links and supporters used across the whole site." },
  access,
  hooks: { ...hooks, beforeValidate: [addPastedSupporters] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Team",
          fields: [
            { type: "row", fields: [{ name: "name", type: "text", required: true }, { name: "teamNumber", label: "Team number", type: "text" }, { name: "location", type: "text" }] },
            { name: "description", type: "textarea", required: true, admin: { description: "Used for search results and link previews." } },
            { name: "nonprofit", label: "Nonprofit line (footer)", type: "text" }
          ]
        },
        {
          label: "Applications",
          fields: [
            { name: "applyUrl", label: "Application form link", type: "text", required: true },
            { name: "applicationSeason", label: "Season applications are for", type: "number", admin: { description: "e.g. 2026" } }
          ]
        },
        {
          label: "Links",
          fields: [
            { type: "row", fields: [{ name: "email", type: "email" }, { name: "donateUrl", label: "Donate link", type: "text" }] },
            { type: "row", fields: [{ name: "instagram", type: "text" }, { name: "linkedin", label: "LinkedIn", type: "text" }] },
            { type: "row", fields: [{ name: "tiktok", label: "TikTok", type: "text" }, { name: "tba", label: "The Blue Alliance", type: "text" }] }
          ]
        },
        {
          label: "Supporters",
          fields: [
            {
              name: "individualSponsors",
              label: "Individual and family supporters",
              type: "array",
              admin: { description: "Names listed on the Sponsors page. Company sponsors are under People → Sponsors." },
              fields: [{ name: "name", type: "text", required: true }]
            },
            {
              name: "pastedSupporters",
              label: "Add several at once",
              type: "textarea",
              virtual: true,
              // Payload defaults virtual fields to read-only unless explicitly overridden.
              admin: { readOnly: false, rows: 8, description: "Paste names, one per line, then save. They're added to the end of the list above; names already on it are skipped." }
            }
          ]
        }
      ]
    }
  ]
};

export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "Homepage",
  admin: { group: "Pages" },
  access,
  hooks,
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Photo wall",
          fields: [{
            name: "wallPhotos",
            label: "Photo wall",
            type: "upload",
            relationTo: "media",
            hasMany: true,
            admin: { description: "The photos in the hero wall, in order. Photos from albums marked \"Include on the homepage\" are mixed in between." }
          }]
        },
        {
          label: "Impact numbers",
          fields: [{
            name: "impact",
            label: "Impact numbers",
            type: "array",
            labels: { singular: "Number", plural: "Numbers" },
            maxRows: 8,
            admin: { description: "The numbers under \"Our impact\" on the homepage. Drag to reorder.", components: { RowLabel: "/cms/row-label#LabelRowLabel" } },
            fields: [
              {
                type: "row",
                fields: [
                  { name: "prefix", type: "text", admin: { width: "15%", description: "e.g. $" } },
                  { name: "value", type: "number", required: true, admin: { width: "25%" } },
                  { name: "suffix", type: "text", admin: { width: "15%", description: "e.g. + or M+" } },
                  { name: "label", type: "text", required: true, admin: { width: "45%", description: "e.g. Unique members" } }
                ]
              },
              { name: "detail", type: "text", admin: { description: "Optional short line under the label." } }
            ]
          }]
        },
        {
          label: "Discipline cards",
          fields: [{
            name: "disciplines",
            label: "Cards",
            type: "array",
            labels: { singular: "Card", plural: "Cards" },
            admin: { description: "The flip cards under \"Find where you fit in\". Drag to reorder.", initCollapsed: true, components: { RowLabel: "/cms/row-label#TitleRowLabel" } },
            fields: [
              { name: "title", type: "text", required: true },
              { name: "copy", label: "Back of the card", type: "textarea", required: true },
              { name: "tags", type: "array", maxRows: 3, fields: [{ name: "tag", type: "text", required: true }] },
              upload("photo", "Photo or 3D model", "Choose an image, or upload a .glb file for an interactive 3D viewer. Replace the CAD model here just like a card photo.")
            ]
          }]
        },
        {
          label: "Season video",
          fields: [
            upload("seasonVideo", "Season preview video", "Run it through scripts/encode-scroll-video.sh first (every frame a keyframe), or scrolling through it will stutter."),
            upload("seasonVideoMobile", "Smaller copy for phones", "Encode with scripts/encode-scroll-video.sh --mobile."),
            upload("seasonPoster", "Still image shown before the video loads")
          ]
        }
      ]
    }
  ]
};

export const OutreachPage: GlobalConfig = {
  slug: "outreach-page",
  label: "Outreach page",
  admin: { group: "Pages", description: "Individual events are under Content → Outreach events." },
  access,
  hooks,
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Top of page",
          fields: [
            upload("heroVideo", "Background video", "Loops behind the page title."),
            upload("heroPoster", "Still image shown before the video loads"),
            upload("introPhoto", "Photo beside \"Taking the robot out\"")
          ]
        },
        {
          label: "Numbers",
          fields: [{
            name: "stats",
            type: "array",
            maxRows: 4,
            admin: { components: { RowLabel: "/cms/row-label#LabelRowLabel" } },
            fields: [{
              type: "row",
              fields: [
                { name: "value", type: "number", required: true },
                { name: "suffix", type: "text", admin: { description: "e.g. +" } },
                { name: "label", type: "text", required: true },
                { name: "plain", label: "Show as a plain number (no commas), like a year", type: "checkbox" }
              ]
            }]
          }]
        },
        {
          label: "Programs",
          fields: [{
            name: "programs",
            type: "array",
            admin: { description: "The \"What we run\" cards.", components: { RowLabel: "/cms/row-label#TitleRowLabel" } },
            fields: [
              { name: "title", type: "text", required: true },
              { name: "copy", type: "textarea", required: true },
              { name: "where", type: "text", required: true }
            ]
          }]
        },
        {
          label: "Partners",
          fields: [{ name: "partners", type: "array", admin: { description: "Names in the scrolling partner strip." }, fields: [{ name: "name", type: "text", required: true }] }]
        }
      ]
    }
  ]
};

// Shows the default wording in fields that have never been filled, so editors change the
// text in place instead of retyping it.
const fillPageText: GlobalAfterReadHook = ({ doc }) => ({ ...doc, ...fillDefaults(doc) });

export const PageText: GlobalConfig = {
  slug: "page-text",
  label: "Page text",
  admin: {
    group: "Pages",
    description: "The fixed wording on each page. Wrap words in *asterisks* to make them green in a heading. Keep anything in {curly braces}: the site fills it in, e.g. {season} becomes 2026–2027. Clearing a field puts the original wording back."
  },
  access,
  hooks: { ...hooks, afterRead: [fillPageText] },
  fields: [{
    type: "tabs",
    tabs: Object.entries(pageTextSchema).map(([page, { label, fields }]) => ({
      name: page,
      label,
      fields: Object.entries(fields).map(([name, entry]): Field => {
        const names = entry.text.match(/\{\w+\}/g);
        const notes = [names && `Uses ${names.join(", ")}.`, "optional" in entry && entry.optional && "Type - to hide it."].filter(Boolean);
        const field = { name, label: entry.label, admin: notes.length ? { description: notes.join(" ") } : undefined };
        return "long" in entry && entry.long ? { ...field, type: "textarea" } : { ...field, type: "text" };
      })
    }))
  }]
};
