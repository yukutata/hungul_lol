import React from 'react';
import { useLearningProgress } from '../contexts/LearningProgressContext';
import { koreanCurriculum } from '../data/curriculum';
import { LearningLevel } from '../types/learningSystem';

const levelColors: Record<LearningLevel, string> = {
  beginner: '#4ade80',
  intermediate: '#60a5fa',
  advanced: '#a78bfa',
  master: '#f59e0b'
};

const levelNames: Record<LearningLevel, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
  master: 'マスター'
};

interface LearningDashboardProps {
  onStageSelect?: (stageId: string) => void;
}

export const LearningDashboard: React.FC<LearningDashboardProps> = ({ onStageSelect }) => {
  const { progress, preferences, updateStreak } = useLearningProgress();

  React.useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  const getCompletionPercentage = (stageId: string): number => {
    const stage = koreanCurriculum.stages.find(s => s.id === stageId);
    if (!stage) return 0;

    const completedModules = stage.modules.filter(moduleId =>
      progress.completedLessons.includes(moduleId)
    ).length;

    return (completedModules / stage.modules.length) * 100;
  };

  const isStageUnlocked = (stageId: string): boolean => {
    const stage = koreanCurriculum.stages.find(s => s.id === stageId);
    if (!stage) return false;

    return stage.prerequisites.every(prereqId => {
      const prereqStage = koreanCurriculum.stages.find(s => s.id === prereqId);
      if (!prereqStage) return false;
      return prereqStage.modules.every(moduleId => progress.completedLessons.includes(moduleId));
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold dark:text-white">学習ダッシュボード</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              現在のレベル：
              <span
                className="font-bold ml-2 px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: levelColors[progress.currentLevel] }}
              >
                {levelNames[progress.currentLevel]}
              </span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-orange-500">
              🔥 {progress.streakDays}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">連続学習日数</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">完了レッスン</p>
            <p className="text-2xl font-bold dark:text-white">{progress.completedLessons.length}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">総スコア</p>
            <p className="text-2xl font-bold dark:text-white">{progress.totalScore}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">獲得バッジ</p>
            <p className="text-2xl font-bold dark:text-white">{progress.achievements.length}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">学習ペース</p>
            <p className="text-2xl font-bold dark:text-white">
              {preferences.studyPace === 'slow' ? 'ゆっくり' :
               preferences.studyPace === 'normal' ? '普通' : '速い'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold dark:text-white mb-4">学習カリキュラム</h3>

        <div className="space-y-4">
          {koreanCurriculum.stages.map((stage, index) => {
            const isUnlocked = isStageUnlocked(stage.id);
            const completionPercentage = getCompletionPercentage(stage.id);

            return (
              <div
                key={stage.id}
                className={`border rounded-lg p-4 transition-all ${
                  isUnlocked
                    ? 'border-blue-300 dark:border-blue-600 hover:shadow-md cursor-pointer'
                    : 'border-gray-200 dark:border-gray-600 opacity-60'
                }`}
                onClick={() => isUnlocked && onStageSelect?.(stage.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700">
                      <span className="text-lg font-bold dark:text-white">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-bold dark:text-white">
                        {stage.name}
                        {!isUnlocked && <span className="ml-2 text-sm text-gray-500">🔒</span>}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{stage.description}</p>
                      <div className="flex items-center mt-1">
                        <span
                          className="text-xs px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: levelColors[stage.level] }}
                        >
                          {levelNames[stage.level]}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {stage.modules.length}レッスン
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-32">
                    <div className="text-sm text-right text-gray-600 dark:text-gray-300 mb-1">
                      {Math.round(completionPercentage)}%
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {stage.focusAreas.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {stage.focusAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                      >
                        {area.type === 'consonants' && '子音'}
                        {area.type === 'vowels' && '母音'}
                        {area.type === 'finals' && '終声'}
                        {area.type === 'sound-changes' && '音韻変化'}
                        {area.type === 'practice' && '実践'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {progress.mistakePatterns.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold dark:text-white mb-4">苦手分野</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress.mistakePatterns
              .sort((a, b) => b.count - a.count)
              .slice(0, 6)
              .map((pattern, idx) => (
                <div key={idx} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <p className="font-semibold dark:text-white">{pattern.characterName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {pattern.mistakeType === 'consonant' && '子音'}
                    {pattern.mistakeType === 'vowel' && '母音'}
                    {pattern.mistakeType === 'final' && '終声'}
                    {pattern.mistakeType === 'tone' && '音調'}
                    の間違い
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {pattern.count}回
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {progress.achievements.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold dark:text-white mb-4">獲得バッジ</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {progress.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center"
              >
                <div className="text-3xl mb-2">🏆</div>
                <p className="font-semibold text-sm dark:text-white">{achievement.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};