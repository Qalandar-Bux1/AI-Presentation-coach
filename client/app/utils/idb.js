"use client";

// Simple IndexedDB helper for storing video blobs locally
const DB_NAME = "presentation-coach";
const STORE_NAME = "videos";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVideo({ blob, start_time, end_time, name }) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const id = `${Date.now()}`;
  const createdAt = new Date().toISOString();
  await store.put({
    id,
    name: name || `recording-${id}.webm`,
    blob,
    blobType: blob.type,
    size: blob.size,
    start_time,
    end_time,
    createdAt,
  });
  await tx.done?.catch?.(() => {});
  db.close();
  return id;
}

export async function listVideos() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const index = store.index("createdAt");
  const items = [];
  return new Promise((resolve, reject) => {
    const cursorReq = index.openCursor(null, "prev");
    cursorReq.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        items.push(cursor.value);
        cursor.continue();
      } else {
        db.close();
        resolve(items);
      }
    };
    cursorReq.onerror = () => {
      db.close();
      reject(cursorReq.error);
    };
  });
}

export async function getVideo(id) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const result = await new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

export async function deleteVideo(id) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  await new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  db.close();
}