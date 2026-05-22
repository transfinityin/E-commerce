import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import api from '../services/api'

export default function SocialAuth({ mode = 'login', className = '' }) {
  const navigate = useNavigate()
  const { googleLogin } = useAuthStore()
  const googleBtnRef = useRef(null)

  // ── Google Identity Services Button ─────────────────────────
  useEffect(() => {
    const renderGoogle = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        })
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: mode === 'login' ? 'signin_with' : 'signup_with',
        })
      }
    }

    if (window.google) {
      renderGoogle()
    } else {
      window.addEventListener('load', renderGoogle)
      return () => window.removeEventListener('load', renderGoogle)
    }
  }, [mode])

  const handleGoogleResponse = async (response) => {
    try {
      const result = await googleLogin(response.credential)
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Google login failed. Please try again.')
    }
  }

  // ── Facebook SDK ────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById('facebook-jssdk')) return

    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    window.fbAsyncInit = () => {
      FB.init({
        appId: import.meta.env.VITE_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0',
      })
    }
  }, [])

  const handleFacebook = () => {
    if (!window.FB) {
      toast.error('Facebook SDK not loaded yet. Please wait.')
      return
    }

    FB.login(
      (response) => {
        if (response.authResponse) {
          api
            .post('/auth/facebook/', {
              access_token: response.authResponse.accessToken,
            })
            .then((res) => {
              const data = res.data
              localStorage.setItem('access_token', data.access)
              localStorage.setItem('refresh_token', data.refresh)
              useAuthStore.setState({
                user: data.user,
                access_token: data.access,
                refresh_token: data.refresh,
                isAuthenticated: true,
              })
              toast.success('Welcome!')
              navigate('/')
            })
            .catch(() => {
              toast.error('Facebook login failed.')
            })
        } else {
          toast.error('Facebook login cancelled.')
        }
      },
      { scope: 'email,public_profile' }
    )
  }

  // ── Twitter OAuth 2.0 Popup ─────────────────────────────────
  const handleTwitter = async () => {
    try {
      const { data } = await api.get('/auth/twitter/url/')
      const popup = window.open(
        data.auth_url,
        'twitter-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        toast.error('Popup blocked! Please allow popups for this site.')
        return
      }

      const listener = (event) => {
        if (event.origin !== window.location.origin) return

        if (event.data?.type === 'TWITTER_AUTH_SUCCESS') {
          const payload = event.data.payload
          localStorage.setItem('access_token', payload.access)
          localStorage.setItem('refresh_token', payload.refresh)
          useAuthStore.setState({
            user: payload.user,
            access_token: payload.access,
            refresh_token: payload.refresh,
            isAuthenticated: true,
          })
          toast.success('Welcome!')
          navigate('/')
          window.removeEventListener('message', listener)
        }
      }

      window.addEventListener('message', listener)

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', listener)
        }
      }, 1000)
    } catch {
      toast.error('Failed to start Twitter login.')
    }
  }

  return (
    <div className={`flex flex-col gap-2.5 sm:gap-3 ${className}`}>
      {/* Divider */}
      <div className="flex items-center gap-2 sm:gap-3 my-1">
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-[10px] sm:text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">or continue with</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      {/* Google Button Container */}
      <div ref={googleBtnRef} className="w-full flex justify-center min-h-[40px] sm:min-h-[44px]" />

      {/* Facebook */}
      <button
        type="button"
        onClick={handleFacebook}
        className="w-full h-11 sm:h-12 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 sm:gap-2.5 transition-all duration-300 hover:-translate-y-px hover:shadow-md active:translate-y-0 cursor-pointer border-none"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span className="hidden sm:inline">{mode === 'login' ? 'Sign in with Facebook' : 'Sign up with Facebook'}</span>
        <span className="sm:hidden">Facebook</span>
      </button>

      {/* Twitter / X */}
      <button
        type="button"
        onClick={handleTwitter}
        className="w-full h-11 sm:h-12 rounded-xl bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 sm:gap-2.5 transition-all duration-300 hover:-translate-y-px hover:shadow-md active:translate-y-0 cursor-pointer border-none"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span className="hidden sm:inline">{mode === 'login' ? 'Sign in with X' : 'Sign up with X'}</span>
        <span className="sm:hidden">X (Twitter)</span>
      </button>
    </div>
  )
}