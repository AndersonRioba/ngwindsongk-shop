export function save(key, value) {
  if (typeof window === 'undefined') return false;
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  localStorage.setItem(key, stringValue);
  return true;
}

export function load(key) {
  if (typeof window === 'undefined') return null;
  const value = localStorage.getItem(key);
  if (!value || value === 'undefined') return null;
  try {
    return JSON.parse(value);
  } catch (e) {
    return value; // Return raw string if JSON.parse fails (e.g. for token)
  }
}


export function remove(key) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key)
}

const dbName = 'EIK';

export function saveDB(key, value) {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(dbName, 1);

    openRequest.onupgradeneeded = function () {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains(key)) {
        db.createObjectStore(key);
      }
    };

    openRequest.onsuccess = function () {
      const db = openRequest.result;
      const transaction = db.transaction(key, 'readwrite');
      const store = transaction.objectStore(key);
      const request = store.put(value, key);

      request.onsuccess = function () {
        resolve(true);
      };

      request.onerror = function () {
        reject(request.error);
      };
    };

    openRequest.onerror = function () {
      reject(openRequest.error);
    };
  });
}

export function loadDB(key) {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(dbName, 1);

    openRequest.onsuccess = function () {
      const db = openRequest.result;
      try {
        const transaction = db.transaction(key, 'readonly');
        const store = transaction.objectStore(key);
        const request = store.get(key);

        request.onsuccess = function () {
          resolve(request.result);
        };

        request.onerror = function () {
          reject(request.error);
        };
      } catch (e) {
        reject(e)
      }
    };

    openRequest.onerror = function () {
      reject(openRequest.error);
    };
  });
}

export function removeDB(key) {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(dbName, 1);

    openRequest.onsuccess = function () {
      const db = openRequest.result;
      const transaction = db.transaction(key, 'readwrite');
      const store = transaction.objectStore(key);
      const request = store.delete(key);

      request.onsuccess = function () {
        resolve(true);
      };

      request.onerror = function () {
        reject(request.error);
      };
    };

    openRequest.onerror = function () {
      reject(openRequest.error);
    };
  });
}