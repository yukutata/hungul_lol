import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import SimpleNavigation from './components/SimpleNavigation';
import HomePage from './pages/HomePage';
import LoLPage from './pages/LoLPage';
import EternalReturnPage from './pages/EternalReturnPage';
import HangulBasicsPage from './pages/HangulBasicsPage';
import ApiExplorer from './pages/ApiExplorer';
import { CustomThemeProvider, useTheme } from './contexts/ThemeContext';
import { getTheme } from './utils/theme';

function ThemedApp() {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode ? 'dark' : 'light');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          color: 'text.primary',
          transition: 'background-color 0.3s ease'
        }}>
          <SimpleNavigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lol" element={<LoLPage />} />
            <Route path="/eternal-return" element={<EternalReturnPage />} />
            <Route path="/hangul-basics" element={<HangulBasicsPage />} />
            <Route path="/api-explorer" element={<ApiExplorer />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <CustomThemeProvider>
      <ThemedApp />
    </CustomThemeProvider>
  );
}

export default App;
