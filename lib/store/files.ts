// =============================================================================
// IndexedDB store for larger blobs (uploaded research files). Kept out of the
// Zustand/localStorage store, which is for structured state only. All uploaded
// content is UNTRUSTED — never executed, only displayed as text/metadata.
// =============================================================================

"use client";

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "mastery-files";
const STORE = "files";

let dbPromise: Promise<IDBPDatabase> | null = null;
function db() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(d) {
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
      },
    });
  }
  return dbPromise;
}

export interface StoredFile {
  name: string;
  type: string;
  size: number;
  text?: string; // extracted text if available
  addedAt: number;
}

export async function putFile(key: string, file: StoredFile): Promise<void> {
  try {
    const d = await db();
    await d.put(STORE, file, key);
  } catch {
    // IndexedDB may be unavailable (private mode) — fail silently; the source
    // metadata still lives in the main store.
  }
}

export async function getFile(key: string): Promise<StoredFile | undefined> {
  try {
    const d = await db();
    return (await d.get(STORE, key)) as StoredFile | undefined;
  } catch {
    return undefined;
  }
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const d = await db();
    await d.delete(STORE, key);
  } catch {
    /* noop */
  }
}
