'use client'

import { useUser } from '@auth0/nextjs-auth0/client'

interface Conversation {
  id: string
  title: string | null
  created_at: string
  updated_at: string
}

interface SidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onNewChat: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  isCreatingConversation: boolean
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  isCreatingConversation
}: SidebarProps) {
  const { user } = useUser()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="h-100 d-flex flex-column p-3">
      {/* Header */}
      <div className="mb-3">
        <button
          className="new-chat-btn"
          onClick={onNewChat}
          disabled={isCreatingConversation}
        >
          {isCreatingConversation ? (
            <>
              <span className="spinner me-2"></span>
              Creating...
            </>
          ) : (
            '+ New Chat'
          )}
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-fill overflow-auto">
        <h6 className="text-muted small mb-3">Recent Conversations</h6>
        
        {conversations.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p className="small">No conversations yet</p>
            <p className="small">Start a new chat to get going!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${
                  currentConversationId === conversation.id ? 'active' : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-fill me-2">
                    <div className="fw-medium small mb-1">
                      {conversation.title || 'New Chat'}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {formatDate(conversation.updated_at)}
                    </div>
                  </div>
                  
                  <button
                    className="btn btn-sm btn-outline-danger"
                    style={{ 
                      fontSize: '0.7rem',
                      padding: '0.25rem 0.5rem',
                      opacity: 0.7
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConversation(conversation.id)
                    }}
                    title="Delete conversation"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="border-top pt-3 mt-3">
        <div className="d-flex align-items-center">
          {user?.picture && (
            <img
              src={user.picture}
              alt="Profile"
              className="rounded-circle me-2"
              style={{ width: '32px', height: '32px' }}
            />
          )}
          <div className="flex-fill">
            <div className="text-light small fw-medium">
              {user?.name || user?.email}
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              {user?.email}
            </div>
          </div>
        </div>
        
        <a
          href="/api/auth/logout"
          className="btn btn-outline-light btn-sm w-100 mt-2"
          style={{ fontSize: '0.8rem' }}
        >
          Sign Out
        </a>
      </div>
    </div>
  )
}