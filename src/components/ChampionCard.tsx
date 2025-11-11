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
        width: 200,
        height: '100%',
        m: 1,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
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
      <CardContent sx={{ position: 'relative', pt: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <IconButton
          onClick={handleSpeak}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'background.paper',
            boxShadow: 1,
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'white'
            },
            zIndex: 1
          }}
          size="small"
          aria-label={`Speak ${champion.nameKo}`}
        >
          <VolumeUpIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Box sx={{ px: 3, pt: 2 }}>
          <Typography
            variant="h6"
            component="div"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              minHeight: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              wordBreak: 'keep-all'
            }}
          >
            {champion.nameKo}
          </Typography>
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