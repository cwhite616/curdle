export type Month = 
  | 'January' | 'February' | 'March' | 'April' | 'May' | 'June'
  | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

export interface SecretCode {
  milkfat: number;  // Will be padded to 3 digits
  month: Month;
  day: number;      // Will be padded to 2 digits
  year: number;     // Will be 4 digits
}

export interface Guess {
  milkfat: number;
  month: Month;
  day: number;
  year: number;
}

export type FeedbackColor = 'green' | 'yellow' | 'black';

export interface GuessResult {
  milkfatFeedback: FeedbackColor[];  // Array of 3 colors for each digit
  monthFeedback: FeedbackColor;
  dayFeedback: FeedbackColor[];      // Array of 2 colors for each digit
  yearFeedback: FeedbackColor[];     // Array of 4 colors for each digit
} 