import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  LearningLevel,
  LearningProgress,
  Achievement,
  StudySession,
  UserPreferences,
  MistakePattern
} from '../types/learningSystem';

interface LearningProgressContextType {
  progress: LearningProgress;
  preferences: UserPreferences;
  sessions: StudySession[];
  updateLevel: (level: LearningLevel) => void;
  completeLesson: (lessonId: string, score: number) => void;
  addMistake: (mistake: MistakePattern) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  startSession: (lessonId: string) => string;
  endSession: (sessionId: string, score: number, mistakes: StudyMistake[]) => void;
  unlockAchievement: (achievement: Achievement) => void;
  getRecommendedLessons: () => string[];
  updateStreak: () => void;
}

const LearningProgressContext = createContext<LearningProgressContextType | undefined>(undefined);

const STORAGE_KEY = 'hungul_lol_learning_progress';
const PREFERENCES_KEY = 'hungul_lol_preferences';
const SESSIONS_KEY = 'hungul_lol_sessions';

export const LearningProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<LearningProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      currentLevel: 'beginner',
      completedLessons: [],
      totalScore: 0,
      streakDays: 0,
      lastStudyDate: new Date().toISOString(),
      achievements: [],
      mistakePatterns: []
    };
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      studyPace: 'normal',
      preferredGames: ['lol', 'eternal-return'],
      dailyGoalMinutes: 15,
      reminderEnabled: false
    };
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem(SESSIONS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const updateLevel = (level: LearningLevel) => {
    setProgress(prev => ({ ...prev, currentLevel: level }));
  };

  const completeLesson = (lessonId: string, score: number) => {
    setProgress(prev => ({
      ...prev,
      completedLessons: [...new Set([...prev.completedLessons, lessonId])],
      totalScore: prev.totalScore + score
    }));

    // Check for level progression
    const beginnerLessons = ['module-1-1', 'module-1-2', 'module-1-3', 'module-2-1', 'module-2-2', 'module-2-3'];
    const intermediateLessons = ['module-3-1', 'module-3-2', 'module-3-3', 'module-3-4', 'module-4-1', 'module-4-2', 'module-4-3'];
    const advancedLessons = ['module-5-1', 'module-5-2', 'module-5-3', 'module-5-4'];

    const completedBeginnerCount = progress.completedLessons.filter(id => beginnerLessons.includes(id)).length;
    const completedIntermediateCount = progress.completedLessons.filter(id => intermediateLessons.includes(id)).length;
    const completedAdvancedCount = progress.completedLessons.filter(id => advancedLessons.includes(id)).length;

    if (completedBeginnerCount >= 4 && progress.currentLevel === 'beginner') {
      updateLevel('intermediate');
      unlockAchievement({
        id: 'intermediate-unlock',
        name: '中級レベル解除',
        description: '初級レベルを修了しました！',
        unlockedAt: new Date().toISOString()
      });
    } else if (completedIntermediateCount >= 5 && progress.currentLevel === 'intermediate') {
      updateLevel('advanced');
      unlockAchievement({
        id: 'advanced-unlock',
        name: '上級レベル解除',
        description: '中級レベルを修了しました！',
        unlockedAt: new Date().toISOString()
      });
    } else if (completedAdvancedCount >= 3 && progress.currentLevel === 'advanced') {
      updateLevel('master');
      unlockAchievement({
        id: 'master-unlock',
        name: 'マスターレベル達成',
        description: '全レベルを修了しました！',
        unlockedAt: new Date().toISOString()
      });
    }
  };

  const addMistake = (mistake: MistakePattern) => {
    setProgress(prev => {
      const existing = prev.mistakePatterns.find(
        m => m.characterName === mistake.characterName && m.mistakeType === mistake.mistakeType
      );

      if (existing) {
        return {
          ...prev,
          mistakePatterns: prev.mistakePatterns.map(m =>
            m === existing
              ? { ...m, count: m.count + 1, lastOccurrence: new Date().toISOString() }
              : m
          )
        };
      }

      return {
        ...prev,
        mistakePatterns: [...prev.mistakePatterns, mistake]
      };
    });
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  };

  const startSession = (lessonId: string): string => {
    const sessionId = `session-${Date.now()}`;
    const newSession: StudySession = {
      id: sessionId,
      startTime: new Date().toISOString(),
      lessonId,
      score: 0,
      mistakes: [],
      completed: false
    };
    setSessions(prev => [...prev, newSession]);
    return sessionId;
  };

  const endSession = (sessionId: string, score: number, mistakes: StudyMistake[]) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? {
              ...session,
              endTime: new Date().toISOString(),
              score,
              mistakes,
              completed: true
            }
          : session
      )
    );
  };

  const unlockAchievement = (achievement: Achievement) => {
    setProgress(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievement]
    }));
  };

  const getRecommendedLessons = (): string[] => {
    // TODO: Implement recommendation logic based on mistake patterns
    // const frequentMistakes = progress.mistakePatterns
    //   .filter(m => m.count >= 3)
    //   .sort((a, b) => b.count - a.count)
    //   .slice(0, 3);

    return [];
  };

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastStudy = new Date(progress.lastStudyDate).toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastStudy === today) {
      // Already studied today
      return;
    } else if (lastStudy === yesterdayStr) {
      // Continuing streak
      setProgress(prev => ({
        ...prev,
        streakDays: prev.streakDays + 1,
        lastStudyDate: new Date().toISOString()
      }));
    } else {
      // Streak broken
      setProgress(prev => ({
        ...prev,
        streakDays: 1,
        lastStudyDate: new Date().toISOString()
      }));
    }
  };

  const value: LearningProgressContextType = {
    progress,
    preferences,
    sessions,
    updateLevel,
    completeLesson,
    addMistake,
    updatePreferences,
    startSession,
    endSession,
    unlockAchievement,
    getRecommendedLessons,
    updateStreak
  };

  return (
    <LearningProgressContext.Provider value={value}>
      {children}
    </LearningProgressContext.Provider>
  );
};

export const useLearningProgress = () => {
  const context = useContext(LearningProgressContext);
  if (!context) {
    throw new Error('useLearningProgress must be used within LearningProgressProvider');
  }
  return context;
};