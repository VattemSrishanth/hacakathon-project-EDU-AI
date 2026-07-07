import { useState, useEffect, useMemo } from 'react';
import { Zap } from 'lucide-react';
import Card from './Card';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';









/**
 * DAILY LOGIN PROGRESS SYSTEM (Independent)
 * This component tracks user engagement streaks strictly based on calendar days.
 * It is decoupled from the lesson completion system to ensure engagement
 * metrics (streaks) and academic metrics (lesson progress) are handled separately.
 */
const LoginTracker = () => {
  const { auth } = useAuth();
  const [data, setData] = useState(null);

  const buildStorageKey = () => {
    const userId = auth?.user?.id || auth?.user?.username || 'guest';
    return `user_login_tracker_${userId}`;
  };

  const writeLocalTracker = (key, tracker) => {
    localStorage.setItem(key, JSON.stringify(tracker));
    setData(tracker);
  };

  useEffect(() => {
    const userId = auth?.user?.id || auth?.user?.username || 'guest';
    const STORAGE_KEY = buildStorageKey();

    // Get today's date in YYYY-MM-DD format
    // Using UTC to ensure consistent days across timezones
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const stored = localStorage.getItem(STORAGE_KEY);

    const buildLocalTracker = () => {
      let tracker;

      if (!stored) {
        tracker = {
          joinDate: today,
          loginDates: [today],
          currentStreak: 1,
          longestStreak: 1,
          lastLoginDate: today
        };
      } else {
        tracker = JSON.parse(stored);
        if (!tracker.loginDates) tracker.loginDates = [];
        if (!tracker.joinDate) tracker.joinDate = today;

        if (tracker.lastLoginDate !== today) {
          let isConsecutive = false;
          if (tracker.lastLoginDate) {
            const last = new Date(tracker.lastLoginDate);
            const nextDayDate = new Date(last);
            nextDayDate.setUTCDate(nextDayDate.getUTCDate() + 1);
            const nextDay = nextDayDate.toISOString().split('T')[0];

            if (nextDay === today) {
              isConsecutive = true;
            }
          }

          if (!tracker.loginDates.includes(today)) {
            tracker.loginDates.push(today);
          }

          tracker.currentStreak = isConsecutive ? tracker.currentStreak + 1 : 1;
          tracker.longestStreak = Math.max(tracker.longestStreak, tracker.currentStreak);
          tracker.lastLoginDate = today;
        }
      }
      return tracker;
    };

    const fallbackTracker = buildLocalTracker();
    writeLocalTracker(STORAGE_KEY, fallbackTracker);

    const mergeServerStreak = (server) => {
      const joinDate = server?.join_date || fallbackTracker.joinDate || today;
      const lastLoginDate = server?.last_login_date || joinDate;
      const loginDates = Array.from(new Set([...(server?.login_dates || []), today, joinDate, lastLoginDate]));

      return {
        joinDate,
        loginDates,
        currentStreak: server?.current_streak ?? fallbackTracker.currentStreak,
        longestStreak: server?.longest_streak ?? fallbackTracker.longestStreak,
        lastLoginDate
      };
    };

    const syncWithServer = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/streak/ping`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });

        if (!res.ok) return;
        const payload = await res.json();
        if (!payload?.success || !payload?.streak) return;

        const merged = mergeServerStreak(payload.streak);
        writeLocalTracker(STORAGE_KEY, merged);
      } catch (e) {
        console.error('Unable to sync streak with server', e);
      }
    };

    syncWithServer();
  }, [auth?.user?.id]); // Re-run if user changes

  const calendarDays = useMemo(() => {
    if (!data) return [];

    const days = [];
    const startDate = new Date(data.joinDate);
    const startDayOfWeek = startDate.getDay(); // 0 is Sunday

    // Add empty padding for days before joinDate in the same week
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ empty: true });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate display count - show at least 28 days from join date
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const displayCount = Math.max(31, diffDays);

    for (let i = 0; i < displayCount; i++) {
      const current = new Date(startDate);
      current.setDate(startDate.getDate() + i);
      const dateStr = current.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];

      days.push({
        empty: false,
        date: current,
        dateStr,
        isLoggedIn: data.loginDates.includes(dateStr),
        isToday: dateStr === todayStr,
        dayNum: current.getDate()
      });
    }
    return days;
  }, [data]);

  if (!data) return null;

  return (
    <Card className="bg-app-bg text-app-text-main shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 tracking-tight">
            Learning Consistency
          </h3>
          <p className="text-app-text-sub text-xs mt-1">Journey started {new Date(data.joinDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="text-2xl font-black text-primary leading-none">{data.currentStreak}</div>
            <p className="text-app-text-sub text-[10px] uppercase tracking-widest mt-1 font-bold">Day Streak</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap size={24} className="text-primary fill-primary/20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-6">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) =>
        <div key={i} className="text-center text-[10px] text-app-text-muted font-bold mb-2">
            {day}
          </div>
        )}
        {calendarDays.map((day, i) =>
        <div
          key={i}
          className={`
              relative flex items-center justify-center rounded-md aspect-square text-[11px] transition-all
              ${day.empty ? 'opacity-0' : 'cursor-default'}
              ${day.isToday ? 'bg-primary text-white font-bold' : ''}
              ${!day.empty && !day.isToday && day.isLoggedIn ? 'bg-primary/20 text-primary font-medium' : ''}
              ${!day.empty && !day.isToday && !day.isLoggedIn ? 'bg-app-bg-alt text-app-text-muted' : ''}
            `}>
          
            {!day.empty && day.dayNum}
          </div>
        )}
      </div>
    </Card>);

};

export default LoginTracker;