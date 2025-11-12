import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Chip,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import hangulBasics from '../data/hangulBasics.json';
import koreanTTS from '../utils/koreanTTS';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hangul-tabpanel-${index}`}
      aria-labelledby={`hangul-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const HangulBasicsTable: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', paddingTop: '32px' }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        ハングル基礎表
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="hangul basics tabs" centered>
          <Tab label="子音 (Consonants)" />
          <Tab label="母音 (Vowels)" />
          <Tab label="変換ルール" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="consonants table">
            <TableHead>
              <TableRow>
                <TableCell><strong>ハングル</strong></TableCell>
                <TableCell><strong>ローマ字</strong></TableCell>
                <TableCell><strong>発音説明</strong></TableCell>
                <TableCell><strong>例</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hangulBasics.consonants.map((consonant) => (
                <TableRow key={consonant.hangul}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h5" component="span" sx={{ fontWeight: 'bold' }}>
                        {consonant.hangul}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => koreanTTS.speak(consonant.hangul)}
                        aria-label={`Speak ${consonant.hangul}`}
                      >
                        <VolumeUpIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={consonant.romanization} color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>{consonant.sound}</TableCell>
                  <TableCell>
                    {consonant.examples.map((example, index) => (
                      <Typography key={index} variant="body2" component="div">
                        {example}
                      </Typography>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="vowels table">
            <TableHead>
              <TableRow>
                <TableCell><strong>ハングル</strong></TableCell>
                <TableCell><strong>ローマ字</strong></TableCell>
                <TableCell><strong>発音</strong></TableCell>
                <TableCell><strong>例</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hangulBasics.vowels.map((vowel) => (
                <TableRow key={vowel.hangul}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h5" component="span" sx={{ fontWeight: 'bold' }}>
                        {vowel.hangul}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => koreanTTS.speak(vowel.hangul)}
                        aria-label={`Speak ${vowel.hangul}`}
                      >
                        <VolumeUpIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={vowel.romanization} color="secondary" variant="outlined" />
                  </TableCell>
                  <TableCell>{vowel.sound}</TableCell>
                  <TableCell>
                    {vowel.examples.map((example, index) => (
                      <Typography key={index} variant="body2" component="div">
                        {example}
                      </Typography>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
          {hangulBasics.transformationRules.map((rule, index) => (
            <Box key={index} sx={{ flex: '1 1 300px', minWidth: '300px', maxWidth: '500px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {rule.rule}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {rule.description}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      例:
                    </Typography>
                    {rule.examples.map((example, exampleIndex) => (
                      <Box key={exampleIndex} sx={(theme) => ({
                        mb: 1,
                        p: 1,
                        bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
                        borderRadius: 1
                      })}>
                        {/* 位置による変化の例 */}
                        {'initial' in example && (
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="body2">
                                <strong>{example.hangul}</strong>
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => koreanTTS.speak(example.hangul)}
                                aria-label={`Speak ${example.hangul}`}
                                sx={{ padding: '2px' }}
                              >
                                <VolumeUpIcon sx={{ fontSize: '16px' }} />
                              </IconButton>
                            </Box>
                            <Typography variant="body2">
                              語頭: {example.initial}
                            </Typography>
                            <Typography variant="body2">
                              語末: {example.final}
                            </Typography>
                          </Box>
                        )}

                        {/* ㄹ特殊ケースの例 */}
                        {'context' in example && (
                          <Typography variant="body2">
                            {example.context}: <strong>{example.sound}</strong> - {example.example}
                          </Typography>
                        )}

                        {/* 英語適応の例 */}
                        {'korean' in example && (
                          <Typography variant="body2">
                            {example.korean} → {example.english} ({example.example})
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>
    </Box>
  );
};

export default HangulBasicsTable;