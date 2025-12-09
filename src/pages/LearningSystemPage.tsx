import React, { useState } from 'react';
import { LearningDashboardMUI } from '../components/LearningDashboardMUI';
import { StageDetailMUI } from '../components/StageDetailMUI';
import { koreanCurriculum } from '../data/curriculum';
import { CurriculumStage } from '../types/learningSystem';
import { useLearningProgress } from '../contexts/LearningProgressContext';

export const LearningSystemPage: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<CurriculumStage | null>(null);
  const { progress } = useLearningProgress();

  const handleStageSelect = (stageId: string) => {
    const stage = koreanCurriculum.stages.find(s => s.id === stageId);
    if (stage) {
      // Check if stage is unlocked
      const isUnlocked = stage.prerequisites.every(prereqId => {
        const prereqStage = koreanCurriculum.stages.find(s => s.id === prereqId);
        if (!prereqStage) return false;
        return prereqStage.modules.every(moduleId => progress.completedLessons.includes(moduleId));
      });

      if (isUnlocked || stage.prerequisites.length === 0) {
        setSelectedStage(stage);
      }
    }
  };

  if (selectedStage) {
    return (
      <StageDetailMUI
        stage={selectedStage}
        onBack={() => setSelectedStage(null)}
      />
    );
  }

  return <LearningDashboardMUI onStageSelect={handleStageSelect} />;
};