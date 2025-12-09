export type LearningLevel = 'beginner' | 'intermediate' | 'advanced' | 'master';

export interface LearningProgress {
  userId?: string;
  currentLevel: LearningLevel;
  completedLessons: string[];
  currentLesson?: string;
  totalScore: number;
  streakDays: number;
  lastStudyDate: string;
  achievements: Achievement[];
  mistakePatterns: MistakePattern[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
  icon?: string;
}

export interface MistakePattern {
  characterName: string;
  mistakeType: 'consonant' | 'vowel' | 'final' | 'tone';
  count: number;
  lastOccurrence: string;
}

export interface LessonModule {
  id: string;
  level: LearningLevel;
  stage: number;
  title: string;
  description: string;
  objectives: string[];
  content: LessonContent[];
  practiceItems: PracticeItem[];
  requiredScore: number;
  estimatedMinutes: number;
}

export interface LessonContent {
  type: 'explanation' | 'example' | 'rule';
  title: string;
  content: string;
  examples?: Example[];
  audioText?: string;
}

export interface Example {
  korean: string;
  romanization: string;
  meaning?: string;
  audioUrl?: string;
}

export interface PracticeItem {
  id: string;
  type: 'recognition' | 'pronunciation' | 'writing' | 'listening';
  question: string;
  characterName: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: number;
}

export interface Curriculum {
  stages: CurriculumStage[];
}

export interface CurriculumStage {
  id: string;
  name: string;
  description: string;
  level: LearningLevel;
  modules: string[];
  prerequisites: string[];
  focusAreas: FocusArea[];
}

export interface FocusArea {
  type: 'consonants' | 'vowels' | 'finals' | 'sound-changes' | 'practice';
  characters: string[];
  rules?: string[];
}

export interface UserPreferences {
  studyPace: 'slow' | 'normal' | 'fast';
  preferredGames: ('lol' | 'eternal-return')[];
  dailyGoalMinutes: number;
  reminderEnabled: boolean;
  reminderTime?: string;
}

export interface StudySession {
  id: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  lessonId: string;
  score: number;
  mistakes: StudyMistake[];
  completed: boolean;
}

export interface StudyMistake {
  characterName: string;
  userAnswer: string;
  correctAnswer: string;
  mistakeType: string;
  timestamp: string;
}