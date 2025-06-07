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
      <div className="d-flex justify-content-center align-items-center vh-100" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="text-center">
          <div className="spinner-border text-white" style={{width: '3rem', height: '3rem'}}></div>
          <p className="mt-3 text-white">Loading your AI assistant...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-vh-100 position-relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Inter, -apple-system, sans-serif'
      }}
    >
      {/* Background Pattern */}
      <div 
        className="position-absolute w-100 h-100"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
          zIndex: 1
        }}
      />
      
      {/* Main Content */}
      <div className="container-fluid px-4 py-5 position-relative" style={{zIndex: 2}}>
        <div className="row justify-content-center min-vh-100 align-items-center">
          <div className="col-12 col-lg-10 col-xl-8">
            
            {/* Hero Section */}
            <div className="text-center mb-5">
              <div className="mb-4">
                <div 
                  className="d-inline-flex align-items-center justify-content-center mb-4"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <i className="fas fa-robot text-white" style={{fontSize: '2rem'}}></i>
                </div>
              </div>
              
              <h1 className="display-3 display-md-2 fw-bold text-white mb-4 lh-1">
                ChatAI
                <span className="d-block fs-1 fw-normal text-white-50 mt-2">
                  Powered by Gemini
                </span>
              </h1>
              
              <p className="lead text-white fs-4 fs-md-3 mb-5 mx-auto" style={{maxWidth: '600px', opacity: 0.9}}>
                Experience the future of AI conversations with advanced text generation and stunning image creation
              </p>
            </div>

            {/* Auth Card */}
            <div className="row justify-content-center mb-5">
              <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                <div 
                  className="card border-0 shadow-lg"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px'
                  }}
                >
                  <div className="card-body p-4 p-md-5">
                    <div className="text-center mb-4">
                      <h5 className="card-title fw-semibold text-dark mb-2" style={{fontSize: '1.25rem'}}>
                        Get Started
                      </h5>
                      
                      {error ? (
                        <div className="alert alert-danger border-0 rounded-3" role="alert">
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            <h6 className="alert-heading mb-0">Authentication Error</h6>
                          </div>
                          <p className="mb-2 small">{error.message}</p>
                          <hr style={{opacity: 0.3}} />
                          <p className="mb-0 small text-muted">
                            Please check your configuration and try again
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted mb-0" style={{fontSize: '0.95rem'}}>
                          Sign in to start chatting with our AI assistant
                        </p>
                      )}
                    </div>
                    
                    <a 
                      href="/api/auth/login" 
                      className="btn btn-primary btn-lg w-100 shadow-sm mb-4"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '16px 32px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(59, 130, 246, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Sign In with Auth0
                    </a>
                    
                    <div className="text-center">
                      <small className="text-muted d-flex align-items-center justify-content-center">
                        <i className="fas fa-shield-alt me-2 text-success"></i>
                        Secure authentication powered by Auth0
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="row g-4 justify-content-center">
              <div className="col-12 col-md-6 col-lg-4">
                <div 
                  className="card border-0 h-100 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="card-body p-4 p-md-5">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center mb-4"
                      style={{
                        width: '60px',
                        height: '60px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '16px'
                      }}
                    >
                      <i className="fas fa-comments text-white" style={{fontSize: '1.5rem'}}></i>
                    </div>
                    <h6 className="card-title text-white fw-semibold mb-3">Natural Conversations</h6>
                    <p className="card-text text-white-50 small mb-0">
                      Engage in natural, context-aware conversations with advanced AI
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-12 col-md-6 col-lg-4">
                <div 
                  className="card border-0 h-100 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="card-body p-4 p-md-5">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center mb-4"
                      style={{
                        width: '60px',
                        height: '60px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '16px'
                      }}
                    >
                      <i className="fas fa-magic text-white" style={{fontSize: '1.5rem'}}></i>
                    </div>
                    <h6 className="card-title text-white fw-semibold mb-3">Image Generation</h6>
                    <p className="card-text text-white-50 small mb-0">
                      Create stunning images from text descriptions using AI
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-12 col-md-6 col-lg-4">
                <div 
                  className="card border-0 h-100 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="card-body p-4 p-md-5">
                    <div 
                      className="d-inline-flex align-items-center justify-content-center mb-4"
                      style={{
                        width: '60px',
                        height: '60px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '16px'
                      }}
                    >
                      <i className="fas fa-mobile-alt text-white" style={{fontSize: '1.5rem'}}></i>
                    </div>
                    <h6 className="card-title text-white fw-semibold mb-3">Mobile Optimized</h6>
                    <p className="card-text text-white-50 small mb-0">
                      Perfect experience on any device, anywhere you go
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-5 pt-4">
              <p className="text-white-50 small mb-0">
                <i className="fas fa-bolt me-2"></i>
                Powered by Google Gemini AI • Built with Next.js
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}