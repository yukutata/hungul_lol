interface HangulComponent {
  consonant: string;
  vowel: string;
  finalConsonant?: string;
}

interface SyllableBreakdown {
  syllable: string;
  components: HangulComponent;
  romanization: string;
  position: 'initial' | 'medial' | 'final';
}

interface ChampionBreakdown {
  korean: string;
  english: string;
  syllables: SyllableBreakdown[];
  fullRomanization: string;
}

// ハングル分解用定数
const INITIAL_CONSONANTS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const VOWELS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

const FINAL_CONSONANTS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// 로마자 변환 맵
const CONSONANT_TO_ROMAN: { [key: string]: { initial: string; final: string } } = {
  'ㄱ': { initial: 'g', final: 'k' },
  'ㄲ': { initial: 'kk', final: 'k' },
  'ㄴ': { initial: 'n', final: 'n' },
  'ㄷ': { initial: 'd', final: 't' },
  'ㄸ': { initial: 'tt', final: 't' },
  'ㄹ': { initial: 'r', final: 'l' },
  'ㅁ': { initial: 'm', final: 'm' },
  'ㅂ': { initial: 'b', final: 'p' },
  'ㅃ': { initial: 'pp', final: 'p' },
  'ㅅ': { initial: 's', final: 't' },
  'ㅆ': { initial: 'ss', final: 't' },
  'ㅇ': { initial: '', final: 'ng' },
  'ㅈ': { initial: 'j', final: 't' },
  'ㅉ': { initial: 'jj', final: 't' },
  'ㅊ': { initial: 'ch', final: 't' },
  'ㅋ': { initial: 'k', final: 'k' },
  'ㅌ': { initial: 't', final: 't' },
  'ㅍ': { initial: 'p', final: 'p' },
  'ㅎ': { initial: 'h', final: 't' }
};

const VOWEL_TO_ROMAN: { [key: string]: string } = {
  'ㅏ': 'a',
  'ㅐ': 'ae',
  'ㅑ': 'ya',
  'ㅒ': 'yae',
  'ㅓ': 'eo',
  'ㅔ': 'e',
  'ㅕ': 'yeo',
  'ㅖ': 'ye',
  'ㅗ': 'o',
  'ㅘ': 'wa',
  'ㅙ': 'wae',
  'ㅚ': 'oe',
  'ㅛ': 'yo',
  'ㅜ': 'u',
  'ㅝ': 'wo',
  'ㅞ': 'we',
  'ㅟ': 'wi',
  'ㅠ': 'yu',
  'ㅡ': 'eu',
  'ㅢ': 'ui',
  'ㅣ': 'i'
};

// ハングル文字を音素に分解
export function decomposeSyllable(syllable: string): HangulComponent | null {
  const code = syllable.charCodeAt(0);
  
  // 한글 음절 범위 확인 (가-힣)
  if (code < 0xAC00 || code > 0xD7A3) {
    return null;
  }
  
  const syllableIndex = code - 0xAC00;
  const initialIndex = Math.floor(syllableIndex / (21 * 28));
  const vowelIndex = Math.floor((syllableIndex % (21 * 28)) / 28);
  const finalIndex = syllableIndex % 28;
  
  return {
    consonant: INITIAL_CONSONANTS[initialIndex],
    vowel: VOWELS[vowelIndex],
    finalConsonant: finalIndex > 0 ? FINAL_CONSONANTS[finalIndex] : undefined
  };
}

// 음소를 로마자로 변환
export function syllableToRomanization(syllable: string, position: 'initial' | 'medial' | 'final'): string {
  const components = decomposeSyllable(syllable);
  if (!components) return syllable;
  
  const { consonant, vowel, finalConsonant } = components;
  
  let result = '';
  
  // 초성
  if (consonant && CONSONANT_TO_ROMAN[consonant]) {
    result += CONSONANT_TO_ROMAN[consonant].initial;
  }
  
  // 중성
  if (vowel && VOWEL_TO_ROMAN[vowel]) {
    result += VOWEL_TO_ROMAN[vowel];
  }
  
  // 종성 (단어 끝이거나 다음 음절이 있을 때)
  if (finalConsonant && CONSONANT_TO_ROMAN[finalConsonant]) {
    if (position === 'final') {
      result += CONSONANT_TO_ROMAN[finalConsonant].final;
    }
  }
  
  return result;
}

// 챔피언 이름 전체 분석
export function analyzeChampionName(korean: string, english: string): ChampionBreakdown {
  const syllables: SyllableBreakdown[] = [];
  const koreanSyllables = korean.split('');
  
  koreanSyllables.forEach((syllable, index) => {
    const components = decomposeSyllable(syllable);
    if (!components) return;
    
    const position: 'initial' | 'medial' | 'final' = 
      index === 0 ? 'initial' : 
      index === koreanSyllables.length - 1 ? 'final' : 'medial';
    
    const romanization = syllableToRomanization(syllable, position);
    
    syllables.push({
      syllable,
      components,
      romanization,
      position
    });
  });
  
  const fullRomanization = syllables.map(s => s.romanization).join('');
  
  return {
    korean,
    english,
    syllables,
    fullRomanization
  };
}

// 로마자화에서 영어 이름으로의 변환 규칙 설명
export function getTransformationExplanation(korean: string, english: string): string[] {
  const analysis = analyzeChampionName(korean, english);
  const explanations: string[] = [];
  
  // 기본 음성학적 변환
  explanations.push(`${korean} → ${analysis.fullRomanization} → ${english}`);
  
  // 각 음절별 설명
  analysis.syllables.forEach((syllable) => {
    const { consonant, vowel, finalConsonant } = syllable.components;
    let explanation = `${syllable.syllable} = ${consonant}+${vowel}`;
    
    if (finalConsonant) {
      explanation += `+${finalConsonant}`;
    }
    
    explanation += ` → ${syllable.romanization}`;
    explanations.push(explanation);
  });
  
  return explanations;
}

export type { ChampionBreakdown, SyllableBreakdown, HangulComponent };