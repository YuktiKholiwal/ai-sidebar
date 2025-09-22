# AI Assistant Sidebar Extension 🤖

A Chrome extension that provides an AI chatbot sidebar with support for multiple AI models through OpenRouter. Chat with AI while browsing any website!

![AI Assistant Screenshot](https://via.placeholder.com/800x500/000000/FFFFFF?text=AI+Assistant+Sidebar+Screenshot)

## ✨ Features

### 🆓 **Free & Paid Models**
- **5 Free Models**: Llama 3.1 8B, Gemma 2 9B, Phi-3 Mini, Mist

ral 7B, and more
- **Premium Models**: GPT-4o, Claude 3.5 Sonnet, GPT-4o Mini
- **Smart Model Selection**: Automatic fallback to vision-capable models for images

### 💬 **Advanced Chat Features**
- **Conversation Memory**: AI remembers previous messages in context
- **Markdown Support**: Code highlighting, tables, lists, and more
- **Collapsible Code Blocks**: Clean, organized code display
- **Copy Code**: One-click code copying with visual feedback

### 🖼️ **Vision Capabilities**
- **Screen Capture**: Ask AI about what's on your screen
- **Image Analysis**: Upload or capture images for AI analysis
- **Auto Model Switch**: Automatically uses vision-capable models for images

### 🎨 **Clean UI**
- **Dark Theme**: Eye-friendly design
- **Compact Layout**: Perfect for sidebar usage
- **Responsive Design**: Works on all screen sizes
- **Icon-based Controls**: Material Design inspired interface

## 🚀 Quick Start

### Prerequisites
- Chrome browser (version 88+)
- OpenRouter API key ([Get one free](https://openrouter.ai/))

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/ai-assistant-sidebar.git
   cd ai-assistant-sidebar/extension
   ```

2. **Add Your API Key**
   - Open `app.js`
   - Replace the API key on line 48:
   ```javascript
   this.API_KEY = "your-openrouter-api-key-here";
   ```

3. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `extension` folder

4. **Start Chatting!**
   - Click the extension icon in your toolbar
   - Select a free model (🆓 icon)
   - Start chatting with AI

## 🔧 Configuration

### Getting an OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a free account
3. Go to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy and paste it into `app.js`

### Available Models

#### 🆓 Free Models (No Cost)
- **Llama 3.1 8B** - Meta's latest open model
- **Gemma 2 9B** - Google's efficient model
- **Phi-3 Mini** - Microsoft's compact model
- **Gemma 7B** - Google's versatile model
- **Mistral 7B** - Mistral's open model

#### 💰 Premium Models (Paid)
- **GPT-4o** - OpenAI's latest flagship model
- **GPT-4o Mini** - Fast, vision-capable model
- **Claude 3.5 Sonnet** - Anthropic's advanced model

### Model Selection

The extension automatically:
- Defaults to free models
- Shows cost indicators (🆓 for free, 💰 for paid)
- Switches to vision models when using screen capture
- Filters conversation history based on model capabilities

## 📁 Project Structure

```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker
├── sidepanel.html         # Main UI and styles
├── app.js                # Core application logic
├── icons/                # Extension icons
└── README.md             # This file
```

## 🛠️ Development

### Key Files

- **`app.js`**: Main application logic, API calls, and UI management
- **`sidepanel.html`**: HTML structure and CSS styles
- **`background.js`**: Chrome extension service worker
- **`manifest.json`**: Extension permissions and configuration

### Code Architecture

The extension uses vanilla JavaScript with a React-like component structure:

```javascript
class AIAssistantApp {
  constructor() {
    this.state = {
      messages: [],
      selectedModel: 'meta-llama/llama-3.1-8b-instruct:free',
      loading: false
    };
  }

  // React-style lifecycle methods
  init() { /* Initialize app */ }
  render() { /* Update UI */ }
  setState(newState) { /* Update state */ }
}
```

### Adding New Models

To add a new model:

1. Add it to the `models` array in the constructor:
```javascript
this.models = [
  { value: 'new-model-id', label: '🆓 New Model (Free)' },
  // ... existing models
];
```

2. Update the vision model detection if it supports images:
```javascript
function isVisionCapableModel(modelName) {
  const visionModels = [
    'new-vision-model-id',
    // ... existing vision models
  ];
}
```

### Contributing

We welcome contributions! Here's how to get started:

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Your Changes**
4. **Test Thoroughly**
5. **Submit a Pull Request**

#### Contribution Guidelines

- Follow existing code style and patterns
- Test with both free and paid models
- Ensure vision/non-vision model compatibility
- Update README if adding new features
- Add comments for complex logic

## 🔒 Privacy & Security

- **Local Storage**: Messages are stored locally in your browser
- **No Data Collection**: We don't collect or store your conversations
- **API Key Security**: Your API key stays in your browser
- **HTTPS Only**: All API calls use secure connections

## 🐛 Troubleshooting

### Common Issues

#### "API Error 404: No endpoints found that support image input"
- **Cause**: Trying to send images to a non-vision model
- **Solution**: The extension now automatically handles this. Update to latest version.

#### "Invalid API Key"
- **Cause**: Incorrect or missing OpenRouter API key
- **Solution**: Check your API key in `app.js` line 48

#### Extension not loading
- **Cause**: Developer mode not enabled or wrong folder selected
- **Solution**: Enable developer mode and select the `extension` folder

#### Model not responding
- **Cause**: API quota exceeded or model unavailable
- **Solution**: Try a different model or check OpenRouter status

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-assistant-sidebar/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-assistant-sidebar/discussions)
- **OpenRouter Support**: [OpenRouter Discord](https://discord.gg/openrouter)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are what make the open source community amazing! Any contributions you make are **greatly appreciated**.

### Development Setup

1. Fork the project
2. Clone your fork: `git clone https://github.com/yourusername/ai-assistant-sidebar.git`
3. Install dependencies: None needed! Pure vanilla JavaScript
4. Make changes and test locally
5. Submit a pull request

### Feature Requests

Have an idea? We'd love to hear it!
- [Open an issue](https://github.com/yourusername/ai-assistant-sidebar/issues/new?template=feature_request.md)
- Describe your idea and use case
- We'll discuss and potentially implement it

## ⭐ Show Your Support

If this project helped you, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🔀 Contributing code
- 📢 Sharing with others

## 📊 Roadmap

### Upcoming Features
- [ ] **Custom API Endpoints**: Support for other AI providers
- [ ] **Chat Export**: Save conversations as markdown/PDF
- [ ] **Conversation Branching**: Multiple conversation threads
- [ ] **Voice Input**: Speech-to-text support
- [ ] **Custom Themes**: Light mode and custom color schemes
- [ ] **Keyboard Shortcuts**: Quick actions and navigation
- [ ] **Message Search**: Find specific messages in history
- [ ] **Team Sharing**: Share conversations with team members

### v2.0 Goals
- [ ] **SaaS Platform**: Web-based version with user accounts
- [ ] **Usage Analytics**: Track API usage and costs
- [ ] **Model Recommendations**: AI-powered model suggestions
- [ ] **Advanced Prompting**: Built-in prompt templates

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for providing access to multiple AI models
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/) for the platform
- All contributors who help improve this project
- The open source community for inspiration and support

---

**Made with ❤️ by the AI Assistant Community**

*Star this repo if you found it useful! 🌟*