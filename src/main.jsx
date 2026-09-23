import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { legacyOjRedirect } from './lib/ojNavigation'

// Replace the old URL so browser Back never lands on a redirect loop.
const redirect = legacyOjRedirect(window.location.search)
if (redirect) window.location.replace(redirect)
else createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
