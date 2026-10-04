import type { CollectionConfig } from "payload";
import { adminsOnly } from "../access";
import { googleSignInEnabled, supabaseStrategy } from "../supabase-auth";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Editor", plural: "Editors" },
  // Password sign-in is always available; Google sign-in is opt-in.
  auth: { strategies: googleSignInEnabled ? [supabaseStrategy] : [] },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
    group: "Settings",
    description: googleSignInEnabled
      ? "People who can sign in and edit the website. To add someone, enter the email of their Google account and any password; they can then use \"Sign in with Google\" or that password."
      : "People who can sign in and edit the website. To add someone, enter their email and a password."
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: adminsOnly,
    delete: adminsOnly,
    // Editors can update their own profile; admins can update anyone.
    update: ({ req, id }) => req.user?.role === "admin" || req.user?.id === id
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Admin (can add and remove editors)", value: "admin" },
        { label: "Editor", value: "editor" }
      ],
      access: { update: ({ req }) => req.user?.role === "admin" },
      saveToJWT: true
    }
  ]
};
