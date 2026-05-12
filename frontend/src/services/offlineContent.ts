
const DB_NAME = 'edu_ai_offline_db';
const STORE_NAME = 'lessons';
const DOUBTS_STORE = 'doubts';
const DB_VERSION = 3;

export interface OfflineLesson {
  id: string;
  userId: string;
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
  topic?: string;
  classLevel?: string;
  username: string;
  createdAt: number;
  isSyncing?: boolean;
  repliesCount?: number;
  viewsCount?: number;
  isVerified?: boolean;
  status?: string;
  helpfulCount?: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      
      // If version 3 upgrade, recreate store with composite key
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME, { keyPath: ['userId', 'id'] });

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

  getLesson: async (userId: string, id: string): Promise<OfflineLesson | null> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      // Use composite key to get specific lesson for specific user
      const request = store.get([String(userId), String(id)]);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  getAllLessons: async (userId?: string): Promise<OfflineLesson[]> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        let results = request.result as OfflineLesson[];
        if (userId) {
          results = results.filter(lesson => String(lesson.userId) === String(userId));
        }
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  },

  deleteLesson: async (userId: string, id: string): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.delete([String(userId), String(id)]);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  isLessonDownloaded: async (userId: string, id: string): Promise<boolean> => {
    const lesson = await offlineContentService.getLesson(userId, id);
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
