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
import eternalReturnData from '../data/eternal-return-characters.json';
import { Character } from '../types/character';
import { getGameConfig } from '../data/games';
import { normalizeKanaForSearch, containsKana } from '../utils/kanaConverter';

type GameType = 'lol' | 'eternal-return';

interface ChampionListProps {
  currentGame: GameType;
}

const ChampionList: React.FC<ChampionListProps> = ({ currentGame }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChampion, setSelectedChampion] = useState<Character | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const gameConfig = getGameConfig(currentGame);

  // ゲーム別データの読み込み
  const characters: Character[] = useMemo(() => {
    return currentGame === 'eternal-return'
      ? eternalReturnData
      : championsData.map(champion => ({
          ...champion,
          game: 'lol' as const
        }));
  }, [currentGame]);

  const filteredCharacters = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const normalizedSearchTerm = containsKana(searchTerm) ? normalizeKanaForSearch(searchTerm) : searchTerm;

    return characters.filter(character => {
      // 韓国語名での検索
      if (character.nameKo.includes(searchTerm)) return true;

      // 英語名での検索（大文字小文字を区別しない）
      if (character.nameEn.toLowerCase().includes(term)) return true;

      // 日本語名での検索（ひらがな・カタカナ両対応）
      if (character.nameJa) {
        if (containsKana(searchTerm)) {
          // 検索語がかなを含む場合、カタカナに正規化して比較
          const normalizedNameJa = normalizeKanaForSearch(character.nameJa);
          if (normalizedNameJa.includes(normalizedSearchTerm)) return true;

          // 読み方での検索もチェック
          if (character.nameJaReading) {
            const normalizedReading = normalizeKanaForSearch(character.nameJaReading);
            return normalizedReading.includes(normalizedSearchTerm);
          }
        } else {
          // 通常の部分一致
          if (character.nameJa.includes(searchTerm)) return true;

          // 読み方での検索もチェック
          if (character.nameJaReading && character.nameJaReading.includes(searchTerm)) {
            return true;
          }
        }
      }

      return false;
    });
  }, [searchTerm, characters]);

  const handleCharacterClick = (character: Character) => {
    setSelectedChampion(character);
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
          {gameConfig?.nameKo || 'LoL'}で学ぶハングル
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 3 }}>
          {gameConfig?.description || 'League of Legends チャンピオンの韓国語名を覚えよう'}
        </Typography>

        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={`${currentGame === 'lol' ? 'チャンピオン' : 'キャラクター'}名で検索 (日本語/English/한글)`}
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
        {filteredCharacters.length} {currentGame === 'lol' ? 'チャンピオン' : 'キャラクター'}（クリックで音韻分解を表示）🎮
      </Typography>

      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 2
      }}>
        {filteredCharacters.map((character) => (
          <ChampionCard
            key={character.id}
            champion={character}
            onClick={() => handleCharacterClick(character)}
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