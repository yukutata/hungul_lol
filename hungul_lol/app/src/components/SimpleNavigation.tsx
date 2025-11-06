import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

type PageType = 'champions' | 'hangul-basics';

interface SimpleNavigationProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const SimpleNavigation: React.FC<SimpleNavigationProps> = ({ 
  currentPage, 
  onPageChange 
}) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <SportsEsportsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            LoLで学ぶハングル
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => onPageChange('champions')}
            variant={currentPage === 'champions' ? 'outlined' : 'text'}
            startIcon={<SportsEsportsIcon />}
          >
            チャンピオン一覧
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