import React, { useState, useMemo } from 'react';
import { 
  Container, 
  TextField, 
  Box, 
  Typography,
  Grid,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChampionCard from './ChampionCard';
import championsData from '../data/champions.json';
import { Champion } from '../types/champion';

const ChampionList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const champions: Champion[] = championsData;

  const filteredChampions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return champions.filter(champion => 
      champion.nameKo.includes(searchTerm) || 
      champion.nameEn.toLowerCase().includes(term)
    );
  }, [searchTerm, champions]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          LoLで学ぶハングル語
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 3 }}>
          League of Legends チャンピオンの韓国語名を覚えよう
        </Typography>
        
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="チャンピオン名で検索 (日本語/English/한글)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
        {filteredChampions.length} チャンピオン
      </Typography>

      <Grid container justifyContent="center">
        {filteredChampions.map((champion) => (
          <Grid item key={champion.id}>
            <ChampionCard champion={champion} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ChampionList;