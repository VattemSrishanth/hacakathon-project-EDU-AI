
const DB_NAME = 'edu_ai_offline_db';
const STORE_NAME = 'lessons';
const DOUBTS_STORE = 'doubts';
const DB_VERSION = 2;

export interface OfflineLesson {
  id: string;
  title: string;
  content: any;
  subject: string;
  downloadedAt: number;
  metadata?: any;
}

export interface OfflineDoubt {
  id: string;
  question: string;
  subject: string;
  username: string;
  createdAt: number;
  isSyncing?: boolean;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(DOUBTS_STORE)) {
        db.createObjectStore(DOUBTS_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const offlineContentService = {
  // ... existing methods ...
  saveLesson: async (lesson: OfflineLesson): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.put(lesson);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getLesson: async (id: string): Promise<OfflineLesson | null> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  getAllLessons: async (): Promise<OfflineLesson[]> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  deleteLesson: async (id: string): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  isLessonDownloaded: async (id: string): Promise<boolean> => {
    const lesson = await offlineContentService.getLesson(id);
    return !!lesson;
  },

  // Doubts Methods
  saveDoubt: async (doubt: OfflineDoubt): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(DOUBTS_STORE, 'readwrite');
    const store = transaction.objectStore(DOUBTS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.put(doubt);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getAllDoubts: async (): Promise<OfflineDoubt[]> => {
    const db = await openDB();
    const transaction = db.transaction(DOUBTS_STORE, 'readonly');
    const store = transaction.objectStore(DOUBTS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  clearDoubts: async (): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(DOUBTS_STORE, 'readwrite');
    const store = transaction.objectStore(DOUBTS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};
