import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  LinearProgress,
  Alert,
  Fade,
  Stack,
  useTheme,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import championsData from '../data/champions.json';
import eternalReturnData from '../data/eternal-return-characters.json';
import { shuffleArray } from '../utils/practiceGenerator';

interface Character {
  id: string;
  name: string;
  korean: string;
  romanization: string;
}

// Combine characters from both games
const allCharacters: Character[] = [
  ...championsData.map(champ => ({
    id: champ.id,
    name: champ.nameEn,
    korean: champ.nameKo,
    romanization: champ.nameJa
  })),
  ...eternalReturnData.map(char => ({
    id: char.id,
    name: char.nameEn,
    korean: char.nameKo,
    romanization: char.nameJa
  }))
];

export const InfinitePracticePage: React.FC = () => {
  const theme = useTheme();
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer effect
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate new question
  const generateNewQuestion = () => {
    // Start timer on first question
    if (!startTime && totalAnswered === 0) {
      setStartTime(new Date());
    }

    // Select random character
    const randomChar = allCharacters[Math.floor(Math.random() * allCharacters.length)];

    // Generate wrong answers
    const wrongAnswers = shuffleArray(
      allCharacters.filter(c => c.id !== randomChar.id)
    ).slice(0, 3).map(c => c.romanization);

    // Create options and shuffle
    const allOptions = shuffleArray([randomChar.romanization, ...wrongAnswers]);

    setCurrentCharacter(randomChar);
    setOptions(allOptions);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  // Handle answer selection
  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return; // Already answered

    setSelectedAnswer(answer);
    const correct = answer === currentCharacter?.romanization;
    setIsCorrect(correct);
    setTotalAnswered(prev => prev + 1);

    if (correct) {
      setScore(prev => prev + 1);
      setCurrentStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        return newStreak;
      });
    } else {
      setCurrentStreak(0);
    }
  };

  // Initialize first question
  useEffect(() => {
    generateNewQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate accuracy
  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Stats Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon color="success" />
              <Box>
                <Typography variant="h6">{score}/{totalAnswered}</Typography>
                <Typography variant="caption" color="text.secondary">正解数</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" />
              <Box>
                <Typography variant="h6">{accuracy}%</Typography>
                <Typography variant="caption" color="text.secondary">正答率</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrophyIcon sx={{ color: theme.palette.warning.main }} />
              <Box>
                <Typography variant="h6">{currentStreak}</Typography>
                <Typography variant="caption" color="text.secondary">
                  連続正解 (最高: {bestStreak})
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon color="action" />
              <Box>
                <Typography variant="h6">{formatTime(elapsedTime)}</Typography>
                <Typography variant="caption" color="text.secondary">経過時間</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Progress Bar */}
        {currentStreak > 0 && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min((currentStreak / 10) * 100, 100)}
              sx={{
                height: 8,
                borderRadius: 1,
                backgroundColor: theme.palette.grey[300],
                '& .MuiLinearProgress-bar': {
                  backgroundColor: currentStreak >= 10 ? theme.palette.warning.main : theme.palette.primary.main
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {currentStreak >= 10 ? '素晴らしい連続正解！' : `10連続正解まであと${10 - currentStreak}問`}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Main Question Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom textAlign="center">
            次の韓国語の読み方は？
          </Typography>

          {currentCharacter && (
            <Fade in={true} timeout={300}>
              <Box>
                <Typography
                  variant="h1"
                  sx={{
                    textAlign: 'center',
                    my: 4,
                    fontWeight: 'bold',
                    color: theme.palette.primary.main,
                    fontSize: { xs: '3rem', sm: '4rem', md: '5rem' }
                  }}
                >
                  {currentCharacter.korean}
                </Typography>

                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <RadioGroup
                    value={selectedAnswer}
                    onChange={(e) => selectedAnswer === null && handleAnswer(e.target.value)}
                  >
                    <Grid container spacing={2} justifyContent="center">
                      {options.map((option, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Paper
                            sx={{
                              p: 2,
                              cursor: selectedAnswer !== null ? 'default' : 'pointer',
                              bgcolor:
                                selectedAnswer === option
                                  ? isCorrect
                                    ? theme.palette.success.light
                                    : theme.palette.error.light
                                  : selectedAnswer && option === currentCharacter.romanization
                                    ? theme.palette.success.light
                                    : undefined,
                              borderColor:
                                selectedAnswer === option
                                  ? isCorrect
                                    ? theme.palette.success.main
                                    : theme.palette.error.main
                                  : selectedAnswer && option === currentCharacter.romanization
                                    ? theme.palette.success.main
                                    : undefined,
                              borderWidth: selectedAnswer === option || (selectedAnswer && option === currentCharacter.romanization) ? 2 : 1,
                              borderStyle: 'solid',
                              '&:hover': {
                                bgcolor: selectedAnswer === null ? 'action.hover' : undefined
                              }
                            }}
                          >
                            <FormControlLabel
                              value={option}
                              control={<Radio />}
                              label={option}
                              disabled={selectedAnswer !== null}
                              sx={{ width: '100%', m: 0 }}
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </RadioGroup>
                </FormControl>

                {selectedAnswer && (
                  <Fade in={true} timeout={300}>
                    <Alert
                      severity={isCorrect ? 'success' : 'error'}
                      icon={isCorrect ? <CheckIcon /> : <CancelIcon />}
                      sx={{ mt: 3 }}
                    >
                      <Typography variant="h6">
                        {isCorrect ? '正解！' : '不正解...'}
                      </Typography>
                      {!isCorrect && (
                        <Typography variant="body2">
                          正解は「{currentCharacter.romanization}」（{currentCharacter.name}）でした
                        </Typography>
                      )}
                      {isCorrect && (
                        <Typography variant="body2">
                          {currentCharacter.name}
                        </Typography>
                      )}
                    </Alert>
                  </Fade>
                )}
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <Box sx={{ textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setScore(0);
              setTotalAnswered(0);
              setCurrentStreak(0);
              setBestStreak(0);
              setStartTime(new Date());
              setElapsedTime(0);
              generateNewQuestion();
            }}
          >
            リセット
          </Button>
          <Button
            variant="contained"
            onClick={generateNewQuestion}
            disabled={selectedAnswer === null}
            color="primary"
          >
            次の問題
          </Button>
        </Stack>

      </Box>
    </Container>
  );
};