import React, { useState } from 'react';
import { getLessonsByStage } from '../data/curriculum';
import { useLearningProgress } from '../contexts/LearningProgressContext';
import { LessonView } from './LessonView';
import { CurriculumStage, LessonModule } from '../types/learningSystem';

interface StageDetailProps {
  stage: CurriculumStage;
  onBack: () => void;
}

export const StageDetail: React.FC<StageDetailProps> = ({ stage, onBack }) => {
  const { progress } = useLearningProgress();
  const [selectedLesson, setSelectedLesson] = useState<LessonModule | null>(null);

  const lessons = getLessonsByStage(stage.id);

  if (selectedLesson) {
    return (
      <LessonView
        lesson={selectedLesson}
        onComplete={() => setSelectedLesson(null)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={onBack}
        className="mb-4 flex items-center text-blue-600 dark:text-blue-400 hover:underline"
      >
        ← ダッシュボードに戻る
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold dark:text-white mb-4">{stage.name}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{stage.description}</p>

        {stage.focusAreas.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold dark:text-white mb-2">学習内容:</h3>
            <div className="flex flex-wrap gap-2">
              {stage.focusAreas.map((area, idx) => (
                <div key={idx} className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                  <span className="font-semibold text-sm dark:text-white">
                    {area.type === 'consonants' && '子音: '}
                    {area.type === 'vowels' && '母音: '}
                    {area.type === 'finals' && '終声: '}
                    {area.type === 'sound-changes' && '音韻変化: '}
                  </span>
                  <span className="text-sm dark:text-gray-300">
                    {area.characters.length > 0 && area.characters.join(', ')}
                    {area.rules && area.rules.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {lessons.map((lesson, index) => {
          const isCompleted = progress.completedLessons.includes(lesson.id);
          const isLocked = index > 0 && !progress.completedLessons.includes(lessons[index - 1].id);

          return (
            <div
              key={lesson.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all ${
                !isLocked ? 'hover:shadow-xl cursor-pointer' : 'opacity-60'
              }`}
              onClick={() => !isLocked && setSelectedLesson(lesson)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                    isCompleted ? 'bg-green-500' : isLocked ? 'bg-gray-400' : 'bg-blue-500'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold dark:text-white">
                      {lesson.title}
                      {isLocked && <span className="ml-2 text-sm text-gray-500">🔒</span>}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{lesson.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {lesson.estimatedMinutes}分
                  </p>
                  {isCompleted && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                      完了済み
                    </p>
                  )}
                </div>
              </div>

              {lesson.objectives.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold dark:text-white mb-2">学習目標:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {lesson.objectives.map((objective, idx) => (
                      <li key={idx}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};