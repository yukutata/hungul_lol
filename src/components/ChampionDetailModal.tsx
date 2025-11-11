import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Character } from '../types/character';
import { analyzeChampionName, getTransformationExplanation } from '../utils/hangulAnalyzer';
import { generateLearningPoints } from '../utils/learningPoints';
import koreanTTS from '../utils/koreanTTS';

interface ChampionDetailModalProps {
  open: boolean;
  onClose: () => void;
  champion: Character | null;
}

const ChampionDetailModal: React.FC<ChampionDetailModalProps> = ({
  open,
  onClose,
  champion
}) => {
  if (!champion) return null;

  const analysis = analyzeChampionName(champion.nameKo, champion.nameEn);
  const explanations = getTransformationExplanation(champion.nameKo, champion.nameEn);
  const learningPoints = generateLearningPoints(analysis);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      sx={{
        '& .MuiDialog-paper': {
          maxWidth: '800px',
          width: '90%',
          margin: 'auto'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="h2">
            {champion.nameKo} - {champion.nameEn}
            {champion.nameJa && ` (${champion.nameJa})`}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ maxWidth: '1000px', mx: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, justifyContent: 'center' }}>
          {/* チャンピオン画像 */}
          <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '280px' }, maxWidth: { xs: '100%', md: '280px' } }}>
            <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
              <CardMedia
                component="img"
                image={champion.iconUrl}
                alt={champion.nameEn}
                sx={{
                  height: { xs: '300px', sm: '200px' },
                  width: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />
              <CardContent sx={{ textAlign: 'center', bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {champion.nameKo}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => koreanTTS.speak(champion.nameKo)}
                    aria-label={`Speak ${champion.nameKo}`}
                  >
                    <VolumeUpIcon />
                  </IconButton>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {champion.nameEn}
                </Typography>
                {champion.nameJa && (
                  <Typography variant="body1" color="text.secondary">
                    {champion.nameJa}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* 音韻分解分析 */}
          <Box sx={{ flex: '1 1 auto', minWidth: 0, maxWidth: { md: '600px' } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    音韻分解分析
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => {
                      const syllables = analysis.syllables.map(s => s.syllable);
                      koreanTTS.speakSyllables(syllables, 600);
                    }}
                  >
                    音節ごとに再生
                  </Button>
                </Box>

                {/* 変換プロセス */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    変換プロセス:
                  </Typography>
                  {explanations.map((explanation, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        backgroundColor: index === 0 ? 'primary.light' : 'grey.100',
                        color: index === 0 ? 'white' : 'text.primary',
                        p: 1,
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      {explanation}
                    </Typography>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* 音節別詳細分析 */}
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  音節別分析:
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableBody>
                      {analysis.syllables.map((syllable, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {syllable.syllable}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => koreanTTS.speak(syllable.syllable)}
                                aria-label={`Speak ${syllable.syllable}`}
                                sx={{ padding: '4px' }}
                              >
                                <VolumeUpIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              <Chip
                                label={syllable.components.consonant}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Typography variant="body2" sx={{ alignSelf: 'center' }}>+</Typography>
                              <Chip
                                label={syllable.components.vowel}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                              {syllable.components.finalConsonant && (
                                <>
                                  <Typography variant="body2" sx={{ alignSelf: 'center' }}>+</Typography>
                                  <Chip
                                    label={syllable.components.finalConsonant}
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                  />
                                </>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              → {syllable.romanization}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={syllable.position}
                              size="small"
                              color={
                                syllable.position === 'initial' ? 'success' :
                                syllable.position === 'final' ? 'warning' : 'default'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                    <strong>完全ローマ字化:</strong> {analysis.fullRomanization}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    <strong>英語名:</strong> {analysis.english}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* 学習ポイント */}
        <Box sx={{ mt: 3, maxWidth: '900px', mx: 'auto' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  学習ポイント
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {learningPoints.map((point, index) => (
                    <Box key={index} sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor:
                        point.type === 'consonant' ? 'primary.light' :
                        point.type === 'vowel' ? 'secondary.light' :
                        point.type === 'special' ? 'info.light' :
                        'grey.100'
                    }}>
                      <Typography variant="subtitle2" sx={{
                        color: point.type === 'pattern' ? 'text.primary' : 'white',
                        fontWeight: 'bold',
                        mb: 0.5
                      }}>
                        {point.title}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: point.type === 'pattern' ? 'text.secondary' : 'white'
                      }}>
                        {point.description}
                      </Typography>
                      {point.examples && point.examples.length > 0 && (
                        <Typography variant="caption" sx={{
                          display: 'block',
                          mt: 0.5,
                          fontFamily: 'monospace',
                          color: point.type === 'pattern' ? 'text.secondary' : 'white',
                          opacity: 0.9
                        }}>
                          例: {point.examples.join(', ')}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChampionDetailModal;