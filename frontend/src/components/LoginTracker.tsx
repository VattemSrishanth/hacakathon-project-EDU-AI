import { useState, useEffect, useMemo } from 'react';
import Card from './Card';

interface TrackerData {
  joinDate: string;
  loginDates: string[];
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
}

const STORAGE_KEY = 'user_login_tracker';

/**
 * DAILY LOGIN PROGRESS SYSTEM (Independent)
 * This component tracks user engagement streaks strictly based on calendar days.
 * It is decoupled from the lesson completion system to ensure engagement
 * metrics (streaks) and academic metrics (lesson progress) are handled separately.
 */
const LoginTracker = () => {
  const [data, setData] = useState<TrackerData | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(STORAGE_KEY);
    
    let tracker: TrackerData;

    if (!stored) {
      // First time user
      tracker = {
        joinDate: today,
        loginDates: [today],
        currentStreak: 1,
        longestStreak: 1,
        lastLoginDate: today,
      };
    } else {
      tracker = JSON.parse(stored);
      
      if (tracker.lastLoginDate !== today) {
        // It's a new day
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (!tracker.loginDates.includes(today)) {
          tracker.loginDates.push(today);
        }

        if (tracker.lastLoginDate === yesterdayStr) {
          // Continuous streak
          tracker.currentStreak += 1;
        } else {
          // Streak broken
          tracker.currentStreak = 1;
        }

        tracker.longestStreak = Math.max(tracker.longestStreak, tracker.currentStreak);
        tracker.lastLoginDate = today;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracker));
    setData(tracker);
  }, []);

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
        dayNum: current.getDate(),
      });
    }
    return days;
  }, [data]);

  if (!data) return null;

  return (
    <Card className="bg-[#1e1e1e] border-none text-white shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            Login Progress
          </h3>
          <p className="text-gray-500 text-xs mt-1">Started {new Date(data.joinDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-2xl font-bold text-green-500 leading-none">{data.currentStreak}</div>
          <p className="text-gray-500 text-[10px] uppercase tracking-tighter mt-1">Day Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-6">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-[10px] text-gray-500 font-bold mb-2">
            {day}
          </div>
        ))}
        {calendarDays.map((day: any, i) => (
          <div
            key={i}
            className={`
              relative flex items-center justify-center rounded-md aspect-square text-[11px] transition-all
              ${day.empty ? 'opacity-0' : 'cursor-default'}
              ${day.isToday ? 'bg-green-500 text-white font-bold' : ''}
              ${!day.empty && !day.isToday && day.isLoggedIn ? 'bg-green-500/20 text-green-400' : ''}
              ${!day.empty && !day.isToday && !day.isLoggedIn ? 'bg-gray-800/40 text-gray-600' : ''}
            `}
          >
            {!day.empty && day.dayNum}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LoginTracker;
