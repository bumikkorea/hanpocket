import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import App from './App.jsx'

const _rootEl = document.getElementById('root')
if (_rootEl) {
  createRoot(_rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
