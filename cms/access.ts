import type { Access, CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";
import { revalidatePath, revalidateTag } from "next/cache";

// Anyone can read published content; only signed-in editors can change it.
export const anyone: Access = () => true;
export const signedIn: Access = ({ req }) => Boolean(req.user);
export const adminsOnly: Access = ({ req }) => req.user?.role === "admin";

export const CMS_TAG = "cms";

// Public pages are cached. Any CMS save clears every cached page (and older tagged
// snapshots), so the next visit renders fresh content.
function refreshSite() {
  try {
    revalidateTag(CMS_TAG);
    revalidatePath("/", "layout");
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
