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

// Hand off from the HTML shell to React once the tree is mounted
requestAnimationFrame(() => {
  const shell = document.getElementById('tf-shell')
  if (!shell) return
  shell.classList.add('tf-shell-out')
  window.setTimeout(() => shell.remove(), 480)
})
