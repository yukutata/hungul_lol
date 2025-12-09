// Debug utility to test practice item generation
import { generatePracticeItems } from './practiceGenerator';
import { FocusArea } from '../types/learningSystem';

export function debugPracticeGeneration() {
  // Test module-1-1: ㄱ, ㄴ, ㄷ
  console.log('=== Testing module-1-1 (ㄱ, ㄴ, ㄷ) ===');
  const module1_1_focus: FocusArea[] = [{
    type: 'consonants',
    characters: ['ㄱ', 'ㄴ', 'ㄷ']
  }];

  const items1_1 = generatePracticeItems(module1_1_focus, 'beginner', 5);
  items1_1.forEach((item, idx) => {
    console.log(`Question ${idx + 1}: ${item.characterName} - ${item.correctAnswer}`);
  });

  // Test module-1-2: ㄹ, ㅁ
  console.log('\n=== Testing module-1-2 (ㄹ, ㅁ) ===');
  const module1_2_focus: FocusArea[] = [{
    type: 'consonants',
    characters: ['ㄹ', 'ㅁ']
  }];

  const items1_2 = generatePracticeItems(module1_2_focus, 'beginner', 5);
  items1_2.forEach((item, idx) => {
    console.log(`Question ${idx + 1}: ${item.characterName} - ${item.correctAnswer}`);
  });

  // Count character distribution
  console.log('\n=== Character Distribution ===');
  const charCount1_1: Record<string, number> = {};
  items1_1.forEach(item => {
    charCount1_1[item.characterName] = (charCount1_1[item.characterName] || 0) + 1;
  });
  console.log('Module 1-1:', charCount1_1);

  const charCount1_2: Record<string, number> = {};
  items1_2.forEach(item => {
    charCount1_2[item.characterName] = (charCount1_2[item.characterName] || 0) + 1;
  });
  console.log('Module 1-2:', charCount1_2);
}