import { Curriculum, LessonModule } from '../types/learningSystem';
import { generatePracticeItems } from '../utils/practiceGenerator';

export const koreanCurriculum: Curriculum = {
  stages: [
    {
      id: 'stage-1',
      name: '基本子音',
      description: '韓国語の基本的な子音（ㄱ,ㄴ,ㄷ,ㄹ,ㅁ,ㅂ,ㅅ）を学習',
      level: 'beginner',
      modules: ['module-1-1', 'module-1-2', 'module-1-3'],
      prerequisites: [],
      focusAreas: [
        {
          type: 'consonants',
          characters: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ']
        }
      ]
    },
    {
      id: 'stage-2',
      name: '基本母音',
      description: '韓国語の基本的な母音（ㅏ,ㅓ,ㅗ,ㅜ,ㅡ,ㅣ）を学習',
      level: 'beginner',
      modules: ['module-2-1', 'module-2-2', 'module-2-3'],
      prerequisites: ['stage-1'],
      focusAreas: [
        {
          type: 'vowels',
          characters: ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ']
        }
      ]
    },
    {
      id: 'stage-3',
      name: '複合子音・複合母音',
      description: '濃音（ㄲ,ㄸ,ㅃ,ㅆ,ㅉ）と複合母音を学習',
      level: 'intermediate',
      modules: ['module-3-1', 'module-3-2', 'module-3-3', 'module-3-4'],
      prerequisites: ['stage-1', 'stage-2'],
      focusAreas: [
        {
          type: 'consonants',
          characters: ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅊ', 'ㅎ']
        },
        {
          type: 'vowels',
          characters: ['ㅐ', 'ㅔ', 'ㅒ', 'ㅖ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅢ']
        }
      ]
    },
    {
      id: 'stage-4',
      name: '終声（パッチム）',
      description: '韓国語の終声システムを理解し、正しい発音を習得',
      level: 'intermediate',
      modules: ['module-4-1', 'module-4-2', 'module-4-3'],
      prerequisites: ['stage-3'],
      focusAreas: [
        {
          type: 'finals',
          characters: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅇ', 'ㄲ', 'ㅆ']
        }
      ]
    },
    {
      id: 'stage-5',
      name: '音韻変化ルール',
      description: '実践的な音韻変化ルールを学習し、自然な発音を習得',
      level: 'advanced',
      modules: ['module-5-1', 'module-5-2', 'module-5-3', 'module-5-4'],
      prerequisites: ['stage-4'],
      focusAreas: [
        {
          type: 'sound-changes',
          rules: ['連音化', '激音化', '濃音化', '鼻音化', 'ㅎ弱音化', '口蓋音化']
        }
      ]
    },
    {
      id: 'stage-6',
      name: '実践応用',
      description: '全キャラクター名を使った総合練習',
      level: 'master',
      modules: ['module-6-1', 'module-6-2', 'module-6-3'],
      prerequisites: ['stage-5'],
      focusAreas: [
        {
          type: 'practice',
          characters: []
        }
      ]
    }
  ]
};

export const lessonModules: Record<string, LessonModule> = {
  'module-1-1': {
    id: 'module-1-1',
    level: 'beginner',
    stage: 1,
    title: '基本子音 - ㄱ、ㄴ、ㄷ',
    description: '最も基本的な子音3つを学習します',
    objectives: [
      'ㄱ（g/k）の音を理解する',
      'ㄴ（n）の音を理解する',
      'ㄷ（d/t）の音を理解する',
      'これらの子音を含むキャラクター名を認識できる'
    ],
    content: [
      {
        type: 'explanation',
        title: 'ㄱ（ギウク）',
        content: '英語のg/kの音に近い子音です。語頭では「g」、語中では「k」の音になります。',
        examples: [
          { korean: '가렌', romanization: 'Garen', meaning: 'ガレン' },
          { korean: '갱플랭크', romanization: 'Gangplank', meaning: 'ガングプランク' }
        ]
      },
      {
        type: 'explanation',
        title: 'ㄴ（ニウン）',
        content: '英語の「n」と同じ音です。',
        examples: [
          { korean: '나미', romanization: 'Nami', meaning: 'ナミ' },
          { korean: '누누', romanization: 'Nunu', meaning: 'ヌヌ' }
        ]
      },
      {
        type: 'explanation',
        title: 'ㄷ（ディグッ）',
        content: '英語のd/tの音に近い子音です。語頭では「d」、語中では「t」の音になります。',
        examples: [
          { korean: '다리우스', romanization: 'Darius', meaning: 'ダリウス' },
          { korean: '드레이븐', romanization: 'Draven', meaning: 'ドレイヴン' }
        ]
      }
    ],
    practiceItems: [],
    requiredScore: 80,
    estimatedMinutes: 15
  },
  'module-1-2': {
    id: 'module-1-2',
    level: 'beginner',
    stage: 1,
    title: '基本子音 - ㄹ、ㅁ',
    description: '流音と鼻音を学習します',
    objectives: [
      'ㄹ（r/l）の音を理解する',
      'ㅁ（m）の音を理解する',
      'これらの子音を含むキャラクター名を認識できる'
    ],
    content: [
      {
        type: 'explanation',
        title: 'ㄹ（リウル）',
        content: '日本語の「ら行」に近い音ですが、語頭では「r」、語中では「l」の音になります。',
        examples: [
          { korean: '럭스', romanization: 'Lux', meaning: 'ラックス' },
          { korean: '리븐', romanization: 'Riven', meaning: 'リヴェン' },
          { korean: '렐', romanization: 'Rell', meaning: 'レル' }
        ]
      },
      {
        type: 'explanation',
        title: 'ㅁ（ミウム）',
        content: '英語の「m」と同じ音です。',
        examples: [
          { korean: '마스터 이', romanization: 'Master Yi', meaning: 'マスター・イー' },
          { korean: '모르가나', romanization: 'Morgana', meaning: 'モルガナ' },
          { korean: '말파이트', romanization: 'Malphite', meaning: 'マルファイト' }
        ]
      }
    ],
    practiceItems: [],
    requiredScore: 80,
    estimatedMinutes: 10
  },
  'module-1-3': {
    id: 'module-1-3',
    level: 'beginner',
    stage: 1,
    title: '基本子音 - ㅂ、ㅅ',
    description: '唇音と摩擦音を学習します',
    objectives: [
      'ㅂ（b/p）の音を理解する',
      'ㅅ（s）の音を理解する',
      'これらの子音を含むキャラクター名を認識できる'
    ],
    content: [
      {
        type: 'explanation',
        title: 'ㅂ（ビウプ）',
        content: '英語のb/pの音に近い子音です。語頭では「b」、語中では「p」の音になります。',
        examples: [
          { korean: '브라움', romanization: 'Braum', meaning: 'ブラウム' },
          { korean: '바이', romanization: 'Vi', meaning: 'ヴァイ' },
          { korean: '베인', romanization: 'Vayne', meaning: 'ヴェイン' }
        ]
      },
      {
        type: 'explanation',
        title: 'ㅅ（シオッ）',
        content: '英語の「s」の音です。「ㅣ」母音の前では「sh」の音になることがあります。',
        examples: [
          { korean: '소나', romanization: 'Sona', meaning: 'ソナ' },
          { korean: '세트', romanization: 'Sett', meaning: 'セト' },
          { korean: '시비르', romanization: 'Sivir', meaning: 'シヴィア' }
        ]
      }
    ],
    practiceItems: [],
    requiredScore: 80,
    estimatedMinutes: 10
  }
};

export function getLessonsByStage(stageId: string): LessonModule[] {
  const stage = koreanCurriculum.stages.find(s => s.id === stageId);
  if (!stage) return [];

  return stage.modules
    .map(moduleId => {
      const module = lessonModules[moduleId];
      if (!module) return null;

      // Generate practice items for this module
      const practiceItems = generatePracticeItems(
        stage.focusAreas,
        module.level,
        module.level === 'beginner' ? 5 : 8
      );

      return {
        ...module,
        practiceItems
      };
    })
    .filter(Boolean);
}

export function getNextLesson(
  completedLessons: string[],
  currentLevel: string
): LessonModule | null {
  const allModuleIds = Object.keys(lessonModules);

  for (const moduleId of allModuleIds) {
    if (!completedLessons.includes(moduleId)) {
      const module = lessonModules[moduleId];
      if (module && module.level === currentLevel) {
        return module;
      }
    }
  }

  return null;
}