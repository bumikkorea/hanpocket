/**
 * Toast 알림 시스템
 * 사용법: const { showToast } = useToast()
 *         showToast({ type: 'success', message: '예약 완료!' })
 */
import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, CalendarCheck, X } from 'lucide-react'

const ToastContext = createContext(null)

const TOAST_CONFIG = {
  success: { bg: '#E8F5E9', text: '#1B5E20', Icon: CheckCircle,    iconColor: '#34C759' },
  error:   { bg: '#FFF0F0', text: '#B71C1C', Icon: XCircle,        iconColor: '#FF3B30' },
  warning: { bg: '#FFF8E1', text: '#E65100', Icon: AlertTriangle,   iconColor: '#FF9500' },
  info:    { bg: '#E3F2FD', text: '#0D47A1', Icon: Info,            iconColor: '#007AFF' },
  booking: { bg: '#EBF3FE', text: '#1B6AE0', Icon: CalendarCheck,   iconColor: '#3182F6', border: '1px solid rgba(49,130,246,0.2)' },
}

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback(({ type = 'info', message, duration = 3000 }) => {
    const id = ++idCounter
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast 컨테이너 */}
      <div style={{ position: 'fixed', top: 60, left: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(toast => {
          const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info
          const { Icon } = cfg
          return (
            <div
              key={toast.id}
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-card)',
                background: cfg.bg,
                border: cfg.border || 'none',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                animation: 'toastIn 0.3s ease',
                pointerEvents: 'auto',
              }}
            >
              <Icon size={20} color={cfg.iconColor} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: cfg.text }}>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <X size={12} color={cfg.text} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) return { showToast: () => {} }
  return ctx
}
