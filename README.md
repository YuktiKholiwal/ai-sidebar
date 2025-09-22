# AI Assistant Sidebar Extension 🤖

A powerful Chrome extension that provides an AI chatbot assistant in a convenient sidebar. Features multiple AI models, image analysis, and advanced conversation capabilities.

![AI Assistant Sidebar](https://img.shields.io/badge/Chrome-Extension-blue?logo=google-chrome)
![Version](https://img.shields.io/badge/version-1.2-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **Multiple AI Models**: Support for Grok, GPT-5, and Gemini models with vision capabilities
- **Image Analysis**: Capture screenshots and analyze them with AI
- **Smart Image Processing**: Auto-resize large images (max 1280px) for optimal performance
- **PII Redaction**: Optional privacy protection for sensitive information
- **One-Click Actions**: Copy answers and ask follow-ups with single clicks
- **Responsive Design**: Clean, dark theme with optimal readability (680px max-width)
- **Secure**: API keys stored locally, never shared or transmitted insecurely

## 🚀 Quick Start

### Prerequisites

- Google Chrome browser (version 88 or later)
- OpenRouter API key ([Get one here](https://openrouter.ai/keys))

### Installation

1. **Clone the repository**:
   ```bash
   [git clone https://github.com/yourusername/ai-assistant-sidebar.git](https://github.com/YuktiKholiwal/chatgpt-sidebar)
   cd ai-assistant-sidebar
   ```

2. **Load the extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `extension` folder from this project

3. **Set up your API key**:
   - Click the extension icon in Chrome's toolbar
   - When prompted, enter your OpenRouter API key
   - The key will be stored securely in your browser's local storage

### Getting an API Key

1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the key and paste it when the extension prompts you

## 🎯 Usage

### Basic Chat
- Click the extension icon to open the sidebar
- Type your message and press Enter or click Send
- Choose from multiple AI models using the model selector

### Image Analysis
1. Enable "Capture Mode" in the header
2. Type your message about what you want to analyze
3. Send - the extension will automatically capture your screen
4. Review the thumbnail and use Replace/Open/Remove actions as needed
5. AI will analyze the screenshot and respond

### Privacy Features
- **PII Redaction**: Toggle the 🔒 button to mask sensitive information
- **Local Storage**: All data stays on your device
- **Secure API**: Keys stored locally, transmitted only to OpenRouter

## 🛠️ Development

### Project Structure
```
ai-assistant-sidebar/
├── extension/
│   ├── manifest.json          # Extension configuration
│   ├── background.js          # Service worker
│   ├── sidepanel.html         # Main UI with embedded CSS
│   ├── app.js                 # Application logic
│   └── README.md              # Extension-specific docs
├── .gitignore                 # Git ignore rules
├── LICENSE                    # MIT license
└── README.md                  # This file
```

### Building from Source

1. **Clone and setup**:
   ```bash
   git clone https://github.com/yourusername/ai-assistant-sidebar.git
   cd ai-assistant-sidebar
   ```

2. **No build step required** - the extension uses vanilla JavaScript

3. **Load in Chrome** as described in the installation section

### Making Changes

- Edit files in the `extension/` folder
- Reload the extension in `chrome://extensions/` to see changes
- Use Chrome DevTools for debugging (right-click sidebar → Inspect)

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Ways to Contribute

- 🐛 **Bug Reports**: Found an issue? [Open a bug report](https://github.com/yourusername/ai-assistant-sidebar/issues)
- 💡 **Feature Requests**: Have an idea? [Suggest a feature](https://github.com/yourusername/ai-assistant-sidebar/issues)
- 🔧 **Code Contributions**: Submit pull requests for improvements
- 📚 **Documentation**: Help improve our docs
- 🌍 **Translations**: Add support for more languages

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to your fork**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Code Style

- Use meaningful variable and function names
- Add comments for complex logic
- Follow the existing code style
- Test your changes thoroughly

## 📋 API Models Supported

| Model | Provider | Vision Support | Type |
|-------|----------|----------------|------|
| Grok 4 Fast | x.ai | ✅ | Free |
| GPT-5 | OpenAI | ✅ | Premium |
| GPT-5 Mini | OpenAI | ✅ | Premium |
| Gemini Pro 1.5 | Google | ✅ | Premium |
| Gemini Flash 1.5 | Google | ✅ | Premium |
| Gemini 2.0 Flash | Google | ✅ | Premium |

## 🔒 Privacy & Security

- **Local Storage**: All conversations and settings stored locally
- **No Data Collection**: We don't collect or store any user data
- **Secure API**: Your API key is stored securely in Chrome's storage
- **Optional PII Redaction**: Protect sensitive information in screenshots
- **Open Source**: Full transparency - inspect the code yourself

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**Extension won't load**:
- Ensure you're loading the `extension` folder, not the root directory
- Check that Developer mode is enabled in Chrome

**API key prompt keeps appearing**:
- Make sure you entered a valid OpenRouter API key
- Check your internet connection

**Screenshots not working**:
- Ensure the extension has permission to capture tabs
- Try refreshing the page and capturing again

**Model not responding**:
- Check your API key balance at OpenRouter
- Try switching to a different model

### Getting Help

- 📖 Check the [Issues](https://github.com/yourusername/ai-assistant-sidebar/issues) page
- 💬 Start a [Discussion](https://github.com/yourusername/ai-assistant-sidebar/discussions)
- 📧 Contact the maintainers

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for providing AI model APIs
- The open-source community for inspiration and contributions
- Chrome Extensions team for the excellent API documentation

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/ai-assistant-sidebar?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/ai-assistant-sidebar?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/ai-assistant-sidebar)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/ai-assistant-sidebar)

---

Made with ❤️ by the open-source community. Star ⭐ this repo if you find it helpful!
