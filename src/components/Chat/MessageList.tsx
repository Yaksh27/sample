'use client'

import { useEffect, useRef } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  image_url: string | null
  created_at: string
}

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="messages-container">
      {messages.length === 0 && !isLoading && (
        <div className="text-center text-muted py-5">
          <h5>Start a conversation</h5>
          <p>Send a message to begin chatting with the AI assistant.</p>
          <div className="mt-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body text-start">
                    <h6 className="card-title">💬 Ask anything</h6>
                    <p className="card-text small">
                      Ask questions, get explanations, or have a conversation
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body text-start">
                    <h6 className="card-title">🎨 Generate images</h6>
                    <p className="card-text small">
                      Toggle image mode and describe what you want to create
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`message ${message.role}`}
        >
          <div className="d-flex">
            <div className="me-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: message.role === 'user' ? '#10a37f' : '#6c757d',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                {message.role === 'user' ? 'U' : 'AI'}
              </div>
            </div>
            
            <div className="flex-fill">
              <div className="d-flex align-items-center mb-2">
                <span className="fw-medium me-2">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </span>
                <span className="text-muted small">
                  {formatTime(message.created_at)}
                </span>
              </div>
              
              <div className="message-content">
                <p className="mb-2" style={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </p>
                
                {message.image_url && (
                  <div className="mt-3">
                    <img
                      src={message.image_url}
                      alt="Generated content"
                      className="generated-image"
                      style={{ maxWidth: '300px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="message assistant">
          <div className="d-flex">
            <div className="me-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                AI
              </div>
            </div>
            
            <div className="flex-fill">
              <div className="mb-2">
                <span className="fw-medium">Assistant</span>
              </div>
              
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}