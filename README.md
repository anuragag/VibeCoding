# 🎙️ VibeCoding - Voice Cortex Agent

A mobile-friendly web application that integrates speech-to-text capabilities with Snowflake's Cortex Agents API, enabling voice-based interactions with AI agents. Inspired by Google's Gemini Live experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Platform](https://img.shields.io/badge/platform-web-orange.svg)

## ✨ Features

- 🎤 **Voice Input**: Real-time speech-to-text using Web Speech API
- 🌊 **Audio Visualization**: Dynamic voice activity visualization
- 📱 **Mobile-First Design**: Optimized for touch interfaces and mobile devices
- 🤖 **Snowflake Cortex Integration**: Connect to Snowflake Cortex Agents
- 💬 **Conversation History**: Track and display conversation context
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 🌙 **Dark Mode Support**: Automatic dark mode based on system preferences
- 🌍 **Multi-language Support**: Support for 10+ languages
- ⚡ **Real-time Processing**: Instant transcription and response
- 🔒 **Secure Configuration**: Settings stored locally in browser

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- A Snowflake account with Cortex enabled
- A modern web browser (Chrome, Edge, Safari, or Firefox)
- HTTPS connection (required for microphone access)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anuragag/VibeCoding.git
   cd VibeCoding
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (Optional)
   ```bash
   cp .env.example .env
   # Edit .env with your Snowflake credentials
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

   > **Note**: For microphone access, you may need to use `https://localhost:3000`. Consider using a tool like [mkcert](https://github.com/FiloSottile/mkcert) for local HTTPS.

## 📖 Usage

### Setting Up Snowflake Cortex Agent

1. **Create a Cortex Agent in Snowflake**
   ```sql
   -- Example: Create a database and schema for Cortex
   CREATE DATABASE IF NOT EXISTS CORTEX_DB;
   CREATE SCHEMA IF NOT EXISTS CORTEX_DB.AGENTS;

   -- Create a warehouse for compute
   CREATE WAREHOUSE IF NOT EXISTS COMPUTE_WH
     WITH WAREHOUSE_SIZE = 'XSMALL'
     AUTO_SUSPEND = 60
     AUTO_RESUME = TRUE;
   ```

2. **Configure the Application**
   - Click the settings icon (⚙️) in the top right
   - Enter your Snowflake credentials:
     - Account: `your-account.snowflakecomputing.com`
     - Username: Your Snowflake username
     - Password: Your Snowflake password
     - Warehouse: `COMPUTE_WH` (or your warehouse name)
     - Database: `CORTEX_DB` (or your database name)
     - Schema: `AGENTS` (or your schema name)
     - Agent Name: Name of your Cortex agent
   - Select your preferred speech language
   - Click "Save Settings"

3. **Start Speaking**
   - Tap the microphone button
   - Speak your query or command
   - The agent will respond with text

### Using the Application

#### Voice Commands
- **Tap Microphone**: Start/stop voice input
- **Ctrl+Space**: Toggle voice input (keyboard shortcut)
- **ESC**: Stop listening or close modals

#### Interface Elements
- **Microphone Button**: Large gradient button to control voice input
- **Status Indicator**: Shows current state (Ready/Listening/Processing)
- **Transcript Display**: Shows what you're saying in real-time
- **Audio Visualizer**: Visual feedback of voice activity
- **Message History**: Scrollable conversation view
- **Clear Button**: Reset conversation history
- **Settings Button**: Configure Snowflake connection

## 🏗️ Architecture

### Frontend
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with gradients, animations, and flexbox
- **Vanilla JavaScript**: No framework dependencies
- **Web Speech API**: Built-in browser speech recognition

### Backend
- **Node.js**: Runtime environment
- **Express**: Web server framework
- **Snowflake SDK**: Official Snowflake connector
- **CORS**: Cross-origin resource sharing

### Data Flow
```
User Voice → Web Speech API → Transcript
     ↓
Frontend (app.js) → HTTP POST
     ↓
Backend (server.js) → Snowflake SDK
     ↓
Snowflake Cortex Agent → AI Response
     ↓
Backend → Frontend → Display to User
```

## 📱 Mobile Support

The application is optimized for mobile devices:

- **Touch-friendly**: Large tap targets
- **Responsive**: Adapts to all screen sizes
- **PWA-ready**: Can be installed on mobile devices
- **Performance**: Optimized for mobile networks
- **Gestures**: Supports touch gestures

### Testing on Mobile

1. **Local Network**
   - Find your computer's local IP (e.g., `192.168.1.100`)
   - Access from mobile: `http://192.168.1.100:3000`

2. **Using ngrok** (for HTTPS)
   ```bash
   npx ngrok http 3000
   ```
   - Use the provided HTTPS URL on your mobile device

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
SNOWFLAKE_ACCOUNT=your-account.snowflakecomputing.com
SNOWFLAKE_USERNAME=your-username
SNOWFLAKE_PASSWORD=your-password
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=CORTEX_DB
SNOWFLAKE_SCHEMA=AGENTS
SNOWFLAKE_AGENT=MY_AGENT
PORT=3000
```

### Browser Settings

The application uses `localStorage` to save settings:
- Settings persist across sessions
- No data is sent to external servers (except Snowflake)
- Clear browser data to reset settings

## 🎨 Customization

### Styling

Edit `styles.css` to customize:
- Color scheme (CSS variables in `:root`)
- Animations and transitions
- Layout and spacing
- Dark mode behavior

### Languages

Supported languages in the settings:
- English (US, UK)
- Spanish, French, German, Italian
- Portuguese (Brazil)
- Japanese, Korean, Chinese

Add more in `index.html`:
```html
<option value="your-lang-code">Your Language</option>
```

## 🔒 Security Considerations

### Production Deployment

For production use:

1. **Never expose credentials in frontend**
   - Use environment variables
   - Implement proper authentication
   - Use OAuth or JWT tokens

2. **HTTPS Required**
   - Microphone access requires HTTPS
   - Use SSL certificates
   - Consider using a reverse proxy (nginx, Apache)

3. **Rate Limiting**
   - Implement API rate limiting
   - Add request throttling
   - Monitor usage

4. **Input Validation**
   - Sanitize all user inputs
   - Validate Snowflake responses
   - Implement XSS protection

## 🐛 Troubleshooting

### Common Issues

**Microphone not working**
- Ensure HTTPS connection
- Check browser permissions
- Verify microphone is not used by another app

**Cannot connect to Snowflake**
- Verify credentials in settings
- Check network connectivity
- Ensure Snowflake account is active
- Verify warehouse is running

**No speech recognition**
- Use Chrome, Edge, or Safari (best support)
- Check language settings
- Ensure you're speaking clearly

**CORS errors**
- Ensure server is running
- Check CORS configuration in `server.js`
- Verify API endpoint URLs

### Debug Mode

Enable console logging:
```javascript
// In app.js, add at the top:
window.DEBUG = true;
```

## 📚 API Reference

### Backend Endpoints

#### POST `/api/cortex-agent`
Send a message to the Cortex agent.

**Request:**
```json
{
  "account": "your-account.snowflakecomputing.com",
  "username": "user",
  "password": "pass",
  "warehouse": "COMPUTE_WH",
  "database": "CORTEX_DB",
  "schema": "AGENTS",
  "agent": "MY_AGENT",
  "message": "Hello, agent!",
  "conversation": []
}
```

**Response:**
```json
{
  "success": true,
  "response": "Agent response here",
  "timestamp": "2025-11-16T10:30:00.000Z"
}
```

#### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-16T10:30:00.000Z"
}
```

#### POST `/api/test-connection`
Test Snowflake connectivity.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by Google's Gemini Live interface
- Built with Snowflake's Cortex AI
- Uses Web Speech API for voice recognition
- Icons from various open-source projects

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review Snowflake Cortex documentation

## 🗺️ Roadmap

- [ ] Add voice output (text-to-speech)
- [ ] Implement conversation export
- [ ] Add multiple agent support
- [ ] Create Progressive Web App (PWA)
- [ ] Add offline support
- [ ] Implement voice commands for app control
- [ ] Add conversation analytics
- [ ] Support for streaming responses
- [ ] Multi-modal input (voice + text)
- [ ] Integration with other AI models

---

Built with ❤️ using Snowflake Cortex and Web Speech API
