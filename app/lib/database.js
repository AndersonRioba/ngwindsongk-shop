import { openDB } from 'idb';

const DB_NAME = 'ngwindsongk';
const DB_VERSION = 1;
const STORE_NAME = 'db';

let dbPromise;

function ensureIndexedDB() {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    throw new Error('IndexedDB is not available in this environment');
  }
}

async function getDB() {
  ensureIndexedDB();

  if (!dbPromise) {
    dbPromise = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log('upgrading db', oldVersion, newVersion, transaction);
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
      blocked() {
        console.log('IndexedDB upgrade blocked');
      },
      blocking() {
        console.log('IndexedDB upgrade blocking');
      },
      terminated() {
        console.log('IndexedDB connection terminated');
      },
    });
  }

  return dbPromise;
}

async function withStore(mode, handler) {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, mode);
  const store = tx.objectStore(STORE_NAME);
  const result = await handler(store);
  await tx.done;
  return result;
}

/**
 * Create a new record in IndexedDB.
 * @param {IDBValidKey} key - Primary key for the record.
 * @param {any} value - Value to store. Must be structured-cloneable.
 */
export async function createRecord(key, value) {
  return withStore('readwrite', async (store) => {
    if (await store.getKey(key)) {
      throw new Error(`Record with key "${key}" already exists`);
    }
    await store.add(value, key);
    return true;
  });
}

/**
 * Read a record from IndexedDB.
 * @param {IDBValidKey} key - Primary key of the record to retrieve.
 */
export function readRecord(key) {
  return withStore('readonly', (store) => store.get(key));
}

/**
 * Update an existing record in IndexedDB.
 * @param {IDBValidKey} key - Primary key of the record to update.
 * @param {any} value - New value to persist.
 */
export async function updateRecord(key, value) {
  return withStore('readwrite', async (store) => {
    if (!(await store.getKey(key))) {
      await createRecord(key, value);
      return true;
    }
    await store.put(value, key);
    return true;
  });
}

/**
 * Delete a record from IndexedDB.
 * @param {IDBValidKey} key - Primary key of the record to remove.
 */
export async function deleteRecord(key) {
  return withStore('readwrite', async (store) => {
    await store.delete(key);
    return true;
  });
}

export async function clearDatabase() {
  return withStore('readwrite', async (store) => {
    await store.clear();
    return true;
  });
}