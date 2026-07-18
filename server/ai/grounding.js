import { readFile } from 'node:fs/promises';

const groundingDocumentPath = new URL(
  '../knowledge/joshua_seideman_website_assistant_knowledge_bundle_v4.md',
  import.meta.url,
);

export function loadGroundingDocument() {
  return readFile(groundingDocumentPath, 'utf8');
}
