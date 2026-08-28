const DB_NAME = 'StudyDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const demoImageStore = new Map();

function openDB() {
  return new Promise(function (resolve, reject) {
    var req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = function (e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = function (e) { resolve(e.target.result); };
    req.onerror = function (e) { reject(e.target.error); };
  });
}

function saveImage(key, blob) {
  if (window.APP_MODE === 'demo') { demoImageStore.set(key, blob); return Promise.resolve(); }
  return openDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE_NAME, 'readwrite');
      var store = tx.objectStore(STORE_NAME);
      store.put(blob, key);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function (e) { reject(e.target.error); };
    });
  });
}

function getImage(key) {
  if (window.APP_MODE === 'demo') return Promise.resolve(demoImageStore.get(key) || null);
  return openDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE_NAME, 'readonly');
      var store = tx.objectStore(STORE_NAME);
      var req = store.get(key);
      req.onsuccess = function (e) { resolve(e.target.result || null); };
      req.onerror = function (e) { reject(e.target.error); };
    });
  });
}

function deleteImage(key) {
  if (window.APP_MODE === 'demo') { demoImageStore.delete(key); return Promise.resolve(); }
  return openDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE_NAME, 'readwrite');
      var store = tx.objectStore(STORE_NAME);
      store.delete(key);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function (e) { reject(e.target.error); };
    });
  });
}
