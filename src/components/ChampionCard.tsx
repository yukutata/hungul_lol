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
      <img
        src={champion.iconUrl}
        alt={champion.nameEn}
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover'
        }}
        onError={(e) => {
          console.log('Image failed to load:', champion.iconUrl);
          e.currentTarget.style.backgroundColor = '#f0f0f0';
          e.currentTarget.style.display = 'flex';
          e.currentTarget.style.alignItems = 'center';
          e.currentTarget.style.justifyContent = 'center';
          e.currentTarget.innerHTML = `<div>${champion.nameEn}</div>`;
        }}
        onLoad={() => console.log('Image loaded successfully:', champion.iconUrl)}
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