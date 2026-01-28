


const OFFLINE_QUEUE_KEY = 'offline_sync_queue';

export interface OfflineAction {
  type: 'PROGRESS_UPDATE' | 'CHAT_HISTORY' | 'FEEDBACK' | 'SETTINGS';
  payload: any;
  timestamp: number;
}

export const offlineSyncService = {
  queueAction: (action: Omit<OfflineAction, 'timestamp'>) => {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    queue.push({ ...action, timestamp: Date.now() });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  },

  getQueue: (): OfflineAction[] => {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  },

  clearQueue: () => {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  },

  syncAll: async (userId: string) => {
    const queue = offlineSyncService.getQueue();
    if (queue.length === 0) return true;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/sync?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth') || '{}').token}`
        },
        body: JSON.stringify({ actions: queue })
      });
      
      const result = await response.json();
      if (result.success) {
        offlineSyncService.clearQueue();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Sync failed', e);
      return false;
    }
  }
};
