import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  Paper,
  useTheme,
  Container,
  Stack,
  CardActionArea
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  Lock as LockIcon
} from '@mui/icons-material';
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

export const LearningDashboardMUI: React.FC<LearningDashboardProps> = ({ onStageSelect }) => {
  const { progress, preferences, updateStreak } = useLearningProgress();
  const theme = useTheme();

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
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h2" gutterBottom>
                学習ダッシュボード
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1" color="text.secondary">
                  現在のレベル：
                </Typography>
                <Chip
                  label={levelNames[progress.currentLevel]}
                  sx={{
                    backgroundColor: levelColors[progress.currentLevel],
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FireIcon sx={{ color: theme.palette.warning.main, fontSize: 40 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.warning.main }}>
                  {progress.streakDays}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                連続学習日数
              </Typography>
            </Box>
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary">
                  完了レッスン
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {progress.completedLessons.length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary">
                  総スコア
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {progress.totalScore}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary">
                  獲得バッジ
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {progress.achievements.length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary">
                  学習ペース
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {preferences.studyPace === 'slow' ? 'ゆっくり' :
                   preferences.studyPace === 'normal' ? '普通' : '速い'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Curriculum Section */}
      <Card>
        <CardContent>
          <Typography variant="h5" component="h3" gutterBottom sx={{ mb: 3 }}>
            学習カリキュラム
          </Typography>

          <Stack spacing={2}>
            {koreanCurriculum.stages.map((stage, index) => {
              const isUnlocked = isStageUnlocked(stage.id);
              const completionPercentage = getCompletionPercentage(stage.id);

              return (
                <Card
                  key={stage.id}
                  variant="outlined"
                  sx={{
                    opacity: isUnlocked ? 1 : 0.6,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardActionArea
                    onClick={() => isUnlocked && onStageSelect?.(stage.id)}
                    disabled={!isUnlocked}
                    sx={{ p: 2 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: isUnlocked ? theme.palette.primary.main : theme.palette.action.disabled
                        }}
                      >
                        {isUnlocked ? (
                          <Typography variant="h6">{index + 1}</Typography>
                        ) : (
                          <LockIcon />
                        )}
                      </Avatar>

                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6">
                            {stage.name}
                          </Typography>
                          <Chip
                            label={levelNames[stage.level]}
                            size="small"
                            sx={{
                              backgroundColor: levelColors[stage.level],
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          />
                          <Chip
                            label={`${stage.modules.length}レッスン`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {stage.description}
                        </Typography>

                        {stage.focusAreas.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {stage.focusAreas.map((area, idx) => (
                              <Chip
                                key={idx}
                                label={
                                  area.type === 'consonants' ? '子音' :
                                  area.type === 'vowels' ? '母音' :
                                  area.type === 'finals' ? '終声' :
                                  area.type === 'sound-changes' ? '音韻変化' :
                                  '実践'
                                }
                                size="small"
                                sx={{
                                  bgcolor: theme.palette.action.selected,
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ minWidth: 120, textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {Math.round(completionPercentage)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={completionPercentage}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>
                    </Box>
                  </CardActionArea>
                </Card>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      {/* Mistake Patterns Section */}
      {progress.mistakePatterns.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" component="h3" gutterBottom sx={{ mb: 3 }}>
              苦手分野
            </Typography>
            <Grid container spacing={2}>
              {progress.mistakePatterns
                .sort((a, b) => b.count - a.count)
                .slice(0, 6)
                .map((pattern, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: theme.palette.error.light,
                        color: theme.palette.error.contrastText
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {pattern.characterName}
                      </Typography>
                      <Typography variant="body2">
                        {pattern.mistakeType === 'consonant' && '子音'}
                        {pattern.mistakeType === 'vowel' && '母音'}
                        {pattern.mistakeType === 'final' && '終声'}
                        {pattern.mistakeType === 'tone' && '音調'}
                        の間違い
                      </Typography>
                      <Typography variant="caption">
                        {pattern.count}回
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Achievements Section */}
      {progress.achievements.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" component="h3" gutterBottom sx={{ mb: 3 }}>
              獲得バッジ
            </Typography>
            <Grid container spacing={2}>
              {progress.achievements.map((achievement) => (
                <Grid item xs={6} sm={4} md={3} key={achievement.id}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor: theme.palette.warning.light,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TrophyIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {achievement.name}
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 0.5 }}>
                      {achievement.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};