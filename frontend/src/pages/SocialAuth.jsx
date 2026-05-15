import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import api from '../services/api'

const GOOGLE_CLIENT_ID = '480332200123-si6e04vp1qhtged22jh4g7aof3m6s3jo.apps.googleusercontent.com'  // ← paste here

export default function SocialAuth({ mode }) {
  const navigate  = useNavigate()
  const { login } = useAuthStore()

  useEffect(() => {
    // Google script load panum
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      if (!window.google) return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback:  handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      window.google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        {
          theme:  'outline',
          size:   'large',
          width:  '100%',
          text:   mode === 'login' ? 'signin_with' : 'signup_with',
          shape:  'rectangular',
          logo_alignment: 'left',
        }
      )
    }

    return () => {
      // Cleanup
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

      // Save tokens — same as normal login
      localStorage.setItem('access_token',  data.access)
      localStorage.setItem('refresh_token', data.refresh)

      // Update store
      const authStore = useAuthStore.getState()
      authStore.updateUser(data.user)

      // Manually set store state
      useAuthStore.setState({
        user:            data.user,
        access_token:    data.access,
        refresh_token:   data.refresh,
        isAuthenticated: true,
      })

      toast.success(data.message || 'Signed in with Google!')
      navigate('/')

    } catch (err) {
      toast.error(err.response?.data?.error || 'Google sign-in failed')
    }
  }

  return (
    <div>
      {/* Google button — auto-render aagum */}
      <div id="google-btn" style={{ width: '100%' }} />
    </div>
  )
}