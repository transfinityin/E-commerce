import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import api from '../services/api'

const GOOGLE_CLIENT_ID = '77769131402-5rh4qfjsoeof8k18l5ko2ducdctj3nkj.apps.googleusercontent.com'

export default function SocialAuth({ mode }) {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (document.getElementById('google-gis-script')) return

    const script = document.createElement('script')
    script.id = 'google-gis-script'
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

      const btnContainer = document.getElementById('google-btn')
      if (btnContainer) {
        window.google.accounts.id.renderButton(btnContainer, {
          theme: 'outline',
          size: 'large',
          width: 300,          // ✅ FIXED: pixel value, NOT '100%'
          text: mode === 'login' ? 'signin_with' : 'signup_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        })
      }
    }

    script.onerror = () => {
      toast.error('Failed to load Google Sign-In')
    }

    return () => {
      // Only cancel the prompt, don't remove script to avoid re-fetch issues
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel()
      }
    }
  }, [mode]) // ✅ Re-render if mode changes

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
    <div className="flex flex-col gap-3 w-full">
      {/* Container div takes full width; button inside is centered by Google */}
      <div id="google-btn" className="w-full flex justify-center" />
    </div>
  )
}