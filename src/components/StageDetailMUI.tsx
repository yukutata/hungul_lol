import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Button,
  Container,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  Paper,
  Stack,
  useTheme
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon,
  PlayArrow as PlayIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { getLessonsByStage } from '../data/curriculum';
import { useLearningProgress } from '../contexts/LearningProgressContext';
import { LessonViewMUI } from './LessonViewMUI';
import { CurriculumStage, LessonModule } from '../types/learningSystem';

interface StageDetailProps {
  stage: CurriculumStage;
  onBack: () => void;
}

export const StageDetailMUI: React.FC<StageDetailProps> = ({ stage, onBack }) => {
  const theme = useTheme();
  const { progress } = useLearningProgress();
  const [selectedLesson, setSelectedLesson] = useState<LessonModule | null>(null);

  const lessons = getLessonsByStage(stage.id);

  if (selectedLesson) {
    return (
      <LessonViewMUI
        lesson={selectedLesson}
        onComplete={() => setSelectedLesson(null)}
      />
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={onBack}
        sx={{ mb: 3 }}
      >
        ダッシュボードに戻る
      </Button>

      {/* Stage Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" component="h2" gutterBottom>
            {stage.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {stage.description}
          </Typography>

          {stage.focusAreas.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                学習内容:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {stage.focusAreas.map((area, idx) => (
                  <Paper key={idx} sx={{ px: 2, py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {area.type === 'consonants' && '子音: '}
                      {area.type === 'vowels' && '母音: '}
                      {area.type === 'finals' && '終声: '}
                      {area.type === 'sound-changes' && '音韻変化: '}
                      <span style={{ color: theme.palette.text.secondary }}>
                        {area.characters.length > 0 && area.characters.join(', ')}
                        {area.rules && area.rules.join(', ')}
                      </span>
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Lessons List */}
      <Stack spacing={2}>
        {lessons.map((lesson, index) => {
          const isCompleted = progress.completedLessons.includes(lesson.id);
          const isLocked = index > 0 && !progress.completedLessons.includes(lessons[index - 1].id);

          return (
            <Card
              key={lesson.id}
              sx={{
                opacity: isLocked ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              <CardActionArea
                onClick={() => !isLocked && setSelectedLesson(lesson)}
                disabled={isLocked}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Lesson Number/Status */}
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: isCompleted
                          ? theme.palette.success.main
                          : isLocked
                            ? theme.palette.action.disabled
                            : theme.palette.primary.main
                      }}
                    >
                      {isCompleted ? (
                        <CheckIcon />
                      ) : isLocked ? (
                        <LockIcon />
                      ) : (
                        <Typography variant="h6">{index + 1}</Typography>
                      )}
                    </Avatar>

                    {/* Lesson Info */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="h6">
                          {lesson.title}
                        </Typography>
                        {isLocked && (
                          <LockIcon fontSize="small" color="disabled" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {lesson.description}
                      </Typography>

                      {/* Objectives */}
                      {lesson.objectives.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            学習目標:
                          </Typography>
                          <List dense sx={{ pl: 2 }}>
                            {lesson.objectives.map((objective, idx) => (
                              <ListItem key={idx} sx={{ py: 0 }}>
                                <ListItemText
                                  primary={
                                    <Typography variant="caption" color="text.secondary">
                                      • {objective}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Box>

                    {/* Action Area */}
                    <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <TimerIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {lesson.estimatedMinutes}分
                        </Typography>
                      </Box>
                      {isCompleted ? (
                        <Chip
                          label="完了済み"
                          color="success"
                          size="small"
                          icon={<CheckIcon />}
                        />
                      ) : !isLocked && (
                        <Button
                          variant="contained"
                          size="small"
                          endIcon={<PlayIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLesson(lesson);
                          }}
                        >
                          開始
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
};