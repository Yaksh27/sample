'use client'

import { useState, useRef, KeyboardEvent } from 'react'

interface MessageInputProps {
  onSendMessage: (content: string, isImageRequest?: boolean) => void
  isLoading: boolean
}

export default function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isImageMode, setIsImageMode] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim(), isImageMode)
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }

  return (
    <div className="input-area">
      <form onSubmit={handleSubmit}>
        <div className="d-flex align-items-end gap-2">
          {/* Image Mode Toggle */}
          <button
            type="button"
            className={`image-toggle ${isImageMode ? 'active' : ''}`}
            onClick={() => setIsImageMode(!isImageMode)}
            title={isImageMode ? 'Switch to text mode' : 'Switch to image generation mode'}
          >
            {isImageMode ? '🎨' : '💬'}
          </button>

          {/* Message Input */}
          <div className="flex-fill">
            <textarea
              ref={textareaRef}
              className="message-input"
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isImageMode 
                  ? "Describe the image you want to generate..." 
                  : "Type your message..."
              }
              disabled={isLoading}
              rows={1}
              style={{
                resize: 'none',
                overflow: 'hidden'
              }}
            />
            
            {isImageMode && (
              <div className="mt-1">
                <small className="text-muted">
                  🎨 Image generation mode - Describe what you want to create
                </small>
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            className="send-btn"
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              '→'
            )}
          </button>
        </div>

        {/* Mobile-friendly bottom spacing */}
        <div className="d-md-none" style={{ height: '20px' }}></div>
      </form>
    </div>
  )
}