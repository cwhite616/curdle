# Curdle 🥛

A daily milk dating game! Test your knowledge of milk history by guessing the secret code that consists of milk fat percentages, and a date from milk history.

## How to Play

Every day, there's a new secret code consisting of:
- 3 milk fat percentages (0-100%)
- A month
- A day (1-31)
- A year (1886-present)

You have 6 chances to guess the correct combination. After each guess, you'll get feedback:

- For numbers (milk fat % and dates):
  - 🟩 Green: Correct digit in the correct position
  - 🟨 Yellow: Correct digit in the wrong position
  - ⬛ Black: Digit not in the number

- For months:
  - 🟩 Green: Correct month
  - 🟨 Yellow: Within one month of the correct month
  - ⬛ Black: More than one month away

## Development

### Prerequisites
- Node.js 18+
- pnpm

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Technologies Used
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## License
MIT
