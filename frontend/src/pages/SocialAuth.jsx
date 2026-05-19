import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
// import { ChromeIcon  } from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../services/api'
import { Globe } from 'lucide-react'
const GOOGLE_CLIENT_ID = '480332200123-si6e04vp1qhtged22jh4g7aof3m6s3jo.apps.googleusercontent.com'
const ChromeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c4.418 0 8.209 2.865 9.542 6.848H12a4.96 4.96 0 00-4.95 4.95c-.02.27.003.542.07.81L4.26 18.357A9.964 9.964 0 012 12C2 6.477 6.477 2 12 2zm4.95 6.95a4.96 4.96 0 014.95 4.95 4.96 4.96 0 01-4.95 4.95 4.96 4.96 0 01-4.95-4.95 4.96 4.96 0 014.95-4.95zM12 10a2 2 0 110 4 2 2 0 010-4z"/>
  </svg>
)
export default function SocialAuth({ mode }) {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      if (!window.google) return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      window.google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: mode === 'login' ? 'signin_with' : 'signup_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        }
      )
    }

    return () => {
      if (window.google) {
        window.google.accounts.id.cancel()
      }
    }
  }, [])

  const handleGoogleResponse = async (response) => {
    try {
      const { data } = await api.post('/auth/google/', {
        credential: response.credential,
      })

      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)

      updateUser(data.user)

      useAuthStore.setState({
        user: data.user,
        access_token: data.access,
        refresh_token: data.refresh,
        isAuthenticated: true,
      })

      toast.success(data.message || 'Signed in with Google!')
      navigate('/')

    } catch (err) {
      toast.error(err.response?.data?.error || 'Google sign-in failed')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Google button — auto-render */}
      <div id="google-btn" className="w-full" />

      {/* Fallback button if Google script fails */}
      
    </div>
  )
}