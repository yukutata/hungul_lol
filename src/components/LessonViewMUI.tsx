import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Paper,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Alert,
  Chip,
  IconButton,
  Container,
  Stack,
  useTheme
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { LessonModule } from '../types/learningSystem';
import { useLearningProgress } from '../contexts/LearningProgressContext';
import koreanTTS from '../utils/koreanTTS';

interface LessonViewProps {
  lesson: LessonModule;
  onComplete: () => void;
}

interface Mistake {
  characterName: string;
  userAnswer: string;
  correctAnswer: string;
  mistakeType: string;
  timestamp: string;
}

export const LessonViewMUI: React.FC<LessonViewProps> = ({ lesson, onComplete }) => {
  const theme = useTheme();
  const { startSession, endSession, completeLesson, addMistake } = useLearningProgress();
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [showPractice, setShowPractice] = useState(false);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [score, setScore] = useState(0);
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
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            {/* Lesson Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                {lesson.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {lesson.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`ステージ ${lesson.stage}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`推定時間: ${lesson.estimatedMinutes}分`}
                  color="success"
                  variant="outlined"
                />
              </Box>
            </Box>

            {/* Progress */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  進捗
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentContentIndex + 1} / {lesson.content.length}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((currentContentIndex + 1) / lesson.content.length) * 100}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>

            {/* Content */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="h5">
                  {currentContent.title}
                </Typography>
                {currentContent.audioText && (
                  <IconButton
                    onClick={() => playAudio(currentContent.audioText!)}
                    color="primary"
                    sx={{
                      bgcolor: theme.palette.primary.light,
                      '&:hover': {
                        bgcolor: theme.palette.primary.main,
                        color: 'white'
                      }
                    }}
                  >
                    <VolumeUpIcon />
                  </IconButton>
                )}
              </Box>
              <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                {currentContent.content}
              </Typography>

              {currentContent.examples && currentContent.examples.length > 0 && (
                <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    例:
                  </Typography>
                  <Stack spacing={2}>
                    {currentContent.examples.map((example, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          borderRadius: 1,
                          bgcolor: 'background.paper',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 'bold',
                              color: theme.palette.primary.main
                            }}
                          >
                            {example.korean}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {example.romanization}
                          </Typography>
                          {example.meaning && (
                            <Typography variant="body2" color="text.secondary">
                              ({example.meaning})
                            </Typography>
                          )}
                        </Box>
                        <IconButton
                          onClick={() => playAudio(example.korean)}
                          color="primary"
                          size="large"
                        >
                          <VolumeUpIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Box>

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<PrevIcon />}
                onClick={handlePrevContent}
                disabled={currentContentIndex === 0}
              >
                前へ
              </Button>
              <Button
                variant="contained"
                endIcon={<NextIcon />}
                onClick={handleNextContent}
              >
                {currentContentIndex === lesson.content.length - 1 ? '練習へ' : '次へ'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Practice mode
  if (lesson.practiceItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CheckIcon sx={{ fontSize: 80, color: theme.palette.success.main, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              レッスン完了！
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              このレッスンの練習問題はまだ準備中です。
            </Typography>
            <Button
              variant="contained"
              onClick={onComplete}
              size="large"
            >
              ダッシュボードに戻る
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const currentPractice = lesson.practiceItems[currentPracticeIndex];

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Practice Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              練習問題
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="body1" color="text.secondary">
                問題 {currentPracticeIndex + 1} / {lesson.practiceItems.length}
              </Typography>
              <Chip
                label={`スコア: ${Math.round(score)}点`}
                color="primary"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Box>

          {/* Practice Content */}
          <Box sx={{ mb: 4, minHeight: 300 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              {currentPractice.question}
            </Typography>

            {currentPractice.type === 'recognition' && currentPractice.options && (
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    mb: 4,
                    color: theme.palette.primary.main
                  }}
                >
                  {currentPractice.characterName}
                </Typography>
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <RadioGroup
                    value={userAnswer}
                    onChange={(e) => !showFeedback && handlePracticeAnswer(e.target.value)}
                  >
                    <Grid container spacing={2}>
                      {currentPractice.options.map((option, idx) => (
                        <Grid item xs={12} sm={6} key={idx}>
                          <Paper
                            sx={{
                              p: 2,
                              cursor: showFeedback ? 'default' : 'pointer',
                              '&:hover': {
                                bgcolor: showFeedback ? undefined : 'action.hover'
                              }
                            }}
                          >
                            <FormControlLabel
                              value={option}
                              control={<Radio />}
                              label={option}
                              disabled={showFeedback}
                              sx={{ width: '100%', m: 0 }}
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </RadioGroup>
                </FormControl>
              </Box>
            )}

            {currentPractice.type === 'pronunciation' && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 'bold',
                    mb: 3,
                    color: theme.palette.primary.main
                  }}
                >
                  {currentPractice.characterName}
                </Typography>
                <IconButton
                  onClick={() => playAudio(currentPractice.characterName)}
                  color="primary"
                  sx={{
                    mb: 3,
                    bgcolor: theme.palette.primary.light,
                    '&:hover': {
                      bgcolor: theme.palette.primary.main,
                      color: 'white'
                    }
                  }}
                  size="large"
                >
                  <VolumeUpIcon sx={{ fontSize: 40 }} />
                </IconButton>
                <TextField
                  fullWidth
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && userAnswer && !showFeedback) {
                      handlePracticeAnswer(userAnswer);
                    }
                  }}
                  placeholder="ローマ字で入力"
                  disabled={showFeedback}
                  variant="outlined"
                  sx={{ maxWidth: 400, mx: 'auto' }}
                />
              </Box>
            )}

            {showFeedback && (
              <Alert
                severity={isCorrect ? 'success' : 'error'}
                sx={{ mt: 3 }}
                icon={isCorrect ? <CheckIcon /> : <CancelIcon />}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {isCorrect ? '正解！' : '不正解'}
                </Typography>
                {!isCorrect && currentPractice.explanation && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {currentPractice.explanation}
                  </Typography>
                )}
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};