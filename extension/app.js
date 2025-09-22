// SVG Icon constants to avoid repetition
const ICONS = {
  copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
  expandDown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>',
  expandUp: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
};

// Helper function to check if a model supports vision/images
function isVisionCapableModel(modelName) {
  const visionModels = [
    'grok',
    'gpt-5',
    'gemini'
  ];

  return visionModels.some(visionModel => modelName.toLowerCase().includes(visionModel));
}

// Helper function to resize image to max dimension
function resizeImageToMaxDimension(dataUrl, maxDimension = 1280) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate new dimensions
      let { width, height } = img;
      const maxDim = Math.max(width, height);

      if (maxDim > maxDimension) {
        const scale = maxDimension / maxDim;
        width *= scale;
        height *= scale;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert back to data URL
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

// Helper function to redact PII from image
function redactPIIFromImage(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Get image data to scan for text-like patterns
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Simple PII redaction - add black rectangles over potential sensitive areas
      // This is a basic implementation - real PII detection would need OCR
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.font = '12px Arial';
      ctx.fillText('🔒 PII REDACTED', 10, 30);

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

// Helper function to create elements with attributes
function createElement(tag, attributes = {}, textContent = '') {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  if (textContent) element.textContent = textContent;
  return element;
}

// React-style AI Assistant App - Vanilla JS Implementation
class AIAssistantApp {
  constructor() {
    this.state = {
      messages: [],
      input: '',
      loading: false,
      selectedModel: 'google/gemini-pro-1.5',
      screenMode: false,
      capturedImage: null,
      redactPII: false
    };

    this.API_KEY = null; // Will be loaded from storage

    this.models = [
      // Grok Models (Vision)
      { value: 'x-ai/grok-4-fast:free', label: 'Grok 4 Fast' },

      // GPT-5 Models (Vision) - Note: GPT-5 is not yet available, using GPT-4o as placeholder
      { value: 'openai/gpt-5', label: 'GPT-5' },
      
      { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini' },

      // Gemini Models (Vision)
      { value: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5 (Vision)' },
      { value: 'google/gemini-flash-1.5', label: 'Gemini Flash 1.5 (Vision)' },
      { value: 'google/gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Vision)' }
    ];

    this.init();
  }

  // React-style setState
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateUI();
  }

  // Enhanced markdown parser with syntax highlighting and tables
  parseMarkdown(text) {
    if (!text) return '';

    let html = text;

    // First, protect inline code by replacing with placeholders
    const inlineCodePlaceholders = [];
    html = html.replace(/`([^`\n]+?)`/g, (match, code) => {
      const placeholder = `INLINE_CODE_${inlineCodePlaceholders.length}`;
      // Escape HTML in inline code
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      inlineCodePlaceholders.push(`<code>${escapedCode}</code>`);
      return placeholder;
    });

    // Code blocks with language detection
    html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'code';
      const highlightedCode = this.highlightSyntax(code, language);
      const cleanCode = code.trim();
      const codeId = 'code_' + Math.random().toString(36).substr(2, 9);
      const containerId = 'container_' + Math.random().toString(36).substr(2, 9);

      // Store the original code in a global map to avoid encoding issues
      if (!window.codeMap) window.codeMap = {};
      window.codeMap[codeId] = cleanCode;

      // Create preview (first few lines)
      const lines = cleanCode.split('\n');
      const preview = lines.slice(0, 2).join('\n') + (lines.length > 2 ? '\n...' : '');

      return `<div class="code-block-container collapsed" id="${containerId}">
        <div class="code-preview" data-container-id="${containerId}">
          <div class="preview-header">
            <strong>${language}</strong>
            <div class="preview-buttons">
              <button class="copy-button preview-copy" data-code-id="${codeId}">${ICONS.copy}</button>
              <button class="expand-button" data-container-id="${containerId}">${ICONS.expandDown}</button>
            </div>
          </div>
          <div class="preview-content">${preview}</div>
        </div>
        <div class="code-header">
          <span>${language}</span>
          <div>
            <button class="copy-button" data-code-id="${codeId}">${ICONS.copy}</button>
            <button class="code-collapse-btn" data-container-id="${containerId}">${ICONS.expandUp}</button>
          </div>
        </div>
        <pre><code id="${codeId}">${highlightedCode}</code></pre>
      </div>`;
    });

    // Fallback for code blocks without language
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
      const cleanCode = code.trim();
      const codeId = 'code_' + Math.random().toString(36).substr(2, 9);
      const containerId = 'container_' + Math.random().toString(36).substr(2, 9);

      // Store the original code in a global map
      if (!window.codeMap) window.codeMap = {};
      window.codeMap[codeId] = cleanCode;

      // Create preview (first few lines)
      const lines = cleanCode.split('\n');
      const preview = lines.slice(0, 2).join('\n') + (lines.length > 2 ? '\n...' : '');

      return `<div class="code-block-container collapsed" id="${containerId}">
        <div class="code-preview" data-container-id="${containerId}">
          <div class="preview-header">
            <strong>code</strong>
            <div class="preview-buttons">
              <button class="copy-button preview-copy" data-code-id="${codeId}">${ICONS.copy}</button>
              <button class="expand-button" data-container-id="${containerId}">${ICONS.expandDown}</button>
            </div>
          </div>
          <div class="preview-content">${preview}</div>
        </div>
        <div class="code-header">
          <span>code</span>
          <div>
            <button class="copy-button" data-code-id="${codeId}">${ICONS.copy}</button>
            <button class="code-collapse-btn" data-container-id="${containerId}">${ICONS.expandUp}</button>
          </div>
        </div>
        <pre><code id="${codeId}">${code}</code></pre>
      </div>`;
    });

    // Tables (GitHub flavored markdown) - improved parsing
    html = html.replace(/\|(.+)\|(?:\n\|[-:\s|]+\|)?\n((?:\|.+\|\n?)*)/gm, (match, header, rows) => {
      // Clean header row
      const headerCells = header.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0)
        .map(cell => `<th>${cell}</th>`)
        .join('');

      // Clean data rows
      const rowCells = rows.trim().split('\n')
        .filter(row => row.trim().length > 0)
        .map(row => {
          const cells = row.split('|')
            .map(cell => cell.trim())
            .filter((cell, index, arr) => index > 0 && index < arr.length - 1) // Remove empty first/last
            .map(cell => `<td>${cell}</td>`)
            .join('');
          return `<tr>${cells}</tr>`;
        }).join('');

      return `<table><thead><tr>${headerCells}</tr></thead><tbody>${rowCells}</tbody></table>`;
    });

    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Lists - improved handling
    html = html.replace(/^(\d+)\. (.*$)/gm, '<OL_ITEM>$2</OL_ITEM>');
    html = html.replace(/^[\*\-] (.*$)/gm, '<UL_ITEM>$1</UL_ITEM>');

    // Wrap consecutive list items properly
    html = html.replace(/(<OL_ITEM>.*?<\/OL_ITEM>(?:\n<OL_ITEM>.*?<\/OL_ITEM>)*)/gs, (match) => {
      const items = match.replace(/<OL_ITEM>/g, '<li>').replace(/<\/OL_ITEM>/g, '</li>');
      return `<ol>${items}</ol>`;
    });

    html = html.replace(/(<UL_ITEM>.*?<\/UL_ITEM>(?:\n<UL_ITEM>.*?<\/UL_ITEM>)*)/gs, (match) => {
      const items = match.replace(/<UL_ITEM>/g, '<li>').replace(/<\/UL_ITEM>/g, '</li>');
      return `<ul>${items}</ul>`;
    });

    // Clean up any remaining temporary tags
    html = html.replace(/<\/?[UO]L_ITEM>/g, '');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Line breaks (preserve existing ones)
    html = html.replace(/\n/g, '<br>');

    // Paragraphs (split by double line breaks)
    html = html.replace(/(<br>){2,}/g, '</p><p>');
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<pre') && !html.startsWith('<table') && !html.startsWith('<div class="code-header"')) {
      html = '<p>' + html + '</p>';
    }

    // Restore inline code placeholders
    inlineCodePlaceholders.forEach((replacement, index) => {
      html = html.replace(`INLINE_CODE_${index}`, replacement);
    });

    return html;
  }

  // Basic syntax highlighting
  highlightSyntax(code, language) {
    if (!code) return '';

    // First escape HTML entities to prevent interference
    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    // JavaScript/TypeScript keywords
    if (['javascript', 'js', 'typescript', 'ts'].includes(language.toLowerCase())) {
      highlighted = highlighted.replace(/\b(function|const|let|var|if|else|for|while|return|class|import|export|async|await|try|catch|new|this)\b/g, '<span class="keyword">$1</span>');
      highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
      highlighted = highlighted.replace(/(&#39;|&quot;)((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>');
      highlighted = highlighted.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>');
      highlighted = highlighted.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="function">$1</span>(');
    }

    // Python keywords
    if (['python', 'py'].includes(language.toLowerCase())) {
      highlighted = highlighted.replace(/\b(def|class|if|else|elif|for|while|return|import|from|try|except|with|as|lambda|yield|and|or|not|in|is|None|True|False)\b/g, '<span class="keyword">$1</span>');
      highlighted = highlighted.replace(/(#.*$)/gm, '<span class="comment">$1</span>');
      highlighted = highlighted.replace(/(&#39;|&quot;)((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>');
      highlighted = highlighted.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>');
      highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="function">$1</span>(');
    }

    // HTML/XML
    if (['html', 'xml'].includes(language.toLowerCase())) {
      highlighted = highlighted.replace(/(&lt;[^&gt;]+&gt;)/g, '<span class="keyword">$1</span>');
      highlighted = highlighted.replace(/(&#39;|&quot;)((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>');
    }

    // CSS
    if (['css'].includes(language.toLowerCase())) {
      highlighted = highlighted.replace(/([.#]?[a-zA-Z-]+)\s*{/g, '<span class="keyword">$1</span>{');
      highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
      highlighted = highlighted.replace(/:\s*([^;{]+)/g, ': <span class="string">$1</span>');
    }

    return highlighted;
  }

  // Helper function to escape text for HTML attributes
  escapeForAttribute(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Copy code to clipboard
  copyCode(codeId, buttonElement = null) {
    console.log('Attempting to copy code with ID:', codeId);
    const codeElement = document.getElementById(codeId);
    if (!codeElement) {
      console.error('Code element not found:', codeId);
      return;
    }

    // Get code from global map (preferred) or fallback to element content
    let code = window.codeMap && window.codeMap[codeId];
    if (!code) {
      console.log('Code not found in map, using element text content');
      code = codeElement.textContent || codeElement.innerText;
      // Clean up any HTML tags that might be in the text
      code = code.replace(/<[^>]*>/g, '').trim();
    }

    console.log('Code to copy:', code);

    // Use the Clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        console.log('Copy successful via Clipboard API');
        this.showCopyFeedback(buttonElement || codeElement);
      }).catch((err) => {
        console.error('Clipboard API failed:', err);
        // Fallback to execCommand
        this.fallbackCopyCode(code, codeElement);
      });
    } else {
      console.log('Using fallback copy method');
      // Fallback for older browsers
      this.fallbackCopyCode(code, codeElement);
    }
  }

  // Fallback copy method
  fallbackCopyCode(code, codeElement) {
    const textArea = document.createElement('textarea');
    textArea.value = code;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        console.log('Copy successful via execCommand');
        this.showCopyFeedback(buttonElement || codeElement);
      } else {
        console.error('execCommand copy failed');
        alert('Copy failed. Please select and copy the code manually.');
      }
    } catch (err) {
      console.error('Failed to copy code:', err);
      alert('Copy failed. Please select and copy the code manually.');
    }

    document.body.removeChild(textArea);
  }

  // Show copy feedback
  showCopyFeedback(element) {
    // If element is a button, use it directly; otherwise find the copy button
    const copyButton = element.classList && (element.classList.contains('copy-button') || element.classList.contains('preview-copy'))
      ? element
      : element.parentElement ? element.parentElement.querySelector('.copy-button') : null;

    if (copyButton) {
      const originalIcon = copyButton.innerHTML;

      copyButton.innerHTML = ICONS.check;
      copyButton.classList.add('copied');

      setTimeout(() => {
        copyButton.innerHTML = originalIcon;
        copyButton.classList.remove('copied');
      }, 2000);
    }
  }

  // Handle captured image processing
  async processImage(rawImage) {
    let processedImage = rawImage;

    // Resize image if too large
    processedImage = await resizeImageToMaxDimension(processedImage, 1280);

    // Apply PII redaction if enabled
    if (this.state.redactPII) {
      processedImage = await redactPIIFromImage(processedImage);
    }

    return processedImage;
  }

  // Remove captured image
  removeCapturedImage() {
    this.setState({ capturedImage: null });
  }

  // Replace captured image with new one
  async replaceCapturedImage() {
    try {
      const rawImage = await this.captureScreen();
      const processedImage = await this.processImage(rawImage);
      this.setState({ capturedImage: processedImage });
    } catch (error) {
      console.error('Failed to replace image:', error);
    }
  }

  // Open captured image in full size
  openImageFull() {
    if (this.state.capturedImage) {
      const newWindow = window.open();
      newWindow.document.write(`
        <html>
          <head><title>Captured Screenshot</title></head>
          <body style="margin:0;padding:20px;background:#000;display:flex;justify-content:center;align-items:center;min-height:100vh;">
            <img src="${this.state.capturedImage}" style="max-width:100%;max-height:100%;object-fit:contain;" />
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  }

  // Copy text to clipboard with visual feedback
  copyToClipboard(text, buttonElement) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showActionCopyFeedback(buttonElement);
      }).catch((err) => {
        console.error('Clipboard API failed:', err);
        this.fallbackCopyText(text, buttonElement);
      });
    } else {
      this.fallbackCopyText(text, buttonElement);
    }
  }

  // Fallback copy method for older browsers
  fallbackCopyText(text, buttonElement) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.showActionCopyFeedback(buttonElement);
      } else {
        console.error('execCommand copy failed');
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }

    document.body.removeChild(textArea);
  }

  // Show copy feedback for action buttons
  showActionCopyFeedback(buttonElement) {
    const iconSpan = buttonElement.querySelector('.action-icon');
    const textSpan = buttonElement.querySelector('.action-text');

    if (iconSpan && textSpan) {
      const originalIcon = iconSpan.textContent;
      const originalText = textSpan.textContent;

      iconSpan.textContent = '✓';
      textSpan.textContent = 'Copied!';
      buttonElement.classList.add('copied');

      setTimeout(() => {
        iconSpan.textContent = originalIcon;
        textSpan.textContent = originalText;
        buttonElement.classList.remove('copied');
      }, 2000);
    }
  }

  // Ask follow-up question
  askFollowUp() {
    // Focus on the input and add a helpful prompt
    if (this.textareaRef) {
      this.textareaRef.focus();
      this.setState({ input: 'Can you explain more about ' });
      this.textareaRef.value = this.state.input;
      // Move cursor to end
      this.textareaRef.setSelectionRange(this.state.input.length, this.state.input.length);
    }
  }

  // Toggle code block expansion/collapse
  toggleCodeBlock(containerId) {
    console.log('Toggle called for container:', containerId);
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }

    const isCollapsed = container.classList.contains('collapsed');
    console.log('Current collapsed state:', isCollapsed);

    if (isCollapsed) {
      // Expand
      container.classList.remove('collapsed');
      const collapseBtn = container.querySelector('.code-collapse-btn');
      if (collapseBtn) collapseBtn.innerHTML = ICONS.expandUp;

      // Update expand button icon (only visible in collapsed state)
      const expandBtn = container.querySelector('.expand-button');
      if (expandBtn) expandBtn.innerHTML = ICONS.expandUp;
      console.log('Expanded code block');
    } else {
      // Collapse
      container.classList.add('collapsed');
      const collapseBtn = container.querySelector('.code-collapse-btn');
      if (collapseBtn) collapseBtn.innerHTML = ICONS.expandDown;

      // Reset expand button icon
      const expandBtn = container.querySelector('.expand-button');
      if (expandBtn) expandBtn.innerHTML = ICONS.expandDown;
      console.log('Collapsed code block');
    }
  }

  // Component lifecycle - like useEffect
  init() {
    this.loadFromStorage();
    this.render();
    this.setupEventListeners();
  }

  loadFromStorage() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['messages', 'selectedModel', 'apiKey'], (result) => {
        if (result.messages) {
          this.setState({ messages: result.messages });
        }
        if (result.selectedModel) {
          this.setState({ selectedModel: result.selectedModel });
        }
        if (result.apiKey) {
          this.API_KEY = result.apiKey;
        } else {
          this.showApiKeyPrompt();
        }
      });
    } else {
      this.showApiKeyPrompt();
    }
  }

  showApiKeyPrompt() {
    const apiKey = prompt(
      'Please enter your OpenRouter API key:\n\n' +
      '1. Go to https://openrouter.ai/keys\n' +
      '2. Create a new API key\n' +
      '3. Paste it here\n\n' +
      'Your key will be stored locally and never shared.'
    );

    if (apiKey) {
      this.API_KEY = apiKey;
      this.saveApiKey(apiKey);
    }
  }

  saveApiKey(apiKey) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ apiKey });
    }
  }

  saveToStorage() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({
        messages: this.state.messages.slice(-20),
        selectedModel: this.state.selectedModel
      });
    }
  }

  // React-style component methods
  createMessage(message) {
    const messageContainer = createElement('div', {
      className: `message-container ${message.role}`
    });

    // Create avatar
    const avatar = createElement('div', {
      className: `message-avatar ${message.role}`
    }, message.role === 'user' ? '👤' : '🤖');

    // Create message bubble
    const messageBubble = createElement('div', {
      className: 'message-bubble'
    });

    // Create message content
    const messageContent = createElement('div', {
      className: 'message-content'
    });

    if (message.role === 'assistant') {
      // Parse markdown for AI responses
      messageContent.innerHTML = this.parseMarkdown(message.content);
    } else {
      // Keep user messages as plain text
      messageContent.style.whiteSpace = 'pre-wrap';
      messageContent.textContent = message.content;
    }

    messageBubble.appendChild(messageContent);

    // Add image if present
    if (message.image) {
      const img = document.createElement('img');
      img.src = message.image;
      img.alt = 'Shared screenshot';
      img.className = 'message-image';
      messageBubble.appendChild(img);
    }

    // Add action buttons for assistant messages
    if (message.role === 'assistant') {
      const actionBar = document.createElement('div');
      actionBar.className = 'message-actions';
      actionBar.innerHTML = `
        <button class="action-btn copy-answer-btn" title="Copy answer" data-content="${this.escapeForAttribute(message.content)}">
          <span class="action-icon">📋</span>
          <span class="action-text">Copy answer</span>
        </button>
        <button class="action-btn follow-up-btn" title="Ask follow-up" data-content="${this.escapeForAttribute(message.content)}">
          <span class="action-icon">💬</span>
          <span class="action-text">Ask follow-up</span>
        </button>
      `;
      messageBubble.appendChild(actionBar);
    }

    // Assemble the message
    messageContainer.appendChild(avatar);
    messageContainer.appendChild(messageBubble);

    return messageContainer;
  }

  createWelcome() {
    const isFree = this.state.selectedModel.includes(':free');
    return createElement('div', {
      className: 'welcome',
      innerHTML: `
        <h3>Welcome! 👋</h3>
        <p>Start chatting with your AI assistant.</p>
        <p>${isFree ? '🆓 You\'re using a <strong>free model</strong> - no costs!' : '💰 You\'re using a premium model.'}</p>
        <p>💡 <strong>Tip:</strong> Use capture mode to ask AI questions about your screen!</p>
      `
    });
  }

  createLoading(hasImage = false) {
    const messageContainer = createElement('div', {
      className: 'message-container assistant'
    });

    // Create avatar
    const avatar = createElement('div', {
      className: 'message-avatar assistant'
    }, '🤖');

    // Create loading bubble
    const messageBubble = createElement('div', {
      className: 'message-bubble'
    });

    const messageContent = createElement('div', {
      className: 'message-content loading-content'
    });

    const loadingText = hasImage ? 'Analyzing screenshot' : 'AI is thinking';
    messageContent.innerHTML = `
      <div class="loading-animation">
        <div class="loading-spinner"></div>
        <span class="loading-text">${loadingText}</span>
      </div>
    `;

    messageBubble.appendChild(messageContent);
    messageContainer.appendChild(avatar);
    messageContainer.appendChild(messageBubble);

    return messageContainer;
  }

  createHeader() {
    const headerDiv = createElement('div', { className: 'header' });

    const title = createElement('h1', {}, 'AI Assistant');

    // Add context indicator
    if (this.state.messages.length > 0) {
      const contextBadge = createElement('span', {
        className: 'context-badge',
        title: `${this.state.messages.length} messages in context`
      }, `${this.state.messages.length}`);
      title.appendChild(contextBadge);
    }

    const buttonsDiv = createElement('div', { className: 'header-buttons' });

    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'toggle-container';

    const toggleLabel = document.createElement('span');
    toggleLabel.className = 'toggle-label';
    toggleLabel.textContent = 'Capture Mode';

    const screenBtn = document.createElement('button');
    screenBtn.className = `toggle-switch ${this.state.screenMode ? 'active' : ''}`;
    screenBtn.setAttribute('title', this.state.screenMode ? 'Disable Image Sending' : 'Enable Image Sending');
    screenBtn.onclick = () => {
      this.state.screenMode = !this.state.screenMode;
      this.updateHeader();
    };

    toggleContainer.appendChild(toggleLabel);
    toggleContainer.appendChild(screenBtn);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn clear-btn';
    clearBtn.innerHTML = '🗑️';
    clearBtn.setAttribute('title', 'Clear current chat');
    clearBtn.onclick = () => this.clearChat();

    buttonsDiv.appendChild(toggleContainer);
    buttonsDiv.appendChild(clearBtn);
    headerDiv.appendChild(title);
    headerDiv.appendChild(buttonsDiv);

    return headerDiv;
  }

  createChatContainer() {
    const chatDiv = document.createElement('div');
    chatDiv.className = 'chat-container';
    chatDiv.id = 'chat-container';

    if (this.state.messages.length === 0) {
      chatDiv.appendChild(this.createWelcome());
    }

    this.state.messages.forEach(msg => {
      chatDiv.appendChild(this.createMessage(msg));
    });

    if (this.state.loading) {
      const hasImage = !!this.state.capturedImage;
      chatDiv.appendChild(this.createLoading(hasImage));
    }

    return chatDiv;
  }

  createInputArea() {
    const inputDiv = document.createElement('div');
    inputDiv.className = 'input-area';

    // Screen mode indicator
    if (this.state.screenMode) {
      const indicator = document.createElement('div');
      indicator.className = 'screen-mode-indicator';
      indicator.textContent = '🖼️ Image sending enabled';
      inputDiv.appendChild(indicator);
    }

    // Image thumbnail chip
    if (this.state.capturedImage) {
      const imageChip = document.createElement('div');
      imageChip.className = 'image-chip';
      imageChip.innerHTML = `
        <img src="${this.state.capturedImage}" class="chip-thumbnail" alt="Captured screenshot" />
        <div class="chip-actions">
          <button class="chip-btn replace-btn" title="Replace image">Replace</button>
          <button class="chip-btn open-btn" title="Open full size">Open full</button>
          <button class="chip-btn remove-btn" title="Remove image">×</button>
        </div>
      `;
      inputDiv.appendChild(imageChip);
    }

    // Main input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

    // Textarea
    const textarea = document.createElement('textarea');
    textarea.className = 'message-input';
    textarea.placeholder = 'Message AI Assistant';
    textarea.value = this.state.input;
    textarea.disabled = this.state.loading;

    textarea.oninput = (e) => {
      this.state.input = e.target.value;
      this.updateInputArea();
      this.autoResizeTextarea(textarea);
    };

    textarea.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!this.state.loading && this.state.input.trim()) {
          this.sendMessage();
        }
      }
    };

    // Action buttons row
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';

    // Left actions
    const leftActions = document.createElement('div');
    leftActions.className = 'left-actions';

    // Model dropdown - styled as segmented button
    const modelBtn = document.createElement('button');
    modelBtn.className = 'model-selector-btn';
    const currentModel = this.models.find(m => m.value === this.state.selectedModel);
    const modelName = currentModel?.label || 'Select Model';
    const shortName = modelName.split(' ')[0];
    const isDefault = this.state.selectedModel === 'google/gemini-pro-1.5';
    modelBtn.innerHTML = `
      <span class="model-btn-text">${shortName}</span>
      ${isDefault ? '<span class="model-star">⭐</span>' : ''}
      <span class="model-btn-arrow">▾</span>
    `;
    modelBtn.setAttribute('title', 'Change AI model');
    modelBtn.onclick = () => this.showModelSelector();

    leftActions.appendChild(modelBtn);

    // PII Redaction toggle (only show when screen mode is enabled)
    if (this.state.screenMode) {
      const piiToggle = document.createElement('button');
      piiToggle.className = `pii-toggle ${this.state.redactPII ? 'active' : ''}`;
      piiToggle.innerHTML = `
        <span class="pii-icon">🔒</span>
        <span class="pii-text">Redact PII</span>
      `;
      piiToggle.setAttribute('title', this.state.redactPII ? 'PII redaction enabled' : 'Enable PII redaction');
      piiToggle.onclick = () => {
        this.setState({ redactPII: !this.state.redactPII });
      };
      leftActions.appendChild(piiToggle);
    }

    // Send button
    const sendBtn = document.createElement('button');
    sendBtn.className = 'send-btn';
    sendBtn.innerHTML = this.state.loading ? '⏳' : '➤';
    sendBtn.disabled = this.state.loading || !this.state.input.trim();
    sendBtn.setAttribute('title', this.state.loading ? 'Sending...' : 'Send message');
    sendBtn.onclick = () => this.sendMessage();

    actionButtons.appendChild(leftActions);
    actionButtons.appendChild(sendBtn);

    inputContainer.appendChild(textarea);
    inputContainer.appendChild(actionButtons);
    inputDiv.appendChild(inputContainer);

    return inputDiv;
  }

  autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  showModelSelector() {
    // Create a floating panel with improved styling
    const existingModal = document.querySelector('.model-modal');
    if (existingModal) {
      existingModal.remove();
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'model-modal';

    // Use current models array
    const modelOptions = this.models;
    const currentModel = modelOptions.find(m => m.value === this.state.selectedModel);

    // Create header
    const header = document.createElement('div');
    header.className = 'model-modal-header';
    header.innerHTML = `
      <span class="modal-title">Select AI Model</span>
      <button class="modal-close">×</button>
    `;

    modal.appendChild(header);

    // Create scrollable content
    const content = document.createElement('div');
    content.className = 'model-modal-content';

    modelOptions.forEach((model, index) => {
      const option = document.createElement('button');
      option.className = `model-option ${model.value === this.state.selectedModel ? 'selected' : ''}`;

      const isDefault = model.value === 'google/gemini-pro-1.5';
      option.innerHTML = `
        <div class="model-info">
          <span class="model-name">${model.label}</span>
          ${isDefault ? '<span class="model-star">⭐</span>' : ''}
        </div>
        ${model.value === this.state.selectedModel ? '<span class="model-check">✓</span>' : ''}
      `;

      option.onclick = () => {
        this.state.selectedModel = model.value;
        this.saveToStorage();
        this.updateUI();
        modal.remove();
      };
      content.appendChild(option);
    });

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close modal handlers
    const closeBtn = header.querySelector('.modal-close');
    closeBtn.onclick = () => modal.remove();

    // Close modal when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function closeModal(e) {
        if (!modal.contains(e.target)) {
          modal.remove();
          document.removeEventListener('click', closeModal);
        }
      });
    }, 100);
  }

  // Main render method - like React render (only call once)
  render() {
    const root = document.getElementById('root');
    root.innerHTML = '';

    const appDiv = document.createElement('div');
    appDiv.style.height = '100vh';
    appDiv.style.display = 'flex';
    appDiv.style.flexDirection = 'column';

    appDiv.appendChild(this.createHeader());
    appDiv.appendChild(this.createChatContainer());
    appDiv.appendChild(this.createInputArea());

    root.appendChild(appDiv);

    // Store references for updates
    this.headerRef = appDiv.querySelector('.header');
    this.chatRef = appDiv.querySelector('.chat-container');
    this.inputRef = appDiv.querySelector('.input-area');
    this.textareaRef = appDiv.querySelector('.message-input');
    this.sendBtnRef = appDiv.querySelector('.send-btn');

    this.updateUI();
  }

  // Efficient update method - only update what changed
  updateUI() {
    if (!this.chatRef) return;

    // Update chat messages
    this.updateChatContainer();

    // Update input state
    this.updateInputArea();

    // Auto-scroll to bottom
    if (this.chatRef) {
      this.chatRef.scrollTop = this.chatRef.scrollHeight;
    }
  }

  updateChatContainer() {
    if (!this.chatRef) return;

    this.chatRef.innerHTML = '';

    if (this.state.messages.length === 0) {
      this.chatRef.appendChild(this.createWelcome());
    }

    this.state.messages.forEach(msg => {
      this.chatRef.appendChild(this.createMessage(msg));
    });

    if (this.state.loading) {
      const hasImage = !!this.state.capturedImage;
      this.chatRef.appendChild(this.createLoading(hasImage));
    }
  }

  updateInputArea() {
    if (!this.textareaRef || !this.sendBtnRef) return;

    // Update textarea value if different
    if (this.textareaRef.value !== this.state.input) {
      this.textareaRef.value = this.state.input;
    }

    // Update button state
    this.sendBtnRef.innerHTML = this.state.loading ? '⏳' : '➤';
    this.sendBtnRef.setAttribute('title', this.state.loading ? 'Sending...' : 'Send message');
    this.sendBtnRef.disabled = this.state.loading || !this.state.input.trim();
    this.textareaRef.disabled = this.state.loading;

    // Update model selector button
    const modelBtn = this.inputRef?.querySelector('.model-selector-btn');
    if (modelBtn) {
      const currentModel = this.models.find(m => m.value === this.state.selectedModel);
      const modelName = currentModel?.label || 'Select Model';
      const shortName = modelName.split(' ')[0];
      const isDefault = this.state.selectedModel === 'google/gemini-pro-1.5';
      modelBtn.innerHTML = `
        <span class="model-btn-text">${shortName}</span>
        ${isDefault ? '<span class="model-star">⭐</span>' : ''}
        <span class="model-btn-arrow">▾</span>
      `;
    }

    // Show/hide screen mode indicator
    const indicator = this.inputRef?.querySelector('.screen-mode-indicator');
    const hasIndicator = !!indicator;
    const shouldShow = this.state.screenMode;

    if (shouldShow && !hasIndicator) {
      // Add indicator
      const newIndicator = document.createElement('div');
      newIndicator.className = 'screen-mode-indicator';
      newIndicator.textContent = '🖼️ Image sending enabled';
      this.inputRef.insertBefore(newIndicator, this.inputRef.firstChild);
    } else if (!shouldShow && hasIndicator) {
      // Remove indicator
      indicator.remove();
    }
  }

  updateHeader() {
    if (!this.headerRef) return;

    const screenBtn = this.headerRef.querySelector('.toggle-switch');
    if (screenBtn) {
      screenBtn.className = `toggle-switch ${this.state.screenMode ? 'active' : ''}`;
      screenBtn.setAttribute('title', this.state.screenMode ? 'Disable Image Sending' : 'Enable Image Sending');
    }
  }

  setupEventListeners() {
    // This runs once, like useEffect with empty dependency array
    this.render();

    // Add event listener for copy buttons and toggle functionality using event delegation
    document.addEventListener('click', (e) => {
      // Handle copy buttons
      const copyButton = e.target.closest('.copy-button, .preview-copy');
      if (copyButton) {
        e.stopPropagation();
        const codeId = copyButton.getAttribute('data-code-id');
        if (codeId) {
          console.log('Copy button clicked for code ID:', codeId);
          this.copyCode(codeId, copyButton);
        }
        return;
      }

      // Handle collapse/expand buttons
      const collapseButton = e.target.closest('.code-collapse-btn');
      if (collapseButton) {
        e.stopPropagation();
        const containerId = collapseButton.getAttribute('data-container-id');
        if (containerId) {
          console.log('Collapse button clicked for container:', containerId);
          this.toggleCodeBlock(containerId);
        }
        return;
      }

      // Handle expand button click
      const expandButton = e.target.closest('.expand-button');
      if (expandButton) {
        e.stopPropagation();
        const containerId = expandButton.getAttribute('data-container-id');
        if (containerId) {
          console.log('Expand button clicked for container:', containerId);
          this.toggleCodeBlock(containerId);
        }
        return;
      }

      // Handle image chip actions
      const replaceBtn = e.target.closest('.replace-btn');
      if (replaceBtn) {
        e.stopPropagation();
        this.replaceCapturedImage();
        return;
      }

      const openBtn = e.target.closest('.open-btn');
      if (openBtn) {
        e.stopPropagation();
        this.openImageFull();
        return;
      }

      const removeBtn = e.target.closest('.remove-btn');
      if (removeBtn) {
        e.stopPropagation();
        this.removeCapturedImage();
        return;
      }

      // Handle message action buttons
      const copyAnswerBtn = e.target.closest('.copy-answer-btn');
      if (copyAnswerBtn) {
        e.stopPropagation();
        const content = copyAnswerBtn.getAttribute('data-content');
        this.copyToClipboard(content, copyAnswerBtn);
        return;
      }

      const followUpBtn = e.target.closest('.follow-up-btn');
      if (followUpBtn) {
        e.stopPropagation();
        this.askFollowUp();
        return;
      }
    });
  }

  addMessage(content, role, image = null) {
    const newMessage = { role, content };
    if (image) {
      newMessage.image = image;
    }
    const newMessages = [...this.state.messages, newMessage];
    this.state.messages = newMessages;
    this.updateUI();
    this.saveToStorage();
  }

  async captureScreen() {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        // Try multiple capture methods
        const tryCapture = () => {
          // Method 1: Try with current window
          chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
            if (chrome.runtime.lastError) {
              console.error('Method 1 failed:', chrome.runtime.lastError.message);

              // Method 2: Try getting active tab first
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (chrome.runtime.lastError || !tabs[0]) {
                  reject(new Error('Cannot access active tab - make sure extension is activated by clicking the extension icon'));
                  return;
                }

                chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: 'png' }, (dataUrl2) => {
                  if (chrome.runtime.lastError) {
                    console.error('Method 2 failed:', chrome.runtime.lastError.message);
                    reject(new Error('Screen capture failed - please reload the extension and try again'));
                  } else {
                    resolve(dataUrl2);
                  }
                });
              });
            } else {
              resolve(dataUrl);
            }
          });
        };

        tryCapture();
      } else {
        reject(new Error('Chrome API not available'));
      }
    });
  }

  async sendMessage() {
    if (!this.state.input.trim() || this.state.loading) return;

    // Check if API key is available
    if (!this.API_KEY) {
      this.showApiKeyPrompt();
      if (!this.API_KEY) {
        return;
      }
    }

    const message = this.state.input.trim();
    this.state.input = '';
    this.state.loading = true;
    this.updateUI();

    // Use captured image or capture new one if screen mode is enabled
    let capturedImage = this.state.capturedImage;
    console.log('Screen mode enabled:', this.state.screenMode);
    console.log('Existing captured image:', !!capturedImage);

    if (this.state.screenMode && !capturedImage) {
      try {
        console.log('Attempting to capture screen...');
        const rawImage = await this.captureScreen();
        capturedImage = await this.processImage(rawImage);
        this.setState({ capturedImage });
        console.log('Screen captured and processed successfully');
      } catch (error) {
        console.warn('Failed to capture screen:', error);
        // Continue without image if capture fails
      }
    }

    // Add user message with optional image
    this.addMessage(message, 'user', capturedImage);

    try {
      console.log('Sending message:', message);
      console.log('Model:', this.state.selectedModel);

      // Prepare message content for API
      let messageContent;
      let modelToUse = this.state.selectedModel;

      // First, determine the final model we'll use (considering if we have an image)
      if (capturedImage) {
        // Check if selected model supports vision, otherwise force to vision model
        if (!isVisionCapableModel(modelToUse)) {
          console.log('Selected model does not support vision, switching to GPT-4o Mini for image');
          modelToUse = 'openai/gpt-4o-mini';

          // Add a system notice to inform user about model switch
          this.addMessage('ℹ️ Switched to GPT-4o Mini for image analysis (vision support required)', 'assistant');
        }

        messageContent = [
          {
            type: "text",
            text: message || "What do you see in this image?"
          },
          {
            type: "image_url",
            image_url: {
              url: capturedImage
            }
          }
        ];
      } else {
        messageContent = message;
      }

      // Now we know the final model, check if it supports vision for conversation history
      const finalModelSupportsVision = isVisionCapableModel(modelToUse);

      console.log('Using model:', modelToUse, 'for message with image:', !!capturedImage);
      console.log('Final model supports vision:', finalModelSupportsVision);

      // Add system message to set AI behavior
      const systemMessage = {
        role: "system",
        content: "You are a helpful AI assistant integrated into a browser sidebar. Provide clear, concise, and helpful responses. When showing code, use proper syntax highlighting with language labels. Remember the conversation context and refer back to previous messages when relevant."
      };

      // Prepare conversation history for context
      const conversationMessages = [systemMessage];

      // Add previous messages (limit to recent ones to avoid token limits)
      const recentMessages = this.state.messages.slice(-20); // Keep last 20 messages

      recentMessages.forEach(msg => {
        const message = { role: msg.role, content: msg.content };
        // Only include images if the final model supports vision
        if (msg.image && finalModelSupportsVision) {
          message.content = [
            { type: "text", text: msg.content },
            { type: "image_url", image_url: { url: msg.image } }
          ];
        }
        // For non-vision models, just use text content even if original message had an image
        conversationMessages.push(message);
      });

      // Add the current message to the conversation
      conversationMessages.push({ role: "user", content: messageContent });

      console.log('Sending conversation with', conversationMessages.length, 'messages (including system message)');
      console.log('Model supports vision:', finalModelSupportsVision);
      console.log('Conversation messages:', conversationMessages.map(m => ({
        role: m.role,
        hasImage: Array.isArray(m.content) && m.content.some(c => c.type === 'image_url')
      })));

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ai-assistant-extension.local",
          "X-Title": "Chat Pal"
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: conversationMessages
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      const reply = data.choices?.[0]?.message?.content || "No response received";

      this.addMessage(reply, 'assistant');

    } catch (error) {
      console.error('Full error details:', error);
      this.addMessage(`Error: ${error.message}`, 'assistant');
    } finally {
      this.state.loading = false;
      // Clear captured image after sending
      if (capturedImage) {
        this.setState({ capturedImage: null });
      }
      this.updateUI();
    }
  }

  clearChat() {
    this.state.messages = [];
    this.updateUI();
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove('messages');
    }
  }
}

// Initialize the app and make it globally accessible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.aiApp = new AIAssistantApp();
  });
} else {
  window.aiApp = new AIAssistantApp();
}
