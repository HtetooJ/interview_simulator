# Interview Practice - Waiter Interview Prep

A practice tool for Myanmar youth (20-30) preparing for waiter interviews in Dubai. This MVP focuses on spoken interview practice with encouraging feedback.

## Features

- **Question Selection**: Choose which questions to practice
- **Example Answers**: Listen to example answers for each question
- **Fill-in-the-Blank Templates**: Use templates to structure your answers
- **Audio Recording**: Record your spoken answers
- **Feedback System**: Get encouraging feedback on:
  - Effort & Delivery
  - Content Signals
  - Improvement Hints
- **No Login Required**: Start practicing immediately

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Web Speech API (for transcription)
- MediaRecorder API (for audio recording)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
  page.tsx              # Landing screen
  select/
    page.tsx            # Question selection screen
  practice/
    page.tsx            # Main practice flow
    components/         # Practice components
  complete/
    page.tsx            # Completion screen
data/
  questions.ts          # Interview questions data
lib/
  speech-analysis.ts    # Web Speech API integration
  feedback-generator.ts # Feedback generation logic
  analytics.ts         # Simple analytics
```

## Browser Support

- Chrome/Edge: Full support (recommended)
- Safari: Limited Web Speech API support
- Firefox: No Web Speech API support (fallback mode)

## Design System

All UI follows the style guide in `/docs/style-guide.md`:
- Colors: Neutral, warm palette
- Typography: Inter font family
- Spacing: 4px base unit
- Border Radius: Friendly, forgiving shapes

## License

MIT
