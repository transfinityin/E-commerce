import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'

const GOOGLE_CLIENT_ID = '77769131402-5rh4qfjsoeof8k18l5ko2ducdctj3nkj.apps.googleusercontent.com'

export default function SocialAuth({ mode }) {
  const navigate = useNavigate()
  const btnRef = useRef(null)

  const handleGoogleResponse = useCallback(async (response) => {
    console.log('🔥 Google credential received:', response.credential?.slice(0, 20) + '...')

    try {
      // Call store method
      const result = await useAuthStore.getState().googleLogin(response.credential)
      
      console.log('🔥 Store result:', result)
      
      // If result is undefined/null, something went wrong
      if (!result) {
        throw new Error('Store returned empty response')
      }

      toast.success(
        result.message || `Google ${mode === 'login' ? 'sign in' : 'sign up'} successful!`
      )
      
      navigate('/')

    } catch (err) {
      // 🔥 EXACT ERROR console la print aagum
      console.error('🔥 GOOGLE AUTH ERROR:', err)
      console.error('🔥 Error response:', err.response)
      console.error('🔥 Error message:', err.message)
      
      toast.error(err.response?.data?.error || err.message || 'Google authentication failed')
    }
  }, [mode, navigate])

  useEffect(() => {
    if (!document.getElementById('google-gis-script')) {
      const script = document.createElement('script')
      script.id = 'google-gis-script'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    const initGoogle = () => {
      if (!window.google?.accounts?.id || !btnRef.current) return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      btnRef.current.innerHTML = ''

      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'outline',
        size: 'large',
        width: btnRef.current.offsetWidth || 300,
        text: mode === 'login' ? 'signin_with' : 'signup_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      })
    }

    if (window.google?.accounts?.id) {
      initGoogle()
    } else {
      const script = document.getElementById('google-gis-script')
      const onLoad = () => initGoogle()
      script?.addEventListener('load', onLoad)
      return () => script?.removeEventListener('load', onLoad)
    }

    return () => {
      window.google?.accounts?.id?.cancel()
    }
  }, [mode, handleGoogleResponse])

  return (
    <div className="flex flex-col gap-3 w-full">
      <div ref={btnRef} className="w-full flex justify-center min-h-[44px]" />
    </div>
  )
}