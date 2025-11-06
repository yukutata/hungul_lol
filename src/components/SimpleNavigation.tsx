import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { GAMES, getGameConfig } from '../data/games';

type PageType = 'champions' | 'hangul-basics';
type GameType = 'lol' | 'eternal-return';

interface SimpleNavigationProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  currentGame: GameType;
  onGameChange: (game: GameType) => void;
}

const SimpleNavigation: React.FC<SimpleNavigationProps> = ({ 
  currentPage, 
  onPageChange,
  currentGame,
  onGameChange
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const gameConfig = getGameConfig(currentGame);
  
  const handleGameMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleGameMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleGameSelect = (game: GameType) => {
    onGameChange(game);
    handleGameMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
          <SportsEsportsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            {gameConfig?.nameKo || 'LoL'}で学ぶハングル
          </Typography>
          
          {/* ゲーム選択ドロップダウン */}
          <Chip
            label={gameConfig?.name || 'League of Legends'}
            onClick={handleGameMenuOpen}
            onDelete={handleGameMenuOpen}
            deleteIcon={<KeyboardArrowDownIcon />}
            variant="outlined"
            sx={{ 
              color: 'white',
              borderColor: 'white',
              '& .MuiChip-deleteIcon': { color: 'white' }
            }}
          />
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleGameMenuClose}
          >
            {GAMES.map((game) => (
              <MenuItem
                key={game.id}
                onClick={() => handleGameSelect(game.id)}
                selected={currentGame === game.id}
              >
                <Box>
                  <Typography variant="body1">{game.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {game.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => onPageChange('champions')}
            variant={currentPage === 'champions' ? 'outlined' : 'text'}
            startIcon={<SportsEsportsIcon />}
          >
            キャラクター一覧
          </Button>
          <Button
            color="inherit"
            onClick={() => onPageChange('hangul-basics')}
            variant={currentPage === 'hangul-basics' ? 'outlined' : 'text'}
            startIcon={<SchoolIcon />}
          >
            ハングル基礎表
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default SimpleNavigation;