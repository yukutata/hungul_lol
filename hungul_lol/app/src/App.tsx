import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import SimpleNavigation from './components/SimpleNavigation';
import ChampionList from './components/ChampionList';
import HangulBasicsTable from './components/HangulBasicsTable';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
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

type PageType = 'champions' | 'hangul-basics';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('champions');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'hangul-basics':
        return <HangulBasicsTable />;
      default:
        return <ChampionList />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <SimpleNavigation 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        {renderCurrentPage()}
      </Box>
    </ThemeProvider>
  );
}

export default App;
