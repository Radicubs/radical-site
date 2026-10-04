import type { Field, GlobalConfig } from "payload";
import { anyone, refreshGlobal, signedIn } from "./access";

const access = { read: anyone, update: signedIn };
const hooks = { afterChange: [refreshGlobal] };

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
  hooks,
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
              upload("photo", "Photo")
            ]
          }]
        },
        {
          label: "Season video",
          fields: [
            upload("seasonVideo", "Season preview video", "Needs the scroll-optimised encode (frequent keyframes), or scrolling through it will stutter."),
            upload("seasonVideoMobile", "Smaller copy for phones"),
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
