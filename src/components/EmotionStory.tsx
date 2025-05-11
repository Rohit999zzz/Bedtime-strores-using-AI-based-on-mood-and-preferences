import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface EmotionStoryProps {
  onEmotionDetected: (emotion: string) => void;
}

const EmotionStory: React.FC<EmotionStoryProps> = ({ onEmotionDetected }) => {
  const [text, setText] = useState('');
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the Python backend endpoint
      const response = await fetch('http://localhost:5000/detect-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setDetectedEmotion(data.emotion);
      onEmotionDetected(data.emotion);
      
      // Generate story based on emotion
      const storyResponse = await fetch('http://localhost:5000/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emotion: data.emotion }),
      });

      const storyData = await storyResponse.json();
      setStory(storyData.story);
      setAudioUrl(`http://localhost:5000${storyData.audio_url}`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/80 rounded-2xl shadow-2xl border border-yellow-100 backdrop-blur-md">
      <h2 className="text-2xl font-bold mb-4 text-indigo-900 font-story drop-shadow">How are you feeling today?</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-yellow-50/60 text-indigo-900 placeholder:text-indigo-400"
          placeholder="Share your feelings..."
          rows={4}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-yellow-300 text-white font-bold py-2 px-4 rounded-xl shadow-lg hover:from-indigo-600 hover:to-yellow-400 transition-all disabled:bg-indigo-200"
        >
          {loading ? 'Processing...' : 'Generate Story'}
        </button>
      </form>
      
      {detectedEmotion && (
        <div className="mt-6 p-4 bg-yellow-50/80 rounded-lg border border-yellow-200 shadow font-semibold text-indigo-800">
          <h3 className="text-lg font-semibold text-purple-700 mb-2 font-story">Detected Emotion</h3>
          <p className="text-purple-600 capitalize">{detectedEmotion}</p>
        </div>
      )}
      
      {story && (
        <div className="mt-6 p-4 bg-indigo-50/80 rounded-lg shadow-lg border border-purple-100">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold font-story text-purple-800">Your Story</h3>
            {audioUrl && (
              <button
                onClick={togglePlayback}
                className="flex items-center gap-2 text-purple-600 hover:text-yellow-600 transition-colors font-bold"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-5 w-5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span>Play</span>
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-indigo-900 leading-relaxed">{story}</p>
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default EmotionStory; 