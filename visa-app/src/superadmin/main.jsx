import React from 'react'
import ReactDOM from 'react-dom/client'
import SuperAdminApp from './SuperAdminApp'
import '../index.css'

const _superEl = document.getElementById('superadmin-root')
if (_superEl) {
  ReactDOM.createRoot(_superEl).render(
    <React.StrictMode>
      <SuperAdminApp />
    </React.StrictMode>,
  )
}
