'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, error, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/chat')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border"></div>
      </div>
    )
  }

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3">
            Welcome to ChatGPT Clone
          </h1>
          <p className="lead text-muted mb-4">
            Experience AI-powered conversations with text and image generation
          </p>
        </div>

        <div className="card shadow-sm mx-auto" style={{ maxWidth: '400px' }}>
          <div className="card-body p-5">
            <h5 className="card-title mb-4">Get Started</h5>
            
            {error ? (
              <div className="alert alert-danger" role="alert">
                <h6 className="alert-heading">Authentication Error</h6>
                <p className="mb-2">{error.message}</p>
                <hr />
                <p className="mb-0 small">
                  Check your Auth0 configuration:
                  <br />• AUTH0_SECRET in .env.local
                  <br />• AUTH0_CLIENT_SECRET in .env.local  
                  <br />• Callback URLs in Auth0 dashboard
                </p>
              </div>
            ) : (
              <p className="card-text text-muted mb-4">
                Sign in to start chatting with our AI assistant
              </p>
            )}
            
            <a 
              href="/api/auth/login" 
              className="btn btn-primary btn-lg w-100 mb-3"
            >
              Sign In with Auth0
            </a>
            
            <div className="mt-4">
              <small className="text-muted">
                Powered by Google Gemini AI
              </small>
            </div>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-md-4 mb-3">
            <div className="card h-100 border-0 bg-transparent">
              <div className="card-body text-center">
                <div className="mb-3" style={{ fontSize: '3rem' }}>
                  💬
                </div>
                <h6 className="card-title">Natural Conversations</h6>
                <p className="card-text small text-muted">
                  Engage in natural, context-aware conversations
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-3">
            <div className="card h-100 border-0 bg-transparent">
              <div className="card-body text-center">
                <div className="mb-3" style={{ fontSize: '3rem' }}>
                  🎨
                </div>
                <h6 className="card-title">Image Generation</h6>
                <p className="card-text small text-muted">
                  Create images from text descriptions
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-3">
            <div className="card h-100 border-0 bg-transparent">
              <div className="card-body text-center">
                <div className="mb-3" style={{ fontSize: '3rem' }}>
                  📱
                </div>
                <h6 className="card-title">Mobile Optimized</h6>
                <p className="card-text small text-muted">
                  Perfect experience on any device
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}