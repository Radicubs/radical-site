import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

// Payload 3.90.2 checks locks outside the mutation's transaction. On a small
// pool, concurrent saves/deletes can hold every connection and then wait for
// another one. Pass the original request so the lock read reuses its transaction.
// Apply after every npm install, including Vercel's npm ci.
const require = createRequire(import.meta.url);
const file = join(dirname(require.resolve('payload')), 'utilities/checkDocumentLockStatus.js');
const source = readFileSync(file, 'utf8');
const start = source.indexOf('const lockedDocumentResult = await payload.db.find({');
const end = source.indexOf('});', start);
if (start < 0 || end < 0) throw new Error('Payload lock-check implementation changed. Review the transaction fix before deploying.');
const block = source.slice(start, end);
if (!/\breq\s*[,}]/.test(block)) {
  const updated = block.replace('collection: lockedDocumentsCollectionSlug,', 'collection: lockedDocumentsCollectionSlug,\n            req,');
  if (updated === block) throw new Error('Could not apply Payload lock transaction fix.');
  writeFileSync(file, source.slice(0, start) + updated + source.slice(end));
  console.log('Applied Payload document-lock transaction fix.');
}
