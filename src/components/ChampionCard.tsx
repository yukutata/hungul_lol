import React from 'react';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import { Champion } from '../types/champion';

interface ChampionCardProps {
  champion: Champion;
  onClick?: () => void;
}

const ChampionCard: React.FC<ChampionCardProps> = ({ champion, onClick }) => {
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
        <Typography variant="h5" component="div" align="center" gutterBottom>
          {champion.nameKo}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {champion.nameEn}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ChampionCard;