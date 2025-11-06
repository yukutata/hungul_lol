import React from 'react';
import { Container, Typography, Box, Card, CardContent, CardActions, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GAMES } from '../data/games';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGameSelect = (gameId: string) => {
    navigate(`/${gameId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 300,
            letterSpacing: '-0.02em',
            mb: 2
          }}
        >
          ハングル学習アプリ
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            fontWeight: 400,
            opacity: 0.7,
            letterSpacing: '0.02em'
          }}
        >
          ゲームキャラクター名でハングルを学ぼう
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'center' }}>
        {GAMES.map((game) => (
          <Card
            key={game.id}
            sx={{
              flex: 1,
              maxWidth: 380,
              minHeight: 240,
              backgroundColor: 'background.paper',
              border: 'none',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              overflow: 'visible',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                '& .start-button': {
                  backgroundColor: game.themeColor,
                  color: 'white',
                }
              }
            }}
            onClick={() => handleGameSelect(game.id)}
          >
            <CardContent sx={{ p: 4, pb: 2 }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  mb: 1
                }}
              >
                {game.name}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mb: 0,
                  color: 'text.secondary',
                  lineHeight: 1.7
                }}
              >
                {game.description}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500
                }}
              >
                {game.iconCount} キャラクター
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 4, pb: 4, pt: 0 }}>
              <Button
                className="start-button"
                size="large"
                variant="text"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: '2px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: game.themeColor,
                  backgroundColor: 'transparent',
                  border: `2px solid ${game.themeColor}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    borderColor: game.themeColor,
                  }
                }}
              >
                学習を始める
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 4,
            fontWeight: 400
          }}
        >
          ハングルの基礎から学びたい方へ
        </Typography>
        <Button
          variant="text"
          size="large"
          onClick={() => navigate('/hangul-basics')}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: '2px',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            color: 'text.primary',
            border: '2px solid',
            borderColor: 'divider',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'transparent',
              borderColor: 'text.primary',
            }
          }}
        >
          ハングル基礎表を見る
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;