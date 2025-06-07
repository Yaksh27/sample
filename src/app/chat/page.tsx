'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { trpc } from '../../lib/trpc/Provider'

// Define message type
type MessageRole = 'user' | 'assistant'

interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  image_url: string | null
  created_at: string
}

export default function ChatPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string>('1')
  const [isImageMode, setIsImageMode] = useState(false)

  // tRPC queries - clean, no debugging
  const { data: conversations, refetch: refetchConversations } = trpc.chat.getConversations.useQuery()
  
  const { data: messages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: currentConversationId },
    { enabled: !!currentConversationId }
  )
  
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      refetchMessages()
      refetchConversations()
    }
  })
  
  const createConversation = trpc.chat.createConversation.useMutation({
    onSuccess: (newConversation) => {
      setCurrentConversationId(newConversation.id)
      refetchConversations()
      setSidebarOpen(false)
    }
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (message.trim()) {
      try {
        await sendMessage.mutateAsync({
          conversationId: currentConversationId,
          content: message,
          isImageRequest: isImageMode
        })
        setMessage('')
        
        setTimeout(async () => {
          await refetchMessages()
        }, 500)
        
      } catch (error) {
        // Silent error handling - could add toast notifications later
      }
    }
  }

  const handleCreateConversation = async () => {
    try {
      await createConversation.mutateAsync({
        title: 'New Chat'
      })
    } catch (error) {
      // Silent error handling
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div>
          <p className="mt-3 text-muted">Loading your conversations...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="vh-100 d-flex" style={{fontFamily: 'Inter, -apple-system, sans-serif'}}>
      {/* Mobile Menu Button */}
      <button
        className="btn btn-light shadow-sm d-md-none position-fixed"
        style={{ 
          zIndex: 1060, 
          top: '1rem', 
          left: '1rem',
          borderRadius: '12px',
          border: 'none',
          width: '48px',
          height: '48px'
        }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Sidebar */}
      <div 
        className={`d-flex flex-column ${
          sidebarOpen ? 'd-block' : 'd-none d-md-flex'
        }`}
        style={{ 
          width: '320px',
          height: '100vh',
          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          zIndex: sidebarOpen ? 1050 : 'auto',
          borderRight: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Sidebar Header */}
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0 fw-bold text-white">ChatAI</h4>
            <button 
              className="btn btn-light shadow-sm"
              style={{borderRadius: '12px', padding: '8px 16px'}}
              onClick={handleCreateConversation}
              disabled={createConversation.isLoading}
            >
              {createConversation.isLoading ? (
                <span className="spinner-border spinner-border-sm me-1"></span>
              ) : (
                <i className="fas fa-plus me-1"></i>
              )}
              New
            </button>
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-grow-1 px-4 overflow-auto">
          {conversations && conversations.length > 0 ? (
            <div className="mb-4">
              {conversations.map((conv: any) => (
                <div
                  key={conv.id}
                  className={`p-3 mb-3 rounded-3 transition-all ${
                    currentConversationId === conv.id 
                      ? 'bg-white text-dark shadow-sm' 
                      : 'text-white-50 hover-bg-white-10'
                  }`}
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: currentConversationId === conv.id ? 'none' : '1px solid rgba(255,255,255,0.1)'
                  }}
                  onClick={() => {
                    setCurrentConversationId(conv.id)
                    setSidebarOpen(false)
                  }}
                  onMouseEnter={(e) => {
                    if (currentConversationId !== conv.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentConversationId !== conv.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <div className="fw-semibold mb-1" style={{fontSize: '0.95rem'}}>
                    {conv.title}
                  </div>
                  <div className="small opacity-75">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white-50 py-5">
              <i className="fas fa-comments fa-3x mb-3 opacity-50"></i>
              <p className="mb-2">No conversations yet</p>
              <p className="small">Start your first chat!</p>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-top border-white border-opacity-10">
          <div className="d-flex align-items-center mb-3">
            {user.picture && (
              <img
                src={user.picture}
                alt="Profile"
                className="rounded-circle me-3"
                style={{ width: '48px', height: '48px', border: '2px solid rgba(255,255,255,0.2)' }}
              />
            )}
            <div className="flex-grow-1">
              <div className="fw-semibold text-white" style={{fontSize: '0.95rem'}}>{user.name}</div>
              <div className="text-white-50 small">{user.email}</div>
            </div>
          </div>
          <a 
            href="/api/auth/logout" 
            className="btn btn-outline-light w-100 rounded-3"
            style={{borderColor: 'rgba(255,255,255,0.3)'}}
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            Sign Out
          </a>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="position-fixed w-100 h-100 d-md-none"
          style={{ 
            top: 0, 
            left: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 1040 
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-grow-1 d-flex flex-column" style={{backgroundColor: '#f8fafc'}}>
        {/* Messages Area */}
        <div className="flex-grow-1 overflow-auto p-4">
          {messages && messages.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              {messages.map((msg: any, index: number) => (
                <div
                  key={msg.id}
                  className={`mb-4 d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div
                    className={`p-4 rounded-4 shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-white border'
                    }`}
                    style={{
                      maxWidth: '70%',
                      minWidth: '200px',
                      borderRadius: msg.role === 'user' ? '24px 24px 8px 24px' : '24px 24px 24px 8px'
                    }}
                  >
                    <div className="mb-2" style={{lineHeight: '1.5', fontSize: '0.95rem'}}>
                      {msg.content}
                    </div>
                    {msg.image_url && (
                      <div className="mt-3">
                        <img
                          src={msg.image_url}
                          alt="Generated content"
                          className="img-fluid rounded-3 shadow-sm"
                          style={{ maxWidth: '100%' }}
                        />
                      </div>
                    )}
                    <small className={`d-block mt-2 ${msg.role === 'user' ? 'text-white-50' : 'text-muted'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </small>
                  </div>
                </div>
              ))}
              {sendMessage.isLoading && (
                <div className="mb-4 d-flex justify-content-start">
                  <div className="bg-white border p-4 rounded-4 shadow-sm" style={{borderRadius: '24px 24px 24px 8px'}}>
                    <div className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm text-primary me-3"></div>
                      <span className="text-muted">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div className="text-center">
                <i className="fas fa-robot fa-4x text-primary mb-4 opacity-50"></i>
                <h4 className="text-muted mb-2">Start a conversation</h4>
                <p className="text-muted">Ask me anything or generate an image!</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-top bg-white p-4" style={{borderTop: '1px solid #e2e8f0'}}>
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage}>
              <div className="mb-3">
                <div className="btn-group shadow-sm" role="group" style={{borderRadius: '12px', overflow: 'hidden'}}>
                  <input
                    type="radio"
                    className="btn-check"
                    name="messageType"
                    id="textMode"
                    checked={!isImageMode}
                    onChange={() => setIsImageMode(false)}
                  />
                  <label className="btn btn-outline-primary px-4" htmlFor="textMode" style={{border: 'none'}}>
                    <i className="fas fa-comment me-2"></i>Text
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="messageType"
                    id="imageMode"
                    checked={isImageMode}
                    onChange={() => setIsImageMode(true)}
                  />
                  <label className="btn btn-outline-primary px-4" htmlFor="imageMode" style={{border: 'none'}}>
                    <i className="fas fa-image me-2"></i>Image
                  </label>
                </div>
              </div>
              
              <div className="input-group shadow-sm" style={{borderRadius: '16px', overflow: 'hidden'}}>
                <input
                  type="text"
                  className="form-control border-0 py-3 px-4"
                  placeholder={
                    isImageMode 
                      ? "Describe the image you want to generate..." 
                      : "Type your message here..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sendMessage.isLoading}
                  style={{fontSize: '0.95rem', backgroundColor: '#f8fafc'}}
                />
                <button
                  type="submit"
                  className="btn btn-primary px-4 border-0"
                  disabled={!message.trim() || sendMessage.isLoading}
                  style={{backgroundColor: isImageMode ? '#8b5cf6' : '#3b82f6'}}
                >
                  {sendMessage.isLoading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className={`fas ${isImageMode ? 'fa-magic' : 'fa-paper-plane'} me-2`}></i>
                  )}
                  {isImageMode ? 'Generate' : 'Send'}
                </button>
              </div>
              
              {isImageMode && (
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    <i className="fas fa-sparkles me-1"></i>
                    Describe your vision and I'll bring it to life!
                  </small>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}