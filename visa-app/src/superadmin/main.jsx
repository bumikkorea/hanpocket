import React from 'react'
import ReactDOM from 'react-dom/client'
import SuperAdminApp from './SuperAdminApp'
import '../index.css'

// 전역 에러 캐처 — 콘솔 없이도 화면에 에러 표시
window.addEventListener('error', (e) => {
  const el = document.getElementById('superadmin-root')
  if (el && !el.childElementCount) {
    el.innerHTML = `<pre style="color:#f87171;background:#1a1a1a;padding:24px;margin:0;white-space:pre-wrap;font-size:13px">JS Error:\n${e.message}\n${e.filename}:${e.lineno}\n${e.error?.stack || ''}</pre>`
  }
})
window.addEventListener('unhandledrejection', (e) => {
  const el = document.getElementById('superadmin-root')
  if (el && !el.childElementCount) {
    el.innerHTML = `<pre style="color:#f87171;background:#1a1a1a;padding:24px;margin:0;white-space:pre-wrap;font-size:13px">Unhandled Promise:\n${e.reason}</pre>`
  }
})

const _superEl = document.getElementById('superadmin-root')
if (_superEl) {
  try {
    ReactDOM.createRoot(_superEl).render(
      <React.StrictMode>
        <SuperAdminApp />
      </React.StrictMode>,
    )
  } catch (e) {
    _superEl.innerHTML = `<pre style="color:#f87171;background:#1a1a1a;padding:24px;margin:0;white-space:pre-wrap;font-size:13px">createRoot Error:\n${e.message}\n${e.stack}</pre>`
  }
} else {
  document.body.innerHTML += `<pre style="color:#f87171;background:#1a1a1a;padding:24px;margin:0">superadmin-root element not found</pre>`
}
