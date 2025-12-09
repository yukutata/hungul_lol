import React, { useState, useEffect } from 'react';
import { LessonModule } from '../types/learningSystem';
import { useLearningProgress } from '../contexts/LearningProgressContext';
import koreanTTS from '../utils/koreanTTS';

interface LessonViewProps {
  lesson: LessonModule;
  onComplete: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({ lesson, onComplete }) => {
  const { startSession, endSession, completeLesson, addMistake } = useLearningProgress();
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [showPractice, setShowPractice] = useState(false);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [score, setScore] = useState(0);
  interface Mistake {
    characterName: string;
    userAnswer: string;
    correctAnswer: string;
    mistakeType: string;
    timestamp: string;
  }
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const id = startSession(lesson.id);
    setSessionId(id);

    return () => {
      if (id) {
        endSession(id, score, mistakes);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  const handleNextContent = () => {
    if (currentContentIndex < lesson.content.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    } else {
      setShowPractice(true);
    }
  };

  const handlePrevContent = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
    }
  };

  const handlePracticeAnswer = (answer: string) => {
    const currentPractice = lesson.practiceItems[currentPracticeIndex];
    const correct = answer === currentPractice.correctAnswer;

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(score + (100 / lesson.practiceItems.length));
    } else {
      const mistake = {
        characterName: currentPractice.characterName,
        userAnswer: answer,
        correctAnswer: currentPractice.correctAnswer,
        mistakeType: currentPractice.type,
        timestamp: new Date().toISOString()
      };
      setMistakes([...mistakes, mistake]);

      addMistake({
        characterName: currentPractice.characterName,
        mistakeType: currentPractice.type as 'consonant' | 'vowel' | 'final' | 'tone',
        count: 1,
        lastOccurrence: new Date().toISOString()
      });
    }

    setTimeout(() => {
      setShowFeedback(false);
      setUserAnswer('');

      if (currentPracticeIndex < lesson.practiceItems.length - 1) {
        setCurrentPracticeIndex(currentPracticeIndex + 1);
      } else {
        // Lesson completed
        if (sessionId) {
          endSession(sessionId, score, mistakes);
        }
        if (score >= lesson.requiredScore) {
          completeLesson(lesson.id, score);
        }
        onComplete();
      }
    }, 2000);
  };

  const playAudio = (text: string) => {
    koreanTTS.speak(text);
  };

  if (!showPractice) {
    const currentContent = lesson.content[currentContentIndex];

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold dark:text-white">{lesson.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{lesson.description}</p>
            <div className="flex items-center mt-4 space-x-4">
              <span className="text-sm bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                ステージ {lesson.stage}
              </span>
              <span className="text-sm bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
                推定時間: {lesson.estimatedMinutes}分
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>進捗</span>
              <span>{currentContentIndex + 1} / {lesson.content.length}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentContentIndex + 1) / lesson.content.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold dark:text-white mb-4">{currentContent.title}</h3>
            <p className="text-gray-700 dark:text-gray-200 mb-4 whitespace-pre-wrap">
              {currentContent.content}
            </p>

            {currentContent.examples && currentContent.examples.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold dark:text-white mb-3">例:</h4>
                <div className="space-y-3">
                  {currentContent.examples.map((example, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {example.korean}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {example.romanization}
                        </span>
                        {example.meaning && (
                          <span className="text-gray-500 dark:text-gray-400">
                            ({example.meaning})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => playAudio(example.korean)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                      >
                        🔊
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevContent}
              disabled={currentContentIndex === 0}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              前へ
            </button>
            <button
              onClick={handleNextContent}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {currentContentIndex === lesson.content.length - 1 ? '練習へ' : '次へ'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Practice mode
  if (lesson.practiceItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold dark:text-white mb-4">レッスン完了！</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            このレッスンの練習問題はまだ準備中です。
          </p>
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  const currentPractice = lesson.practiceItems[currentPracticeIndex];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold dark:text-white">練習問題</h2>
          <div className="flex justify-between items-center mt-4">
            <span className="text-gray-600 dark:text-gray-300">
              問題 {currentPracticeIndex + 1} / {lesson.practiceItems.length}
            </span>
            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              スコア: {Math.round(score)}点
            </span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl dark:text-white mb-4">{currentPractice.question}</h3>

          {currentPractice.type === 'recognition' && currentPractice.options && (
            <div className="grid grid-cols-2 gap-4">
              {currentPractice.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePracticeAnswer(option)}
                  disabled={showFeedback}
                  className="p-4 border-2 rounded-lg text-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentPractice.type === 'pronunciation' && (
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                {currentPractice.characterName}
              </div>
              <button
                onClick={() => playAudio(currentPractice.characterName)}
                className="p-4 text-3xl bg-blue-100 dark:bg-blue-900 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                🔊
              </button>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userAnswer) {
                    handlePracticeAnswer(userAnswer);
                  }
                }}
                placeholder="ローマ字で入力"
                className="mt-4 w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                disabled={showFeedback}
              />
            </div>
          )}

          {showFeedback && (
            <div className={`mt-6 p-4 rounded-lg text-center ${
              isCorrect
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              <p className="text-lg font-semibold">
                {isCorrect ? '正解！' : '不正解'}
              </p>
              {!isCorrect && currentPractice.explanation && (
                <p className="mt-2">{currentPractice.explanation}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};