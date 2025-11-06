import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import SimpleNavigation from './components/SimpleNavigation';
import ChampionList from './components/ChampionList';
import HangulBasicsTable from './components/HangulBasicsTable';
import { getGameConfig } from './data/games';

type PageType = 'champions' | 'hangul-basics';
type GameType = 'lol' | 'eternal-return';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('champions');
  const [currentGame, setCurrentGame] = useState<GameType>('lol');
  
  const gameConfig = getGameConfig(currentGame);
  
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: gameConfig?.themeColor || '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },
  });

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'hangul-basics':
        return <HangulBasicsTable />;
      default:
        return <ChampionList currentGame={currentGame} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <SimpleNavigation 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          currentGame={currentGame}
          onGameChange={setCurrentGame}
        />
        {renderCurrentPage()}
      </Box>
    </ThemeProvider>
  );
}

export default App;
