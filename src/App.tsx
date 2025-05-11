import React, { useState, useEffect } from 'react';
import { Book, Moon, Stars, Heart, Sun, Cloud, Rainbow, Music, Volume2, VolumeX } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import EmotionStory from './components/EmotionStory';

type Mood = 'happy' | 'sleepy' | 'excited' | 'calm';
type Theme = 'space' | 'nature' | 'magic' | 'animals';

const genAI = new GoogleGenerativeAI('gemmini-api-key');

function App() {
  const [name, setName] = useState('');
  const [mood, setMood] = useState<Mood>('happy');
  const [theme, setTheme] = useState<Theme>('magic');
  const [story, setStory] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldownTime, setCooldownTime] = useState(0);
  const [detectedEmotion, setDetectedEmotion] = useState<string>('');

  // Text-to-Speech setup
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => voice.name.includes('female') || voice.name.includes('girl'));
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.pitch = 1.2;
      utterance.rate = 0.9;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownTime <= 0) return;

    const timer = setInterval(() => {
      setCooldownTime(time => {
        if (time <= 1) {
          setErrorMessage('');
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownTime]);

  const generateStoryWithGemini = async () => {
    try {
      setIsGenerating(true);
      setErrorMessage('');
      
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `Create a short, engaging bedtime story for a child named ${name} who is feeling ${mood}. 
        The story should be themed around ${theme} and should be appropriate for bedtime. 
        Make it magical, positive, and end with a gentle message that encourages sweet dreams. 
        Keep it around 4-5 sentences long.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const newStory = response.text();
      setStory(newStory);
    } catch (error: any) {
      console.error('Error generating story:', error);
      
      // Handle quota exceeded error
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        setErrorMessage('We\'ve reached our story limit for now. Please try again in 60 seconds.');
        setCooldownTime(60);
        setStory('');
      } else {
        setErrorMessage('Oops! Something went wrong while creating your story. Please try again.');
        setStory('');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStory = () => {
    if (!name || isGenerating || cooldownTime > 0) return;
    generateStoryWithGemini();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#181c2b] via-[#2a2250] to-[#1a1a2e] relative overflow-hidden font-sans">
      {/* Decorative animated stars, moon, and clouds */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {/* Glowing moon */}
        <svg className="absolute top-10 left-10 animate-pulse" width="100" height="100" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fffbe6" stopOpacity="1" />
              <stop offset="100%" stopColor="#fffbe6" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="40" fill="url(#moonGlow)" />
          <circle cx="50" cy="50" r="30" fill="#fffbe6" />
        </svg>
        {/* Animated twinkling stars */}
        {[...Array(18)].map((_, i) => (
          <svg
            key={i}
            className={`absolute twinkle-star animate-twinkle`}
            style={{
              top: `${Math.random() * 90 + 2}%`,
              left: `${Math.random() * 95 + 1}%`,
              animationDelay: `${Math.random() * 3}s`,
              width: `${Math.random() * 10 + 6}px`,
              height: `${Math.random() * 10 + 6}px`,
            }}
            viewBox="0 0 20 20"
          >
            <circle cx="10" cy="10" r="2" fill="#fffbe6" />
          </svg>
        ))}
        {/* Floating clouds */}
        <svg className="absolute bottom-10 left-1/4 animate-cloud-slow opacity-40" width="180" height="60" viewBox="0 0 180 60">
          <ellipse cx="60" cy="40" rx="60" ry="20" fill="#fff" fillOpacity="0.18" />
          <ellipse cx="120" cy="30" rx="40" ry="15" fill="#fff" fillOpacity="0.13" />
        </svg>
        <svg className="absolute top-24 right-10 animate-cloud-fast opacity-30" width="120" height="40" viewBox="0 0 120 40">
          <ellipse cx="60" cy="20" rx="40" ry="12" fill="#fff" fillOpacity="0.15" />
        </svg>
      </div>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-100 mb-2 flex items-center justify-center gap-2 font-story drop-shadow-lg">
            <Book className="h-8 w-8 text-yellow-200" />
            Magical Bedtime Stories by Rohit
          </h1>
          <p className="text-yellow-100 font-semibold drop-shadow">Create a special story just for you!</p>
        </div>

        <div className="max-w-2xl mx-auto bg-[#23234a]/80 rounded-2xl shadow-2xl border border-yellow-100 backdrop-blur-md p-8 mb-8">
          <EmotionStory onEmotionDetected={setDetectedEmotion} />
        </div>

        <div className="max-w-2xl mx-auto bg-[#23234a]/80 rounded-2xl shadow-2xl border border-yellow-100 backdrop-blur-md p-8">
          <div className="mb-6">
            <label className="block text-indigo-700 text-sm font-semibold mb-2">
              What's your name, little storyteller?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:border-indigo-500"
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-6">
            <label className="block text-indigo-700 text-sm font-semibold mb-2">
              How are you feeling today?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: 'happy', icon: Sun, label: 'Happy' },
                { value: 'sleepy', icon: Moon, label: 'Sleepy' },
                { value: 'excited', icon: Stars, label: 'Excited' },
                { value: 'calm', icon: Cloud, label: 'Calm' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMood(option.value as Mood)}
                  className={`p-4 rounded-lg flex flex-col items-center transition-all ${
                    mood === option.value
                      ? 'bg-indigo-100 border-2 border-indigo-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-indigo-50'
                  }`}
                >
                  <option.icon className="h-6 w-6 text-indigo-600 mb-2" />
                  <span className="text-sm text-indigo-700">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-indigo-700 text-sm font-semibold mb-2">
              Choose your story theme
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: 'space', icon: Stars, label: 'Space' },
                { value: 'nature', icon: Rainbow, label: 'Nature' },
                { value: 'magic', icon: Heart, label: 'Magic' },
                { value: 'animals', icon: Music, label: 'Animals' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value as Theme)}
                  className={`p-4 rounded-lg flex flex-col items-center transition-all ${
                    theme === option.value
                      ? 'bg-indigo-100 border-2 border-indigo-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-indigo-50'
                  }`}
                >
                  <option.icon className="h-6 w-6 text-indigo-600 mb-2" />
                  <span className="text-sm text-indigo-700">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {errorMessage}
              {cooldownTime > 0 && (
                <div className="mt-2 text-sm">
                  Try again in: {cooldownTime} seconds
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleGenerateStory}
            disabled={!name || isGenerating || cooldownTime > 0}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
              name && !isGenerating && cooldownTime === 0
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isGenerating ? 'Creating Your Story...' : 'Create My Story'}
          </button>

          {story && (
            <div className="mt-8 p-6 bg-indigo-50 rounded-lg relative">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-indigo-800">
                  {name}'s Bedtime Adventure
                </h2>
                <button
                  onClick={isSpeaking ? stopSpeaking : () => speak(story)}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  title={isSpeaking ? "Stop Reading" : "Read Story"}
                >
                  {isSpeaking ? (
                    <VolumeX className="h-6 w-6" />
                  ) : (
                    <Volume2 className="h-6 w-6" />
                  )}
                </button>
              </div>
              <p className="text-indigo-700 leading-relaxed whitespace-pre-line">
                {story}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
