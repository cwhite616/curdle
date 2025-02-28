'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Guess, GuessResult, Month, FeedbackColor } from '@/lib/types';
import { MONTHS, generateDailyCode, checkGuess, isWinningGuess } from '@/lib/game';

export default function Home() {
  const [secretCode] = useState(() => generateDailyCode());
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [results, setResults] = useState<GuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState<Partial<Guess>>({});
  const [gameOver, setGameOver] = useState(false);
  const [digitInputs, setDigitInputs] = useState({
    milkfat: ['', '', ''],
    day: ['', ''],
    year: ['', '', '', '']
  });

  type InputRef = React.RefObject<HTMLInputElement>;
  
  // Create refs for all input fields
  const milkfatRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const dayRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const yearRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const inputRefs = {
    milkfat: milkfatRefs as InputRef[],
    day: dayRefs as InputRef[],
    year: yearRefs as InputRef[]
  };

  // Helper function to convert digit arrays to numbers
  const digitsToNumber = (digits: string[]): number => {
    return parseInt(digits.join('')) || 0;
  };

  // Handle individual digit input
  const handleDigitInput = (
    field: 'milkfat' | 'day' | 'year',
    index: number,
    value: string,
    nextRef: InputRef | null
  ) => {
    // Only allow single digits
    if (value && !/^\d$/.test(value)) return;

    setDigitInputs(prev => {
      const newDigits = { ...prev };
      newDigits[field][index] = value;
      
      // Update the currentGuess state
      const newGuess = { ...currentGuess };
      if (value) {
        newGuess[field] = digitsToNumber(newDigits[field]);
      } else {
        delete newGuess[field];
      }
      setCurrentGuess(newGuess);
      
      return newDigits;
    });

    // Auto-advance to next input if a digit was entered
    if (value && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  // Handle backspace navigation
  const handleDigitBackspace = (
    field: 'milkfat' | 'day' | 'year',
    index: number,
    prevRef: InputRef | null
  ) => {
    if (!digitInputs[field][index] && prevRef?.current) {
      prevRef.current.focus();
    }
  };

  useEffect(() => {
    // Load game state from localStorage
    const savedState = localStorage.getItem('curdle-state');
    const savedDate = localStorage.getItem('curdle-date');
    const today = new Date().toISOString().split('T')[0];

    if (savedState && savedDate === today) {
      const state = JSON.parse(savedState);
      setGuesses(state.guesses);
      setResults(state.results);
      setGameOver(state.gameOver);
    }
  }, []);

  useEffect(() => {
    // Save game state to localStorage
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('curdle-date', today);
    localStorage.setItem('curdle-state', JSON.stringify({
      guesses,
      results,
      gameOver
    }));
  }, [guesses, results, gameOver]);

  const handleSubmitGuess = () => {
    if (!currentGuess.milkfat || !currentGuess.month || !currentGuess.day || !currentGuess.year) {
      return;
    }

    const guess = currentGuess as Guess;
    const result = checkGuess(secretCode, guess);

    const newGuesses = [...guesses, guess];
    const newResults = [...results, result];
    
    // Reset form state completely
    setCurrentGuess({
      milkfat: undefined,
      month: undefined,
      day: undefined,
      year: undefined
    });
    resetDigitInputs();
    
    setGuesses(newGuesses);
    setResults(newResults);

    if (isWinningGuess(result) || newGuesses.length === 6) {
      setGameOver(true);
    }
  };

  const handleInputChange = (field: keyof Guess, value: string | Month) => {
    if (field === 'month') {
      setCurrentGuess(prev => ({ ...prev, [field]: value as Month }));
    } else {
      // Only update if we have a valid number
      if (value === '') {
        setCurrentGuess(prev => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      } else {
        const numValue = parseInt(value as string);
        if (!isNaN(numValue)) {
          setCurrentGuess(prev => ({ ...prev, [field]: numValue }));
        }
      }
    }
  };

  const getColorClass = (color: 'green' | 'yellow' | 'black') => {
    switch (color) {
      case 'green': return 'bg-green-500 text-white';
      case 'yellow': return 'bg-yellow-500 text-white';
      case 'black': return 'bg-gray-800 text-white';
    }
  };

  const renderDigitBoxes = (value: number, feedback: FeedbackColor[], padLength: number) => {
    const digits = value.toString().padStart(padLength, '0').split('');
    return digits.map((digit, i) => (
      <div key={i} className={`p-2 rounded text-center w-[32px] ${getColorClass(feedback[i])}`}>
        {digit}
      </div>
    ));
  };

  const resetDigitInputs = () => {
    setDigitInputs({
      milkfat: ['', '', ''],
      day: ['', ''],
      year: ['', '', '', '']
    });
  };

  const isValidGuess = () => {
    // Check if all milkfat digits are filled
    const isMilkfatComplete = digitInputs.milkfat.every(digit => /^\d$/.test(digit));
    // Check if all day digits are filled
    const isDayComplete = digitInputs.day.every(digit => /^\d$/.test(digit));
    // Check if all year digits are filled
    const isYearComplete = digitInputs.year.every(digit => /^\d$/.test(digit));
    // Check if month is selected
    const isMonthSelected = !!currentGuess.month;

    return isMilkfatComplete && isDayComplete && isYearComplete && isMonthSelected;
  };

  return (
    <main className="min-h-screen bg-cover bg-center p-4 md:p-8" style={{ backgroundImage: 'url(/milk-carton.svg)' }}>
      <div className="max-w-4xl mx-auto space-y-4">
        <Card className="p-6 bg-white/90 backdrop-blur">
          <h1 className="text-4xl font-bold text-center mb-2">Curdle</h1>
          <p className="text-gray-600 text-center mb-6">What percentage is my milkfat, and when do I expire?<br /> Milkfat is any number between 0 and 100, and expiration date is any valid date between 1/1/1864 and today.</p>
          
          {/* Game Status (for debugging) */}
          <div className="text-sm text-gray-500 text-center mb-4">
            Guesses: {guesses.length}/6 | Game Over: {gameOver ? 'Yes' : 'No'}
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium text-gray-600">
            <div className="col-span-3 text-center">Milkfat %</div>
            <div className="col-span-9 grid grid-cols-9">
              <div className="col-span-3 text-center">Month</div>
              <div className="col-span-2 text-center">Day</div>
              <div className="col-span-4 text-center">Year</div>
            </div>
          </div>

          {/* Previous Guesses */}
          <div className="space-y-2 mb-6">
            {guesses.map((guess, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 whitespace-nowrap">
                {/* Milkfat - 3 digits */}
                <div className="col-span-3 flex gap-2">
                  {renderDigitBoxes(guess.milkfat, results[i].milkfatFeedback, 3)}
                </div>
                
                {/* Month - 1 box */}
                <div className={`col-span-3 p-2 rounded text-center truncate ${getColorClass(results[i].monthFeedback)}`}>
                  {guess.month}
                </div>
                
                {/* Day - 2 digits */}
                <div className="col-span-2 flex gap-2">
                  {renderDigitBoxes(guess.day, results[i].dayFeedback, 2)}
                </div>
                
                {/* Year - 4 digits */}
                <div className="col-span-4 flex gap-2">
                  {renderDigitBoxes(guess.year, results[i].yearFeedback, 4)}
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          {!gameOver && guesses.length < 6 && (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Milkfat Percentage</label>
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <Input
                          key={`milkfat-${i}`}
                          type="text"
                          maxLength={1}
                          className="w-[32px] text-center p-2"
                          value={digitInputs.milkfat[i]}
                          ref={inputRefs.milkfat[i]}
                          onChange={(e) => handleDigitInput(
                            'milkfat',
                            i,
                            e.target.value,
                            i < 2 ? inputRefs.milkfat[i + 1] : null
                          )}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace') {
                              handleDigitBackspace(
                                'milkfat',
                                i,
                                i > 0 ? inputRefs.milkfat[i - 1] : null
                              );
                            }
                          }}
                          name={`milkfat-${i}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="col-span-9 grid grid-cols-9 gap-2">
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Expiration Month</label>
                      <Select
                        value={currentGuess.month}
                        onValueChange={(value) => handleInputChange('month', value as Month)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Day</label>
                      <div className="flex gap-2">
                        {[0, 1].map((i) => (
                          <Input
                            key={`day-${i}`}
                            type="text"
                            maxLength={1}
                            className="w-[32px] text-center p-2"
                            value={digitInputs.day[i]}
                            ref={inputRefs.day[i]}
                            onChange={(e) => handleDigitInput(
                              'day',
                              i,
                              e.target.value,
                              i < 1 ? inputRefs.day[i + 1] : null
                            )}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace') {
                                handleDigitBackspace(
                                  'day',
                                  i,
                                  i > 0 ? inputRefs.day[i - 1] : null
                                );
                              }
                            }}
                            name={`day-${i}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="col-span-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Year</label>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3].map((i) => (
                          <Input
                            key={`year-${i}`}
                            type="text"
                            maxLength={1}
                            className="w-[32px] text-center p-2"
                            value={digitInputs.year[i]}
                            ref={inputRefs.year[i]}
                            onChange={(e) => handleDigitInput(
                              'year',
                              i,
                              e.target.value,
                              i < 3 ? inputRefs.year[i + 1] : null
                            )}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace') {
                                handleDigitBackspace(
                                  'year',
                                  i,
                                  i > 0 ? inputRefs.year[i - 1] : null
                                );
                              }
                            }}
                            name={`year-${i}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={handleSubmitGuess}
                  disabled={!isValidGuess()}
                >
                  Submit Guess ({6 - guesses.length} remaining)
                </Button>
              </div>
            </>
          )}

          {gameOver && (
            <div className="text-center mt-4">
              <h2 className="text-2xl font-bold mb-2">
                {isWinningGuess(results[results.length - 1]) ? 'Congratulations!' : 'Game Over!'}
              </h2>
              <p>The correct answer was:</p>
              <div className="grid grid-cols-12 gap-2 mt-2">
                <div className="col-span-3 flex gap-2">
                  {renderDigitBoxes(secretCode.milkfat, Array(3).fill('green'), 3)}
                </div>
                <div className="col-span-3 p-2 bg-green-500 text-white rounded text-center truncate">
                  {secretCode.month}
                </div>
                <div className="col-span-2 flex gap-2">
                  {renderDigitBoxes(secretCode.day, Array(2).fill('green'), 2)}
                </div>
                <div className="col-span-4 flex gap-2">
                  {renderDigitBoxes(secretCode.year, Array(4).fill('green'), 4)}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
