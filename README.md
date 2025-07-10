# EmoDetc - Real-time Chat with Emotion Detection

EmoDetc is a real-time chat application that detects emotions from text messages. It analyzes the sentiment of messages in Indonesian language, translates them to English for analysis, and displays the detected emotion (happy, sad, angry, or neutral) with corresponding emojis.

## Features

- Real-time messaging with Socket.IO
- Emotion detection from text
- Support for Indonesian language (auto-detection)
- Modern and responsive UI
- User authentication (username)
- Online user list
- Mobile-friendly design

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Real-time**: Socket.IO
- **Sentiment Analysis**: `sentiment` library with custom dictionaries
- **Translation**: `google-translate-api-x`

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/emodetc.git
   cd emodetc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit: [http://localhost:3000](http://localhost:3000)

## Usage

1. Enter your username when prompted
2. Start chatting! The app will automatically detect emotions from your messages
3. See detected emotions as emojis next to messages

## Project Structure

```
public/
  ├── css/
  │   └── style.css       # Main stylesheet
  ├── js/
  │   └── chat.js        # Client-side JavaScript
  ├── home.html           # Landing page
  ├── chat.html           # Chat interface
  └── index.html          # Redirects to home.html
server.js                # Express server and Socket.IO setup
package.json             # Project dependencies and scripts
README.md                # This file
```

## How It Works

1. When a user sends a message:
   - The client sends the message to the server via Socket.IO
   - The server checks if the message is in Indonesian
   - If needed, it translates the message to English
   - The sentiment analysis is performed on the message
   - The emotion is determined based on the sentiment score and keywords
   - The message is broadcast to all connected clients with emotion data
   - The client displays the message with an appropriate emoji

## Customization

### Adding More Emotions

You can customize the emotion detection by modifying the sentiment analysis in `server.js`. The current emotions are:

- 😊 Happy (positive sentiment)
- 😢 Sad (slightly negative sentiment)
- 😠 Angry (very negative sentiment or specific keywords)
- 😐 Neutral (neutral sentiment)

### Styling

All styles are in `public/css/style.css`. You can customize colors, spacing, and other visual aspects there.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Socket.IO](https://socket.io/) for real-time communication
- [Sentiment](https://github.com/thisandagain/sentiment) for sentiment analysis
- [Google Translate API](https://github.com/iamtraction/google-translate) for translation
- [Font Awesome](https://fontawesome.com/) for icons

---

Created with ❤️ for Rekaya Perangkat Lunak
