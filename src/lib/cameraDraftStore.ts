// Lightweight IndexedDB-based store for persisting camera draft images
// across modal close/reload. Stores a single File per draft key.

const DB_NAME = "camera-drafts";
const STORE = "drafts";
const VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCameraDraft(key: string, file: File): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(file, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (e) {
    console.warn("Failed to save camera draft:", e);
  }
}

export async function loadCameraDraft(key: string): Promise<File | null> {
  try {
    const db = await openDB();
    const file = await new Promise<File | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as File) || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return file;
  } catch (e) {
    console.warn("Failed to load camera draft:", e);
    return null;
  }
}

export async function clearCameraDraft(key: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (e) {
    console.warn("Failed to clear camera draft:", e);
  }
}
