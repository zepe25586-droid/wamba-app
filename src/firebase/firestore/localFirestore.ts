/* Local Firestore Adapter
   - Provides a minimal workable subset of Firestore APIs used in the app
   - Stores data in browser localStorage under key `local.firestore.db`
   - Supports real-time subscriptions via local pub/sub plus `storage` events
*/

type DocumentData = { [k: string]: any };

// Simple document reference representation
export type LocalDocumentReference = {
  __local: true;
  type: 'document';
  path: string; // full path 'collection/docId'
  id: string;
};

export type LocalCollectionReference = {
  __local: true;
  type: 'collection';
  path: string; // collection path
};

// Type aliases to match Firestore naming expected by app code
export type DocumentReference = LocalDocumentReference;
export type CollectionReference = LocalCollectionReference;

export type DocumentSnapshot = {
  exists: () => boolean;
  data: () => any;
  id: string;
};

export type QuerySnapshot = {
  docs: { id: string; data: () => any }[];
};

export type FirestoreError = Error;
export type Query<T = any> = any;

// The 'Firestore' type used across the project (we're using a module-level object stub)
export type Firestore = any;

export type Unsubscribe = () => void;

const STORAGE_KEY = 'local.firestore.db';

function loadDB(): Record<string, Record<string, DocumentData>> {
  try {
    if (typeof window === 'undefined' || !('localStorage' in window)) return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse local firestore DB', e);
    return {};
  }
}

function saveDB(db: Record<string, Record<string, DocumentData>>) {
  try {
    if (typeof window === 'undefined' || !('localStorage' in window)) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    // fire the storage event to notify other tabs (only if window exists)
    if (typeof window !== 'undefined' && typeof (window as any).dispatchEvent === 'function') {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(db) } as any));
    }
  } catch (e) {
    console.warn('Failed to persist local firestore DB', e);
  }
}

function ensureCollection(db: Record<string, Record<string, DocumentData>>, path: string) {
  if (!db[path]) db[path] = {};
  return db;
}

// Minimal pubsub to notify listeners on change
const collectionListeners: Map<string, Set<(snapshot: any) => void>> = new Map();
const docListeners: Map<string, Set<(snapshot: any) => void>> = new Map();

function notifyCollection(path: string) {
  const db = loadDB();
  const collection = db[path] || {};
  const docs = Object.entries(collection).map(([id, data]) => ({ id, data }));
  const snapshot = {
    docs: docs.map(d => ({ id: d.id, data: () => d.data }))
  };

  const colSet = collectionListeners.get(path);
  if (colSet) {
    colSet.forEach(cb => cb(snapshot));
  }
}

function notifyDoc(fullPath: string) {
  const db = loadDB();
  const [collectionPath, id] = splitPath(fullPath);
  const coll = db[collectionPath] || {};
  const data = coll[id] ?? null;
  const snapshot = {
    exists: () => data !== null,
    data: () => data ?? undefined,
    id,
  };
  const set = docListeners.get(fullPath);
  if (set) set.forEach(cb => cb(snapshot));
}

function splitPath(fullPath: string): [string, string] {
  const parts = fullPath.split('/');
  const id = parts.pop() as string;
  const collectionPath = parts.join('/');
  return [collectionPath, id];
}

export function collection(_firestore: any, path: string): LocalCollectionReference {
  return { __local: true, type: 'collection', path };
}

export function doc(_firestore: any, collectionPath: string, id?: string): LocalDocumentReference {
  if (!id) {
    // create an id-like string if missing
    id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  const fullPath = `${collectionPath}/${id}`;
  return { __local: true, type: 'document', path: fullPath, id };
}

export async function addDoc(colRef: LocalCollectionReference, data: DocumentData) {
  const db = ensureCollection(loadDB(), colRef.path);
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  db[colRef.path][id] = { ...data };
  saveDB(db);
  notifyCollection(colRef.path);
  notifyDoc(`${colRef.path}/${id}`);
  return doc(null, colRef.path, id);
}

export async function setDoc(docRef: LocalDocumentReference, data: DocumentData, options?: { merge?: boolean }) {
  const db = ensureCollection(loadDB(), docRef.path.split('/').slice(0, -1).join('/'));
  const [collectionPath, id] = splitPath(docRef.path);
  const coll = db[collectionPath];
  if (options?.merge && coll[id]) {
    coll[id] = { ...coll[id], ...data };
  } else {
    coll[id] = { ...data };
  }
  saveDB(db);
  notifyCollection(collectionPath);
  notifyDoc(docRef.path);
}

export async function updateDoc(docRef: LocalDocumentReference, data: DocumentData) {
  const db = ensureCollection(loadDB(), docRef.path.split('/').slice(0, -1).join('/'));
  const [collectionPath, id] = splitPath(docRef.path);
  const coll = db[collectionPath];
  if (!coll[id]) throw new Error(`Document ${docRef.path} does not exist`);
  coll[id] = { ...coll[id], ...data };
  saveDB(db);
  notifyCollection(collectionPath);
  notifyDoc(docRef.path);
}

export async function deleteDoc(docRef: LocalDocumentReference) {
  const [collectionPath, id] = splitPath(docRef.path);
  const db = loadDB();
  if (db[collectionPath]) {
    delete db[collectionPath][id];
    saveDB(db);
  }
  notifyCollection(collectionPath);
  notifyDoc(docRef.path);
}

export async function getDoc(docRef: LocalDocumentReference) {
  const [collectionPath, id] = splitPath(docRef.path);
  const db = loadDB();
  const coll = db[collectionPath] || {};
  const data = coll[id] ?? null;
  return {
    exists: () => data !== null,
    data: () => data ?? undefined,
    id,
  };
}

export async function getDocs(colRef: LocalCollectionReference) {
  const db = loadDB();
  const coll = db[colRef.path] || {};
  const docs = Object.entries(coll).map(([id, data]) => ({ id, data }));
  return {
    docs: docs.map(d => ({ id: d.id, data: () => d.data }))
  };
}

export function onSnapshot(ref: LocalDocumentReference | LocalCollectionReference, onNext: (snapshot: any) => void, onError?: (error: any) => void) : Unsubscribe {
  if (ref.type === 'collection') {
    const path = ref.path;
    const set = collectionListeners.get(path) ?? new Set();
    set.add(onNext);
    collectionListeners.set(path, set);
    // Emit initial snapshot
    const initial = getDocs(ref).then(snapshot => onNext(snapshot)).catch(onError);
    const unsub = () => set.delete(onNext);
    return unsub;
  }
  // document
  if (ref.type === 'document') {
    const path = ref.path;
    const set = docListeners.get(path) ?? new Set();
    set.add(onNext);
    docListeners.set(path, set);
    // Emit initial snapshot
    const initial = getDoc(ref).then(snapshot => onNext(snapshot)).catch(onError);
    const unsub = () => set.delete(onNext);
    return unsub;
  }
  return () => {};
}

// Listen to storage events (other tabs) to keep consistent
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (ev) => {
    if (ev.key === STORAGE_KEY) {
    // recompute and notify all collections/doc listeners
    const db = loadDB();
    for (const [path, listeners] of collectionListeners.entries()) {
      if (!listeners.size) continue;
      const coll = db[path] || {};
      const snapshot = {
        docs: Object.entries(coll).map(([id, data]) => ({ id, data }))
      };
      listeners.forEach(cb => cb({ docs: snapshot.docs.map(d => ({ id: d.id, data: () => d.data })) }));
    }

    for (const [fullPath, listeners] of docListeners.entries()) {
      if (!listeners.size) continue;
      const [collectionPath, id] = splitPath(fullPath);
      const coll = db[collectionPath] || {};
      const data = coll[id] ?? null;
      const snapshot = {
        exists: () => data !== null,
        data: () => data ?? undefined,
        id,
      };
      listeners.forEach(cb => cb(snapshot));
    }
    }
  });
}

// For compatibility: export 'query' and 'where' stubs if code imports them — no-op.
export function query() { throw new Error('query is not implemented for localFirestore'); }
export function where() { throw new Error('where is not implemented for localFirestore'); }

export { DocumentData };
