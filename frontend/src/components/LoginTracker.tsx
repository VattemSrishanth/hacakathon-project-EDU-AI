import { useState, useEffect, useMemo } from 'react';
import Card from './Card';
import { useAuth } from '../context/AuthContext';

interface TrackerData {
  joinDate: string;
  loginDates: string[];
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
}

/**
 * DAILY LOGIN PROGRESS SYSTEM (Independent)
 * This component tracks user engagement streaks strictly based on calendar days.
 * It is decoupled from the lesson completion system to ensure engagement
 * metrics (streaks) and academic metrics (lesson progress) are handled separately.
 */
const LoginTracker = () => {
  const { auth } = useAuth();
  const [data, setData] = useState<TrackerData | null>(null);

  useEffect(() => {
    // Ensure we have a user to track
    const userId = auth?.user?.id || auth?.user?.username || 'guest';
    const STORAGE_KEY = `user_login_tracker_${userId}`;
    
    // Get today's date in YYYY-MM-DD format
    // Using UTC to ensure consistent days across timezones
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const stored = localStorage.getItem(STORAGE_KEY);
    
    let tracker: TrackerData;

    try {
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
        
        // Handle migration or corrupted data
        if (!tracker.loginDates) tracker.loginDates = [];
        if (!tracker.joinDate) tracker.joinDate = today;

        if (tracker.lastLoginDate !== today) {
          // Calculate if the streak continues
          // lastLoginDate + 1 day should equal today for streak confirmation
          
          let isConsecutive = false;
          if (tracker.lastLoginDate) {
              const last = new Date(tracker.lastLoginDate);
              // Set to noon to avoid DST/timezone edge cases when adding days
              // But since we use UTC strings (YYYY-MM-DD), straight comparison is better.
              // Logic: Create date from string, add 1 day, format back to string.
              
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

          if (isConsecutive) {
            // Continuous streak
            tracker.currentStreak += 1;
          } else if (tracker.lastLoginDate && tracker.lastLoginDate < today) {
            // Streak broken (missed a day or more)
            // But verify it's not simply re-login on same day (already handled by outer check)
            // If today > lastLoginDate + 1, reset.
            tracker.currentStreak = 1;
          }
          // If tracker.lastLoginDate > today (time travel?), do nothing or keep as is.

          tracker.longestStreak = Math.max(tracker.longestStreak, tracker.currentStreak);
          tracker.lastLoginDate = today;
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(tracker));
      setData(tracker);
    } catch (e) {
      console.error("Error updating login tracker", e);
      // Fallback reset if error
      const fresh: TrackerData = {
          joinDate: today,
          loginDates: [today],
          currentStreak: 1,
          longestStreak: 1,
          lastLoginDate: today,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      setData(fresh);
    }
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
        dayNum: current.getDate(),
      });
    }
    return days;
  }, [data]);

  if (!data) return null;

  return (
    <Card className="bg-app-bg text-app-text-main shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            Login Progress
          </h3>
          <p className="text-app-text-sub text-xs mt-1">Started {new Date(data.joinDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-2xl font-bold text-primary leading-none">{data.currentStreak}</div>
          <p className="text-app-text-sub text-[10px] uppercase tracking-tighter mt-1">Day Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-6">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-[10px] text-app-text-muted font-bold mb-2">
            {day}
          </div>
        ))}
        {calendarDays.map((day: any, i) => (
          <div
            key={i}
            className={`
              relative flex items-center justify-center rounded-md aspect-square text-[11px] transition-all
              ${day.empty ? 'opacity-0' : 'cursor-default'}
              ${day.isToday ? 'bg-primary text-white font-bold' : ''}
              ${!day.empty && !day.isToday && day.isLoggedIn ? 'bg-primary/20 text-primary font-medium' : ''}
              ${!day.empty && !day.isToday && !day.isLoggedIn ? 'bg-app-bg-alt text-app-text-muted' : ''}
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
