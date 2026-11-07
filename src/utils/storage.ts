import { UserStats, ExamResult } from '../types';

const STATS_KEY = 'triethoc_pro_user_stats';
const SETTINGS_KEY = 'triethoc_pro_settings';

export interface AppSettings {
  darkMode: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  soundEnabled: boolean;
}

const defaultStats: UserStats = {
  totalPracticed: 0,
  correctAnswersCount: 0,
  wrongQuestionIds: [],
  bookmarkedQuestionIds: [],
  examHistory: [],
  lastStudyDate: '',
  streakDays: 1,
  masteredFlashcardIds: [],
};

const defaultSettings: AppSettings = {
  darkMode: false,
  fontSize: 'normal',
  soundEnabled: true,
};

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw);
    return { ...defaultStats, ...parsed };
  } catch {
    return defaultStats;
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save user stats', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function updateStreak(currentStats: UserStats): UserStats {
  const today = new Date().toISOString().slice(0, 10);
  if (!currentStats.lastStudyDate) {
    return {
      ...currentStats,
      lastStudyDate: today,
      streakDays: 1,
    };
  }

  if (currentStats.lastStudyDate === today) {
    return currentStats;
  }

  const lastDate = new Date(currentStats.lastStudyDate);
  const curDate = new Date(today);
  const diffTime = Math.abs(curDate.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = currentStats.streakDays;
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  }

  const updated = {
    ...currentStats,
    lastStudyDate: today,
    streakDays: newStreak,
  };
  saveUserStats(updated);
  return updated;
}
