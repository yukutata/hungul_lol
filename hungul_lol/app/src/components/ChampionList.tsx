import React, { useState, useMemo } from 'react';
import { 
  Container, 
  TextField, 
  Box, 
  Typography,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChampionCard from './ChampionCard';
import ChampionDetailModal from './ChampionDetailModal';
import championsData from '../data/champions.json';
import { Champion } from '../types/champion';

const ChampionList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const champions: Champion[] = championsData;

  const filteredChampions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return champions.filter(champion => 
      champion.nameKo.includes(searchTerm) || 
      champion.nameEn.toLowerCase().includes(term)
    );
  }, [searchTerm, champions]);

  const handleChampionClick = (champion: Champion) => {
    setSelectedChampion(champion);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedChampion(null);
  };

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
        {filteredChampions.length} チャンピオン（クリックで音韻分解を表示）🎮
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        gap: 2
      }}>
        {filteredChampions.map((champion) => (
          <ChampionCard 
            key={champion.id}
            champion={champion} 
            onClick={() => handleChampionClick(champion)}
          />
        ))}
      </Box>

      <ChampionDetailModal
        open={modalOpen}
        onClose={handleModalClose}
        champion={selectedChampion}
      />
    </Container>
  );
};

export default ChampionList;