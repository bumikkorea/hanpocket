import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import AdminApp from './AdminApp'

const _adminEl = document.getElementById('admin-root')
if (_adminEl) {
  createRoot(_adminEl).render(
    <StrictMode>
      <AdminApp />
    </StrictMode>
  )
}
