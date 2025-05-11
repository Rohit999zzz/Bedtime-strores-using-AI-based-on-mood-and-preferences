from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from transformers import BertTokenizer, BertForSequenceClassification
import torch
import numpy as np
from google.generativeai import GenerativeModel, configure
from elevenlabs import generate, play, set_api_key
import os
from dotenv import load_dotenv
import tempfile

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
configure(api_key='api_key')
model = GenerativeModel('gemini-2.0-flash')

# Configure ElevenLabs
set_api_key(os.getenv("ELEVENLABS_API_KEY"))

# Load trained model and tokenizer
emotion_model = BertForSequenceClassification.from_pretrained("./text_emotion_model")
tokenizer = BertTokenizer.from_pretrained("./text_emotion_model")
emotion_model.eval()

# Define label mapping
emotion_labels = ["anger", "fear", "joy", "love", "neutral", "sadness", "surprise"]

def predict_emotion(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
    with torch.no_grad():
        outputs = emotion_model(**inputs)
    prediction = torch.argmax(outputs.logits, dim=1).item()
    return emotion_labels[prediction]

def generate_story(emotion):
    prompt = f"""Create a short, engaging story that reflects the emotion of {emotion}. 
    The story should be uplifting and meaningful, helping the reader process and understand this emotion.
    Make it around 4-5 sentences long, with a positive message or lesson at the end.
    Keep the tone appropriate for all ages."""
    
    response = model.generate_content(prompt)
    return response.text

def generate_audio(text):
    # Generate audio using ElevenLabs
    audio = generate(
        text=text,
        voice="Rachel",  # You can change this to any available voice
        model="eleven_multilingual_v2"
    )
    
    # Save to temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
    temp_file.write(audio)
    temp_file.close()
    
    return temp_file.name

@app.route('/detect-emotion', methods=['POST'])
def detect_emotion():
    data = request.json
    text = data.get('text', '')
    emotion = predict_emotion(text)
    return jsonify({'emotion': emotion})

@app.route('/generate-story', methods=['POST'])
def generate_story_endpoint():
    data = request.json
    emotion = data.get('emotion', 'neutral')
    story = generate_story(emotion)
    
    # Generate audio for the story
    audio_path = generate_audio(story)
    
    return jsonify({
        'story': story,
        'audio_url': f'/audio/{os.path.basename(audio_path)}'
    })

@app.route('/audio/<filename>')
def get_audio(filename):
    return send_file(
        os.path.join(tempfile.gettempdir(), filename),
        mimetype='audio/mpeg'
    )

if __name__ == '__main__':
    app.run(debug=True) 
