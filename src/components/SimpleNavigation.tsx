import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GAMES, getGameConfig } from '../data/games';

type GameType = 'lol' | 'eternal-return';

const SimpleNavigation: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: { xs: 1, sm: 2 } }}>
          <SportsEsportsIcon sx={{ display: { xs: 'none', sm: 'block' }, mr: 1 }} />
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: { xs: '150px', sm: 'none' }
            }}
          >
            ハングル学習アプリ
          </Typography>

          {/* ゲーム選択ドロップダウン - デスクトップのみ */}
          {!isMobile && (
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
          )}

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

        {/* デスクトップメニュー */}
        {!isMobile ? (
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
        ) : (
          /* モバイルメニューボタン */
          <IconButton
            color="inherit"
            onClick={handleMobileMenuOpen}
            edge="end"
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* モバイルメニュー */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => { navigate('/'); handleMobileMenuClose(); }}>
            <HomeIcon sx={{ mr: 1 }} /> ホーム
          </MenuItem>
          <MenuItem onClick={() => { navigate('/hangul-basics'); handleMobileMenuClose(); }}>
            <SchoolIcon sx={{ mr: 1 }} /> ハングル基礎表
          </MenuItem>
          {GAMES.map((game) => (
            <MenuItem
              key={game.id}
              onClick={() => handleGameSelect(game.id)}
            >
              <SportsEsportsIcon sx={{ mr: 1 }} /> {game.name}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default SimpleNavigation;