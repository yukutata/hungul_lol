import { HangulAnalysis } from './hangulAnalyzer';

export interface LearningPoint {
  type: 'consonant' | 'vowel' | 'special' | 'pattern';
  title: string;
  description: string;
  examples?: string[];
}

export function generateLearningPoints(analysis: HangulAnalysis): LearningPoint[] {
  const points: LearningPoint[] = [];

  // 子音の音変化を分析
  for (const syllable of analysis.syllables) {
    const consonant = syllable.components.consonant;
    const position = syllable.position;

    // ㄱ の変化
    if (consonant === 'ㄱ') {
      if (position === 'initial' && syllable.romanization.startsWith('g')) {
        points.push({
          type: 'consonant',
          title: 'ㄱ の語頭での発音',
          description: `「${syllable.syllable}」のㄱは語頭で「g」と発音されます`,
          examples: [`${syllable.syllable} → ${syllable.romanization}`]
        });
      } else if (position === 'final' && syllable.romanization.includes('k')) {
        points.push({
          type: 'consonant',
          title: 'ㄱ の語末での発音',
          description: `語末のㄱは「k」と発音されます`,
          examples: [`${syllable.syllable} → ${syllable.romanization}`]
        });
      }
    }

    // ㄷ の変化
    if (consonant === 'ㄷ') {
      if (position === 'initial' && syllable.romanization.startsWith('d')) {
        points.push({
          type: 'consonant',
          title: 'ㄷ の語頭での発音',
          description: `「${syllable.syllable}」のㄷは語頭で「d」と発音されます`,
          examples: [`${syllable.syllable} → ${syllable.romanization}`]
        });
      } else if (syllable.romanization.includes('t')) {
        points.push({
          type: 'consonant',
          title: 'ㄷ の語末での発音',
          description: `ㄷは語末または次の子音の前で「t」と発音されます`,
          examples: [`${syllable.syllable} → ${syllable.romanization}`]
        });
      }
    }

    // ㄹ の特殊な変化
    if (consonant === 'ㄹ') {
      const description = position === 'initial'
        ? `「${syllable.syllable}」のㄹは語頭で「r」と発音されます`
        : position === 'final'
        ? `語末のㄹは「l」と発音されます`
        : `語中のㄹは「r」と発音されます`;

      points.push({
        type: 'special',
        title: 'ㄹ の発音位置',
        description,
        examples: [`${syllable.syllable} → ${syllable.romanization}`]
      });
    }

    // 母音の変換パターン
    const vowel = syllable.components.vowel;
    if (vowel === 'ㅓ' && analysis.english.toLowerCase().includes('e')) {
      points.push({
        type: 'vowel',
        title: 'ㅓ の英語表記',
        description: `「${syllable.syllable}」のㅓは英語名では単純な「e」として表記されることが多いです`,
        examples: [`${analysis.fullRomanization} → ${analysis.english}`]
      });
    }

    if (vowel === 'ㅗ' && analysis.english.toLowerCase().includes('o')) {
      points.push({
        type: 'vowel',
        title: 'ㅗ の発音',
        description: `「${syllable.syllable}」のㅗは「o」として発音されます`,
        examples: [`${syllable.syllable} → ${syllable.romanization}`]
      });
    }

    if (vowel === 'ㅜ' && analysis.english.toLowerCase().includes('u')) {
      points.push({
        type: 'vowel',
        title: 'ㅜ の発音',
        description: `「${syllable.syllable}」のㅜは「u」として発音されます`,
        examples: [`${syllable.syllable} → ${syllable.romanization}`]
      });
    }

    // 終声（音節末の子音）- 日本語にない概念
    if (syllable.components.finalConsonant) {
      const final = syllable.components.finalConsonant;
      let finalDescription = '';
      let finalTitle = '';

      if (final === 'ㄴ') {
        finalTitle = 'ㄴ の終声';
        finalDescription = `「${syllable.syllable}」の音節末のㄴは「n」と発音されます。日本語と違い、韓国語は子音で音節が終わることができます`;
      } else if (final === 'ㅁ') {
        finalTitle = 'ㅁ の終声';
        finalDescription = `「${syllable.syllable}」の音節末のㅁは「m」と発音されます`;
      } else if (final === 'ㄱ') {
        finalTitle = 'ㄱ の終声';
        finalDescription = `「${syllable.syllable}」の音節末のㄱは「k」と発音されます`;
      } else if (final === 'ㅇ') {
        finalTitle = 'ㅇ の終声';
        finalDescription = `「${syllable.syllable}」の音節末のㅇは「ng」と発音されます`;
      }

      if (finalTitle) {
        points.push({
          type: 'pattern',
          title: finalTitle,
          description: finalDescription,
          examples: [`${syllable.syllable} → ${syllable.romanization}`]
        });
      }
    }
  }

  // 重複を除去し最大3つまで
  const uniquePoints = points.filter((point, index, self) =>
    index === self.findIndex(p => p.title === point.title)
  ).slice(0, 3);

  // 学習ポイントが少ない場合は一般的なポイントを追加
  if (uniquePoints.length === 0) {
    uniquePoints.push({
      type: 'pattern',
      title: '基本的な音韻パターン',
      description: 'このキャラクター名は基本的な韓国語の音韻規則に従っています',
      examples: [`${analysis.fullRomanization} → ${analysis.english}`]
    });
  }

  return uniquePoints;
}