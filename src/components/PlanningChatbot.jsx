import React, { useState, useRef, useEffect } from 'react';

// Suggested prompts requested in specification
const SUGGESTED_PROMPTS = [
  'Help me start DSA with Java',
  'Create a 30-day placement roadmap',
  'Explain a DSA concept',
  'Prepare me for technical interviews',
  'What should I study today?',
  'Help me prepare for Google placements'
];

const INITIAL_WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hey! 👋 I'm your Placement AI Mentor. Let's make your placement preparation more structured. I can help you with DSA, core CS subjects, aptitude, interview preparation, and personalized study roadmaps. What would you like to work on today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

// Formats markdown text into clean React nodes with code-block copy support
function FormattedMessage({ text }) {
  if (!text) return null;

  // Split text by triple-backtick code blocks
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'code',
      content: match[2].trimEnd()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }

  return (
    <div className="chatbot-message-content">
      {parts.map((part, pIdx) => {
        if (part.type === 'code') {
          return <CodeBlock key={pIdx} code={part.content} lang={part.lang} />;
        }
        return <TextParagraphs key={pIdx} content={part.content} />;
      })}
    </div>
  );
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        margin: '10px 0',
        borderRadius: '10px',
        background: '#07060f',
        border: '1px solid rgba(124, 110, 240, 0.25)',
        overflow: 'hidden',
        fontSize: '12px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 12px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          color: 'var(--muted)',
          fontSize: '11px',
          fontFamily: 'monospace'
        }}
      >
        <span style={{ textTransform: 'uppercase', color: 'var(--neon-cyan)', fontWeight: '700' }}>
          {lang}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: 'transparent',
            border: 'none',
            color: copied ? 'var(--mint)' : 'var(--muted)',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
      <pre
        style={{
          padding: '12px',
          margin: 0,
          overflowX: 'auto',
          color: '#d6deeb',
          fontFamily: 'Consolas, Monaco, "JetBrains Mono", monospace',
          lineHeight: '1.45',
          fontSize: '12px'
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextParagraphs({ content }) {
  const lines = content.split('\n');

  return (
    <div>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} style={{ height: '6px' }} />;
        }

        // Headings
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              style={{
                fontSize: '13.5px',
                fontWeight: '700',
                color: 'var(--neon-cyan)',
                margin: '10px 0 4px',
                textShadow: '0 0 8px rgba(0, 240, 255, 0.3)'
              }}
            >
              {renderInlineStyles(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          return (
            <h3
              key={idx}
              style={{
                fontSize: '14.5px',
                fontWeight: '700',
                color: '#fff',
                margin: '12px 0 6px',
                textShadow: '0 0 10px rgba(124, 110, 240, 0.4)'
              }}
            >
              {renderInlineStyles(trimmed.replace(/^#+\s*/, ''))}
            </h3>
          );
        }

        // Bullet lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '8px',
                margin: '3px 0',
                paddingLeft: '4px',
                lineHeight: '1.45'
              }}
            >
              <span style={{ color: 'var(--violet)', fontWeight: 'bold' }}>•</span>
              <span style={{ flex: 1 }}>{renderInlineStyles(trimmed.slice(2))}</span>
            </div>
          );
        }

        // Numbered lists
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '8px',
                margin: '3px 0',
                paddingLeft: '4px',
                lineHeight: '1.45'
              }}
            >
              <span
                style={{
                  color: 'var(--neon-cyan)',
                  fontWeight: '700',
                  fontSize: '11.5px',
                  minWidth: '18px'
                }}
              >
                {numMatch[1]}.
              </span>
              <span style={{ flex: 1 }}>{renderInlineStyles(numMatch[2])}</span>
            </div>
          );
        }

        // Regular paragraph line
        return (
          <p key={idx} style={{ margin: '3px 0', lineHeight: '1.45' }}>
            {renderInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
}

// Parses inline bold, inline code, and links
function renderInlineStyles(text) {
  const parts = [];
  // Tokenize `code`, **bold**, *italic*, [text](url)
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIdx = 0;
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          style={{
            background: 'rgba(0, 240, 255, 0.08)',
            color: 'var(--neon-cyan)',
            padding: '2px 5px',
            borderRadius: '4px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '11.5px',
            border: '1px solid rgba(0, 240, 255, 0.2)'
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} style={{ color: '#fff', fontWeight: '700' }}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} style={{ color: 'var(--ink)' }}>
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--neon-cyan)',
              textDecoration: 'underline',
              textUnderlineOffset: '2px'
            }}
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    } else {
      parts.push(token);
    }

    lastIdx = match.index + token.length;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts;
}

export default function PlanningChatbot({ session }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiMissingInfo, setApiMissingInfo] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send conversation history and session context to the backend endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content
          })),
          userContext: session ? { name: session.name } : null
        })
      });

      const data = await response.json();

      if (data.error === 'MISSING_API_KEY') {
        setApiMissingInfo(data.setupGuide || true);
        const setupMessage = {
          id: `setup_${Date.now()}`,
          role: 'assistant',
          isSetupNotice: true,
          setupGuide: data.setupGuide,
          content: data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, setupMessage]);
      } else if (data.error) {
        const errorMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          isError: true,
          content: `⚠️ ${data.message || 'Something went wrong while communicating with the AI mentor.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        setApiMissingInfo(null);
        const aiMessage = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'No response generated.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      const networkErrorMessage = {
        id: `net_err_${Date.now()}`,
        role: 'assistant',
        isError: true,
        content: `⚠️ Network error: Could not reach the AI Mentor service. Please ensure the local server is running. (${err.message})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, networkErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_WELCOME_MESSAGE]);
    setApiMissingInfo(null);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close Placement AI Mentor' : 'Open Placement AI Mentor'}
        aria-label="Toggle Placement AI Mentor Chatbot"
        style={{
          position: 'fixed',
          bottom: '26px',
          right: '26px',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c6ef0 0%, #00f0ff 100%)',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: isOpen
            ? '0 0 25px rgba(0, 240, 255, 0.6), 0 10px 30px rgba(0, 0, 0, 0.5)'
            : '0 0 20px rgba(124, 110, 240, 0.5), 0 8px 24px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isOpen ? 'rotate(90deg) scale(0.95)' : 'scale(1)'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isOpen ? (
          <span style={{ fontSize: '22px', fontWeight: '700', lineHeight: 1 }}>✕</span>
        ) : (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* AI Sparkle / Robot Icon */}
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            {/* Live Indicator Dot */}
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#34d399',
                border: '2px solid #06050a',
                boxShadow: '0 0 8px #34d399'
              }}
            />
          </div>
        )}
      </button>

      {/* Expandable Chat Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Placement AI Mentor Chat"
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '26px',
            width: '430px',
            maxWidth: 'calc(100vw - 36px)',
            height: '620px',
            maxHeight: 'calc(100vh - 120px)',
            background: 'rgba(10, 8, 20, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '22px',
            border: '1.5px solid rgba(124, 110, 240, 0.3)',
            boxShadow:
              '0 25px 70px rgba(0, 0, 0, 0.75), 0 0 35px rgba(124, 110, 240, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
            animation: 'chatSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(20, 16, 36, 0.85)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-magenta))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 14px rgba(0, 240, 255, 0.35)',
                  fontSize: '18px'
                }}
              >
                🤖
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#ffffff',
                    margin: 0,
                    letterSpacing: '-0.2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Placement AI Mentor
                  <span
                    style={{
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(124, 110, 240, 0.2)',
                      color: 'var(--neon-violet)',
                      border: '1px solid rgba(124, 110, 240, 0.3)',
                      fontWeight: '700'
                    }}
                  >
                    PLANNING
                  </span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: apiMissingInfo ? 'var(--yellow)' : 'var(--mint)',
                      boxShadow: apiMissingInfo ? '0 0 8px var(--yellow)' : '0 0 8px var(--mint)'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '500' }}>
                    {apiMissingInfo ? 'Setup Key Required' : 'Online • Ready to mentor'}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handleClearChat}
                title="Clear conversation"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--muted)',
                  borderRadius: '8px',
                  padding: '6px 9px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--coral)';
                  e.currentTarget.style.borderColor = 'rgba(255, 122, 107, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--muted)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <span>↺</span> Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--muted)',
                  borderRadius: '8px',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--muted)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Conversation Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '18px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {messages.map((m) => {
              const isUser = m.role === 'user';

              if (m.isSetupNotice) {
                return (
                  <div
                    key={m.id}
                    style={{
                      background: 'rgba(255, 198, 75, 0.06)',
                      border: '1px solid rgba(255, 198, 75, 0.25)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      color: 'var(--ink)'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        color: 'var(--yellow)',
                        fontWeight: '700',
                        fontSize: '13px'
                      }}
                    >
                      <span>⚡</span>
                      <span>Setup Required: Gemini API Key</span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--ink)', lineHeight: '1.45', marginBottom: '10px' }}>
                      {m.content}
                    </p>
                    <div
                      style={{
                        background: '#07060f',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontFamily: 'monospace',
                        color: 'var(--neon-cyan)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        marginBottom: '10px'
                      }}
                    >
                      # Create .env in placement-workspace/<br />
                      GEMINI_API_KEY=your_gemini_key_here
                    </div>
                    <a
                      href="https://aistudio.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--neon-cyan)',
                        fontSize: '12px',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}
                    >
                      Get free Gemini API key →
                    </a>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '88%',
                      padding: '12px 15px',
                      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isUser
                        ? 'linear-gradient(135deg, rgba(124, 110, 240, 0.85), rgba(101, 88, 211, 0.95))'
                        : 'rgba(22, 18, 38, 0.9)',
                      color: isUser ? '#ffffff' : 'var(--ink)',
                      border: isUser
                        ? '1px solid rgba(124, 110, 240, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isUser
                        ? '0 6px 18px rgba(124, 110, 240, 0.25)'
                        : '0 4px 16px rgba(0, 0, 0, 0.3)',
                      fontSize: '13px',
                      lineHeight: '1.45',
                      wordBreak: 'break-word'
                    }}
                  >
                    {isUser ? m.content : <FormattedMessage text={m.content} />}
                  </div>

                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--muted)',
                      marginTop: '4px',
                      padding: '0 4px'
                    }}
                  >
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Suggested Prompts (shown right below the initial welcome message) */}
            {messages.length === 1 && (
              <div style={{ marginTop: '6px', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    letterSpacing: '0.5px',
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  Suggested Topics &amp; Actions:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isLoading}
                      style={{
                        textAlign: 'left',
                        padding: '9px 13px',
                        borderRadius: '10px',
                        background: 'rgba(124, 110, 240, 0.08)',
                        border: '1px solid rgba(124, 110, 240, 0.22)',
                        color: 'var(--ink)',
                        fontSize: '12.5px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: 'inherit'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(124, 110, 240, 0.18)';
                        e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(124, 110, 240, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(124, 110, 240, 0.22)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <span>{prompt}</span>
                      <span style={{ color: 'var(--neon-cyan)', fontSize: '13px' }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isLoading && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  background: 'rgba(22, 18, 38, 0.9)',
                  border: '1px solid rgba(124, 110, 240, 0.25)',
                  width: 'fit-content'
                }}
              >
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span
                    className="chatbot-pulse-dot"
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--neon-cyan)',
                      display: 'inline-block',
                      animation: 'dotPulse 1.2s infinite ease-in-out'
                    }}
                  />
                  <span
                    className="chatbot-pulse-dot"
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--neon-magenta)',
                      display: 'inline-block',
                      animation: 'dotPulse 1.2s infinite ease-in-out 0.2s'
                    }}
                  />
                  <span
                    className="chatbot-pulse-dot"
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--neon-green)',
                      display: 'inline-block',
                      animation: 'dotPulse 1.2s infinite ease-in-out 0.4s'
                    }}
                  />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '500' }}>
                  Placement AI Mentor is thinking...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(15, 12, 28, 0.95)',
              borderTop: '1px solid rgba(255, 255, 255, 0.07)',
              flexShrink: 0
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#07060f',
                border: '1.5px solid rgba(124, 110, 240, 0.3)',
                borderRadius: '12px',
                padding: '4px 6px 4px 12px',
                transition: 'border-color 0.2s'
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about DSA, Java, roadmaps, interviews..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  padding: '6px 0'
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send message"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  background: inputMessage.trim() && !isLoading
                    ? 'linear-gradient(135deg, var(--violet), var(--neon-cyan))'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: inputMessage.trim() && !isLoading
                    ? '0 0 12px rgba(0, 240, 255, 0.4)'
                    : 'none',
                  opacity: inputMessage.trim() && !isLoading ? 1 : 0.4
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '6px',
                padding: '0 4px',
                fontSize: '10.5px',
                color: 'var(--muted)'
              }}
            >
              <span>Press Enter to send</span>
              <span>DSA • Core CS • Roadmaps • Interviews</span>
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS for animations */}
      <style>{`
        @keyframes chatSlideIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes dotPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </>
  );
}
