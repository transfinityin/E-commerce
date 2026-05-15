import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  // ← இதை add பண்ணுங்க
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" />
    </BrowserRouter>
  </StrictMode>,
)
