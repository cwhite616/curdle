import { Month, SecretCode, Guess, GuessResult, FeedbackColor } from './types';

export const MONTHS: Month[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function generateDailyCode(): SecretCode {
  const today = new Date();
  const seed = today.toISOString().split('T')[0]; // Use date as seed
  
  // Use the seed to generate consistent random numbers for the day
  const seededRandom = () => {
    const x = Math.sin(parseInt(seed.replace(/-/g, ''))) * 10000;
    return x - Math.floor(x);
  };

  return {
    milkfat: Math.floor(seededRandom() * 101),
    month: MONTHS[Math.floor(seededRandom() * 12)],
    day: Math.floor(seededRandom() * 28) + 1, // Simplified to avoid month length issues
    year: Math.floor(seededRandom() * (new Date().getFullYear() - 1886 + 1)) + 1886
  };
}

function compareDigits(target: number, guess: number, padLength: number): FeedbackColor[] {
  const targetStr = target.toString().padStart(padLength, '0');
  const guessStr = guess.toString().padStart(padLength, '0');
  const result: FeedbackColor[] = Array(padLength).fill('black');

  // First pass: find exact matches
  for (let i = 0; i < padLength; i++) {
    if (guessStr[i] === targetStr[i]) {
      result[i] = 'green';
    }
  }

  // Second pass: find misplaced digits
  const targetDigits = targetStr.split('');
  const guessDigits = guessStr.split('');
  
  for (let i = 0; i < padLength; i++) {
    if (result[i] !== 'green') {
      const digitIndex = targetDigits.indexOf(guessDigits[i]);
      if (digitIndex !== -1 && result[digitIndex] !== 'green') {
        result[i] = 'yellow';
        targetDigits[digitIndex] = '-'; // Mark as used
      }
    }
  }

  return result;
}

function compareMonths(target: Month, guess: Month): FeedbackColor {
  const targetIndex = MONTHS.indexOf(target);
  const guessIndex = MONTHS.indexOf(guess);

  if (targetIndex === guessIndex) return 'green';
  
  const diff = Math.abs(targetIndex - guessIndex);
  if (diff === 1 || diff === 11) return 'yellow'; // Handle December-January wrap
  
  return 'black';
}

export function checkGuess(secret: SecretCode, guess: Guess): GuessResult {
  return {
    milkfatFeedback: compareDigits(secret.milkfat, guess.milkfat, 3),
    monthFeedback: compareMonths(secret.month, guess.month),
    dayFeedback: compareDigits(secret.day, guess.day, 2),
    yearFeedback: compareDigits(secret.year, guess.year, 4)
  };
}

export function isWinningGuess(result: GuessResult): boolean {
  const allGreen = (feedback: FeedbackColor[]) => 
    feedback.every(color => color === 'green');
  
  return (
    allGreen(result.milkfatFeedback) &&
    result.monthFeedback === 'green' &&
    allGreen(result.dayFeedback) &&
    allGreen(result.yearFeedback)
  );
} 