


const OFFLINE_QUEUE_KEY = 'offline_sync_queue';

export type OfflineActionType = 'PROGRESS_UPDATE' | 'CHAT_HISTORY' | 'FEEDBACK' | 'SETTINGS' | 'PROFILE_UPDATE' | 'COMMUNITY_POST';

export interface OfflineAction {
  type: OfflineActionType;
  payload: any;
  timestamp: number;
  retryCount: number;
}

export const offlineSyncService = {
  queueAction: (type: OfflineActionType, payload: any) => {
    try {
      const queue: OfflineAction[] = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
      queue.push({ 
        type, 
        payload, 
        timestamp: Date.now(),
        retryCount: 0
      });
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      console.log(`[OfflineSync] Queued ${type} action`);
    } catch (e) {
      console.error('[OfflineSync] Failed to queue action', e);
    }
  },

  getQueue: (): OfflineAction[] => {
    try {
      return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  clearQueue: () => {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  },

  syncAll: async (userId: string) => {
    const queue = offlineSyncService.getQueue();
    if (queue.length === 0) return true;

    console.log(`[OfflineSync] Attempting to sync ${queue.length} actions...`);

    try {
      const authData = localStorage.getItem('auth');
      const token = authData ? JSON.parse(authData).token : null;

      if (!token) {
        console.warn('[OfflineSync] No auth token found, skipping sync');
        return false;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, actions: queue })
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('[OfflineSync] Sync successful, clearing queue');
        offlineSyncService.clearQueue();
        return true;
      }
      
      console.warn('[OfflineSync] Sync failed on server:', result.message);
      return false;
    } catch (e) {
      console.error('[OfflineSync] Network error during sync', e);
      return false;
    }
  }
};
