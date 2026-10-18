import { getPayload } from "payload";
import config from "../payload.config";
const payload = await getPayload({ config });
for (const id of process.argv.slice(2).map(Number)) {
  const d = await payload.findByID({ collection: "media", id, depth: 0 });
  console.log(id, d.filename, d.mimeType, d.filesize, d.width, d.height, d._objectKey, d.url);
}
process.exit(0);
