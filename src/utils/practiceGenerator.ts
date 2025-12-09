import { PracticeItem, FocusArea, LearningLevel } from '../types/learningSystem';
import championsData from '../data/champions.json';
import eternalReturnData from '../data/eternal-return-characters.json';
import { decomposeSyllable } from './hangulAnalyzer';

interface Character {
  id: string;
  name: string;
  korean: string;
  romaja: string;
}

// Combine both games' characters
const allCharacters: Character[] = [
  ...championsData.map(champ => ({
    id: champ.id,
    name: champ.nameEn,
    korean: champ.nameKo,
    romaja: champ.nameJa
  })),
  ...eternalReturnData.map(char => ({
    id: char.id,
    name: char.nameEn,
    korean: char.nameKo,
    romaja: char.nameJa
  }))
];

function getCharactersByFocusArea(focusArea: FocusArea): Character[] {
  return allCharacters.filter(char => {
    const syllables = char.korean.split('');
    const consonants: string[] = [];
    const vowels: string[] = [];
    const finals: string[] = [];

    syllables.forEach(syllable => {
      const components = decomposeSyllable(syllable);
      if (components) {
        consonants.push(components.consonant);
        vowels.push(components.vowel);
        if (components.finalConsonant) {
          finals.push(components.finalConsonant);
        }
      }
    });

    if (focusArea.type === 'consonants' && focusArea.characters.length > 0) {
      return consonants.some(c => focusArea.characters.includes(c));
    }

    if (focusArea.type === 'vowels' && focusArea.characters.length > 0) {
      return vowels.some(v => focusArea.characters.includes(v));
    }

    if (focusArea.type === 'finals' && focusArea.characters.length > 0) {
      return finals.some(f => focusArea.characters.includes(f));
    }

    if (focusArea.type === 'practice') {
      return true; // All characters for practice
    }

    return true;
  });
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generatePracticeItems(
  focusAreas: FocusArea[],
  level: LearningLevel,
  count: number = 10
): PracticeItem[] {
  const practiceItems: PracticeItem[] = [];

  // Get relevant characters based on focus areas
  const relevantCharacters = focusAreas.flatMap(area => getCharactersByFocusArea(area));
  const uniqueCharacters = Array.from(
    new Map(relevantCharacters.map(char => [char.id, char])).values()
  );

  if (uniqueCharacters.length === 0) {
    return [];
  }

  // Generate different types of practice items based on level
  const itemTypes: Array<'recognition' | 'pronunciation' | 'writing' | 'listening'> =
    level === 'beginner' ? ['recognition'] :
    level === 'intermediate' ? ['recognition', 'pronunciation'] :
    level === 'advanced' ? ['recognition', 'pronunciation', 'writing'] :
    ['recognition', 'pronunciation', 'writing', 'listening'];

  // Create a list of characters repeated to ensure each character appears multiple times
  const characterPool: Character[] = [];
  const timesPerCharacter = Math.ceil(count / uniqueCharacters.length);

  for (let i = 0; i < timesPerCharacter; i++) {
    characterPool.push(...uniqueCharacters);
  }

  // Shuffle the pool to ensure randomness
  const shuffledPool = shuffleArray(characterPool).slice(0, count);

  for (let i = 0; i < count; i++) {
    const character = shuffledPool[i];
    const itemType = itemTypes[i % itemTypes.length];

    let item: PracticeItem;

    switch (itemType) {
      case 'recognition': {
        // Create multiple choice question
        const wrongAnswers = shuffleArray(
          uniqueCharacters.filter(c => c.id !== character.id)
        ).slice(0, 3).map(c => c.romaja);

        const options = shuffleArray([character.romaja, ...wrongAnswers]);

        item = {
          id: `practice-${i}`,
          type: 'recognition',
          question: `次の韓国語の読み方は？`,
          characterName: character.korean,
          options,
          correctAnswer: character.romaja,
          explanation: `「${character.korean}」は「${character.romaja}」（${character.name}）と読みます。`,
          difficulty: level === 'beginner' ? 1 : level === 'intermediate' ? 2 : 3
        };
        break;
      }

      case 'pronunciation': {
        item = {
          id: `practice-${i}`,
          type: 'pronunciation',
          question: `次のキャラクター名を発音してください`,
          characterName: character.korean,
          correctAnswer: character.romaja,
          explanation: `正しい発音は「${character.romaja}」です。`,
          difficulty: level === 'intermediate' ? 2 : 3
        };
        break;
      }

      case 'writing': {
        item = {
          id: `practice-${i}`,
          type: 'writing',
          question: `「${character.name}」を韓国語で書いてください`,
          characterName: character.korean,
          correctAnswer: character.korean,
          explanation: `「${character.name}」は韓国語で「${character.korean}」と書きます。`,
          difficulty: 3
        };
        break;
      }

      case 'listening': {
        item = {
          id: `practice-${i}`,
          type: 'listening',
          question: `聞こえた音声のキャラクター名を選んでください`,
          characterName: character.korean,
          options: shuffleArray([character.korean, ...uniqueCharacters.filter(c => c.id !== character.id).slice(0, 3).map(c => c.korean)]),
          correctAnswer: character.korean,
          explanation: `音声は「${character.korean}」（${character.romaja} - ${character.name}）でした。`,
          difficulty: 4
        };
        break;
      }
    }

    practiceItems.push(item);
  }

  return shuffleArray(practiceItems);
}

// Add practice items to existing lesson modules
export function addPracticeItemsToLesson(
  lessonId: string,
  focusAreas: FocusArea[],
  level: LearningLevel
): PracticeItem[] {
  const practiceCount = level === 'beginner' ? 5 :
                       level === 'intermediate' ? 8 :
                       level === 'advanced' ? 10 : 12;

  return generatePracticeItems(focusAreas, level, practiceCount);
}