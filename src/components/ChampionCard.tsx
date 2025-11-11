import React from 'react';
import { Card, CardContent, CardMedia, Typography, IconButton, Box } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Character } from '../types/character';
import koreanTTS from '../utils/koreanTTS';

interface ChampionCardProps {
  champion: Character;
  onClick?: () => void;
}

const ChampionCard: React.FC<ChampionCardProps> = ({ champion, onClick }) => {
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    koreanTTS.speak(champion.nameKo);
  };
  return (
    <Card
      sx={{
        maxWidth: 200,
        m: 1,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
      onClick={onClick}
    >
      <CardMedia
        component="img"
        height="200"
        image={champion.iconUrl}
        alt={champion.nameEn}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent>
        <Box sx={{ position: 'relative' }}>
          <Typography variant="h5" component="div" align="center" gutterBottom>
            {champion.nameKo}
          </Typography>
          <IconButton
            onClick={handleSpeak}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              backgroundColor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white'
              }
            }}
            size="small"
            aria-label={`Speak ${champion.nameKo}`}
          >
            <VolumeUpIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" align="center">
          {champion.nameEn}
        </Typography>
        {champion.nameJa && (
          <Typography variant="body2" color="text.secondary" align="center">
            {champion.nameJa}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ChampionCard;