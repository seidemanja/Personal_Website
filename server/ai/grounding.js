import { readFile } from 'node:fs/promises';

const groundingDocumentPath = new URL(
  '../knowledge/joshua_seideman_website_assistant_knowledge_bundle_v3.md',
  import.meta.url,
);

let groundingDocumentPromise;

export function loadGroundingDocument() {
  if (!groundingDocumentPromise) {
    groundingDocumentPromise = readFile(groundingDocumentPath, 'utf8');
  }

  return groundingDocumentPromise;
}

