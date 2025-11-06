import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import SimpleNavigation from './components/SimpleNavigation';
import HomePage from './pages/HomePage';
import LoLPage from './pages/LoLPage';
import EternalReturnPage from './pages/EternalReturnPage';
import HangulBasicsPage from './pages/HangulBasicsPage';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
          <SimpleNavigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lol" element={<LoLPage />} />
            <Route path="/eternal-return" element={<EternalReturnPage />} />
            <Route path="/hangul-basics" element={<HangulBasicsPage />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
