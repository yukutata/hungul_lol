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
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GAMES, getGameConfig } from '../data/games';

type GameType = 'lol' | 'eternal-return';

const SimpleNavigation: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // 現在のパスからゲームタイプを判定
  const getCurrentGame = (): GameType => {
    if (location.pathname.includes('eternal-return')) return 'eternal-return';
    return 'lol';
  };
  
  const currentGame = getCurrentGame();
  const gameConfig = getGameConfig(currentGame);
  
  const handleGameMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleGameMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleGameSelect = (gameId: string) => {
    navigate(`/${gameId}`);
    handleGameMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
          <SportsEsportsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
            ハングル学習アプリ
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
            component={Link}
            to="/"
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            startIcon={<HomeIcon />}
          >
            ホーム
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/hangul-basics"
            variant={location.pathname === '/hangul-basics' ? 'outlined' : 'text'}
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