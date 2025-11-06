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
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          ハングル学習アプリ
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          ゲームキャラクター名でハングルを学ぼう
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {GAMES.map((game) => (
          <Card key={game.id} sx={{ flex: 1, minHeight: 200 }}>
            <CardContent>
              <Typography variant="h4" component="h2" gutterBottom>
                {game.name}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {game.nameKo}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {game.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {game.iconCount} キャラクター
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="large" 
                variant="contained" 
                fullWidth
                onClick={() => handleGameSelect(game.id)}
                sx={{ backgroundColor: game.themeColor }}
              >
                学習開始
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Button 
          variant="outlined" 
          size="large"
          onClick={() => navigate('/hangul-basics')}
        >
          ハングル基礎表を見る
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;