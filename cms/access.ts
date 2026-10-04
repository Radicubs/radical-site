import type { Access, CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";
import { revalidateTag } from "next/cache";

// Anyone can read published content; only signed-in editors can change it.
export const anyone: Access = () => true;
export const signedIn: Access = ({ req }) => Boolean(req.user);
export const adminsOnly: Access = ({ req }) => req.user?.role === "admin";

// Every page reads through lib/cms.ts, which caches under this tag. Clearing it
// after a save makes the edit show up on the live site right away.
export const CMS_TAG = "cms";

function refreshSite() {
  try {
    revalidateTag(CMS_TAG);
  } catch {
    // Outside a Next.js request (seed and migration scripts) there is no cache to clear.
  }
}

export const refreshAfterChange: CollectionAfterChangeHook = ({ doc }) => {
  refreshSite();
  return doc;
};

export const refreshAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  refreshSite();
  return doc;
};

export const refreshGlobal: GlobalAfterChangeHook = ({ doc }) => {
  refreshSite();
  return doc;
};

export const contentAccess = { read: anyone, create: signedIn, update: signedIn, delete: signedIn };
export const contentHooks = { afterChange: [refreshAfterChange], afterDelete: [refreshAfterDelete] };
