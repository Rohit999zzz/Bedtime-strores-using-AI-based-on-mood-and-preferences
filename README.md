# Magical Bedtime Stories

A magical bedtime story generator that detects emotions from user input and generates a story using Gemini AI. The app also includes text-to-speech functionality using ElevenLabs.

## Features

- **Emotion Detection:** Uses a BERT model to detect emotions from user input.
- **Story Generation:** Generates a story based on the detected emotion using Gemini AI.
- **Text-to-Speech:** Converts the generated story into audio using ElevenLabs.
- **Magical UI:** A cozy, dark-themed UI with animated stars, a glowing moon, and floating clouds.

## Prerequisites

- Node.js and npm (for the frontend)
- Python 3.11+ (for the backend)
- ElevenLabs API key (for TTS)
- Gemini API key (for story generation)

## Installation

### Frontend

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/magical-bedtime-stories.git
   cd magical-bedtime-stories
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the `backend` directory with your API keys:
   ```
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

4. Start the Flask server:
   ```bash
   python app.py
   ```

## Usage

1. Open your browser and go to `http://localhost:5173`.
2. Enter your feelings in the text box.
3. Click "Generate Story" to detect your emotion and generate a story.
4. Listen to the story using the audio playback controls.

## Technologies Used

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Flask, Python
- **AI:** Gemini AI, BERT for emotion detection
- **TTS:** ElevenLabs

## License

This project is licensed under the MIT License.

## Acknowledgments

- Thanks to ElevenLabs for the TTS API.
- Thanks to Google for Gemini AI.
