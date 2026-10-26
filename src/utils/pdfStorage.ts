const DB_NAME = 'ministerial_decisions_db';
const STORE_NAME = 'pdf_documents';
const DB_VERSION = 1;

interface StoredPdfRecord {
  id: string; // decisionId
  blob: Blob;
  filename: string;
  size: number;
  uploadedAt: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores a PDF file associated with a decision ID in IndexedDB
 */
export async function savePdfToStorage(
  decisionId: string,
  file: File | Blob,
  filename: string
): Promise<{ filename: string; size: number; uploadedAt: string }> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredPdfRecord = {
      id: decisionId,
      blob: file,
      filename,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };

    const req = store.put(record);

    req.onsuccess = () => {
      resolve({
        filename: record.filename,
        size: record.size,
        uploadedAt: record.uploadedAt,
      });
    };

    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieves a PDF file from IndexedDB and returns a browser blob URL
 */
export async function getPdfFromStorage(
  decisionId: string
): Promise<{ url: string; filename: string; size: number } | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(decisionId);

      req.onsuccess = () => {
        const record = req.result as StoredPdfRecord | undefined;
        if (!record || !record.blob) {
          resolve(null);
          return;
        }
        const url = URL.createObjectURL(record.blob);
        resolve({
          url,
          filename: record.filename,
          size: record.size,
        });
      };

      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error('Error fetching PDF from storage:', error);
    return null;
  }
}

/**
 * Deletes a PDF file from storage
 */
export async function deletePdfFromStorage(decisionId: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(decisionId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error('Error deleting PDF from storage:', error);
  }
}

/**
 * Helper to format byte size nicely
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
