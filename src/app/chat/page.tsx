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
  const [currentConversationId, setCurrentConversationId] = useState<string>('1') // Start with default
  const [isImageMode, setIsImageMode] = useState(false)

  // tRPC queries with debugging
  const { data: conversations, refetch: refetchConversations } = trpc.chat.getConversations.useQuery(undefined, {
    onSuccess: (data) => console.log('Conversations loaded:', data),
    onError: (error) => console.error('Conversations error:', error)
  })
  
  const { data: messages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: currentConversationId },
    { 
      enabled: !!currentConversationId,
      onSuccess: (data) => console.log('Messages loaded:', data),
      onError: (error) => console.error('Messages error:', error)
    }
  )
  
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      console.log('Message sent successfully:', data)
      refetchMessages()
      refetchConversations()
    },
    onError: (error) => console.error('Send message error:', error)
  })
  
  const createConversation = trpc.chat.createConversation.useMutation({
  onSuccess: (newConversation) => {
    console.log('Conversation created successfully:', newConversation)
    setCurrentConversationId(newConversation.id)
    // Refetch conversations to update the sidebar
    refetchConversations()
    setSidebarOpen(false)
  },
  onError: (error) => {
    console.error('Create conversation error:', error)
  }
})

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault()
  console.log(`Sending ${isImageMode ? 'IMAGE' : 'TEXT'} message:`, message, 'to conversation:', currentConversationId)
  
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
      console.error('Error sending message:', error)
    }
  }
}

  const handleCreateConversation = async () => {
    console.log('Creating new conversation...')
    try {
      await createConversation.mutateAsync({
        title: 'New Chat'
      })
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  console.log('Current state:', {
    conversations,
    messages,
    currentConversationId,
    sendMessageLoading: sendMessage.isLoading,
    createConversationLoading: createConversation.isLoading
  })

  return (
    <div className="vh-100 d-flex">
      {/* Mobile Menu Button */}
      <button
        className="btn btn-primary d-md-none position-fixed top-0 start-0 m-3"
        style={{ zIndex: 1060 }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div 
        className={`bg-dark text-white d-flex flex-column ${
          sidebarOpen ? 'd-block' : 'd-none d-md-flex'
        }`}
        style={{ 
          width: '320px',
          height: '100vh',
          position: 'relative',
          zIndex: sidebarOpen ? 1050 : 'auto',
        }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-bottom border-secondary">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0 fw-bold">Conversations</h4>
            <button 
              className="btn btn-primary btn-sm px-3"
              onClick={handleCreateConversation}
              disabled={createConversation.isLoading}
            >
              {createConversation.isLoading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                '+ New'
              )}
            </button>
          </div>
        </div>
        
      {/* Conversations List */}
    <div className="flex-grow-1 p-4 overflow-auto">
      <div className="mb-3">
        <small>Debug: {conversations?.length || 0} conversations loaded</small>
      </div>
      
      {conversations && conversations.length > 0 ? (
        <div>
          {conversations.map((conv: any) => (
            <div
              key={conv.id}
              className={`p-3 mb-2 rounded ${
                currentConversationId === conv.id 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary text-white'
              }`}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                console.log('Selecting conversation:', conv.id)
                setCurrentConversationId(conv.id)
                setSidebarOpen(false) // Close mobile sidebar
              }}
            >
              <div className="fw-bold">{conv.title}</div>
              <div className="small">
                {new Date(conv.created_at).toLocaleDateString()} {new Date(conv.created_at).toLocaleTimeString()}
              </div>
              <div className="very-small text-muted">ID: {conv.id}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted py-5">
          <p className="mb-2">No conversations yet</p>
          <p className="small">Click "+ New" to start chatting!</p>
        </div>
      )}
    </div>
        {/* User Info & Logout */}
        <div className="p-4 border-top border-secondary">
          <div className="d-flex align-items-center mb-3">
            {user.picture && (
              <img
                src={user.picture}
                alt="Profile"
                className="rounded-circle me-3"
                style={{ width: '48px', height: '48px' }}
              />
            )}
            <div className="flex-grow-1">
              <div className="fw-bold">{user.name}</div>
              <div className="text-muted small">{user.email}</div>
            </div>
          </div>
          <a 
            href="/api/auth/logout" 
            className="btn btn-outline-light w-100"
          >
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
      <div className="flex-grow-1 d-flex flex-column bg-white">


        {/* Messages Area */}
        
    {/* Messages Area */}
<div className="flex-grow-1 bg-light overflow-auto p-4">
  <div className="mb-3 d-flex justify-content-between">
    <div>
      <strong>Debug Info:</strong>
      <br />Current Conversation: {currentConversationId}
      <br />Messages Count: {messages?.length || 0}
      <br />Conversations Count: {conversations?.length || 0}
    </div>
    <button 
      className="btn btn-sm btn-secondary"
      onClick={() => {
        console.log('Manual refresh...')
        refetchMessages()
        refetchConversations()
      }}
    >
      🔄 Refresh
    </button>
  </div>
  
  {/* Rest of your messages display... */}
            {/* Force show messages if they exist */}

              {messages && messages.length > 0 ? (
          <div>
            <h5>Messages:</h5>
           {messages.map((msg: any) => (
  <div
    key={msg.id}
    className={`mb-3 p-3 rounded border ${
      msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border-secondary'
    }`}
  >
    <div className="fw-bold mb-1">
      {msg.role === 'user' ? 'You' : 'Assistant'}
    </div>
    <div>{msg.content}</div>
    {msg.image_url && (
      <div className="mt-3">
        <img
          src={msg.image_url}
          alt="Generated content"
          className="img-fluid rounded"
          style={{ maxWidth: '300px' }}
        />
      </div>
    )}
    <small className="text-muted d-block mt-1">
      {new Date(msg.created_at).toLocaleTimeString()}
    </small>
  </div>

            ))}
          </div>
        ) : (
          <div className="text-center text-muted">
            <h4>No messages yet</h4>
            <p>Send a message to start chatting!</p>
            <p><small>Debug: messages = {JSON.stringify(messages)}</small></p>
          </div>
        )}
      </div>

        {/* Input Area */}
<div className="bg-white border-top p-4">
  <form onSubmit={handleSendMessage}>
    <div className="mb-2">
      <div className="btn-group" role="group">
        <input
          type="radio"
          className="btn-check"
          name="messageType"
          id="textMode"
          checked={!isImageMode}
          onChange={() => setIsImageMode(false)}
        />
        <label className="btn btn-outline-primary" htmlFor="textMode">
          💬 Text
        </label>

        <input
          type="radio"
          className="btn-check"
          name="messageType"
          id="imageMode"
          checked={isImageMode}
          onChange={() => setIsImageMode(true)}
        />
        <label className="btn btn-outline-primary" htmlFor="imageMode">
          🎨 Image
        </label>
      </div>
    </div>
    
    <div className="input-group input-group-lg">
      <input
        type="text"
        className="form-control"
        placeholder={
          isImageMode 
            ? "Describe the image you want to generate..." 
            : "Type your message here..."
        }
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={sendMessage.isLoading}
      />
      <button
        type="submit"
        className="btn btn-primary px-4"
        disabled={!message.trim() || sendMessage.isLoading}
      >
        {sendMessage.isLoading ? (
          <span className="spinner-border spinner-border-sm me-2"></span>
        ) : null}
        {isImageMode ? '🎨 Generate' : 'Send'}
      </button>
    </div>
    
    {isImageMode && (
      <div className="mt-2">
        <small className="text-muted">
          🎨 Image mode: Describe what you want to create and I'll generate it for you!
        </small>
      </div>
    )}
  </form>
</div>
      </div>
    </div>
  )
}