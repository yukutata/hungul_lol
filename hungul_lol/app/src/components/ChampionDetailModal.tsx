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
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Champion } from '../types/champion';
import { analyzeChampionName, getTransformationExplanation } from '../utils/hangulAnalyzer';

interface ChampionDetailModalProps {
  open: boolean;
  onClose: () => void;
  champion: Champion | null;
}

const ChampionDetailModal: React.FC<ChampionDetailModalProps> = ({
  open,
  onClose,
  champion
}) => {
  if (!champion) return null;

  const analysis = analyzeChampionName(champion.nameKo, champion.nameEn);
  const explanations = getTransformationExplanation(champion.nameKo, champion.nameEn);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="h2">
            {champion.nameKo} - {champion.nameEn}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* チャンピオン画像 */}
          <Box sx={{ flex: '0 0 300px' }}>
            <Card>
              <Box
                component="img"
                src={champion.iconUrl}
                alt={champion.nameEn}
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover'
                }}
              />
              <CardContent>
                <Typography variant="h6" align="center">
                  {champion.nameKo}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {champion.nameEn}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* 音韻分解分析 */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  音韻分解分析
                </Typography>
                
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
                <Typography variant="subtitle1" gutterBottom>
                  音節別分析:
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      {analysis.syllables.map((syllable, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {syllable.syllable}
                            </Typography>
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

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>完全ローマ字化:</strong> {analysis.fullRomanization}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>英語名:</strong> {analysis.english}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* 学習ポイント */}
        <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  学習ポイント
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      子音の位置による音変化:
                    </Typography>
                    <Typography variant="body2">
                      ㄱ は語頭で「g」、語末で「k」になります（例: 가렌の「가」は語頭なので「ga」）
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="secondary">
                      母音の英語音写:
                    </Typography>
                    <Typography variant="body2">
                      ㅓ は「eo」と表記されますが、英語では「e」になることが多いです
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="info.main">
                      ㄹ の特殊性:
                    </Typography>
                    <Typography variant="body2">
                      ㄹ は語頭で「r」、語末で「l」、語中で「r」の音になります
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChampionDetailModal;