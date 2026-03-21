/**
 * Button System [9] — Liquid Glass Subtle
 * 모든 버튼 타입과 크기에 대한 재사용 가능한 컴포넌트
 */

export default function Button({
  children,
  type = 'primary', // primary | dark | alipay | wechat | taxi | outline | success | danger | glass
  size = 'md', // sm | md | lg
  icon: Icon = null,
  disabled = false,
  className = '',
  ...props
}) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'h-11 text-xs px-4 rounded-[11px]'
      case 'md':
        return 'h-13 text-base px-5 rounded-[var(--radius-btn)]'
      case 'lg':
        return 'h-13 text-base px-6 rounded-[var(--radius-btn)] w-full'
      default:
        return 'h-13 text-base px-5 rounded-[var(--radius-btn)]'
    }
  }

  const getTypeStyles = () => {
    const baseStyle = 'font-semibold transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group'
    const hoverStyle = 'hover:-translate-y-0.5'
    const activeStyle = 'active:scale-98'
    const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : ''

    const typeStyles = {
      primary: `${baseStyle} ${hoverStyle} ${activeStyle} text-white bg-gradient-to-b from-[color-mix(in_srgb,var(--primary)_110%,#fff)] to-[var(--primary)] shadow-[0_1px_1px_rgba(196,114,90,0.12),0_2px_3px_rgba(196,114,90,0.05)]`,
      dark: `${baseStyle} ${hoverStyle} ${activeStyle} text-white bg-gradient-to-b from-[#252525] to-[var(--text-primary)] shadow-[var(--shadow-card)]`,
      alipay: `${baseStyle} ${hoverStyle} ${activeStyle} text-white bg-gradient-to-b from-[#2080F0] to-[#1677FF] shadow-[0_1px_1px_rgba(22,119,255,0.12),0_2px_3px_rgba(22,119,255,0.05)]`,
      wechat: `${baseStyle} ${hoverStyle} ${activeStyle} text-white bg-gradient-to-b from-[#15CC65] to-[#07C160] shadow-[0_1px_1px_rgba(7,193,96,0.12),0_2px_3px_rgba(7,193,96,0.05)]`,
      taxi: `${baseStyle} ${hoverStyle} ${activeStyle} text-white bg-gradient-to-b from-[#FFA61A] to-[var(--warning)] shadow-[0_1px_1px_rgba(255,149,0,0.12),0_2px_3px_rgba(255,149,0,0.05)]`,
      outline: `${baseStyle} ${hoverStyle} ${activeStyle} text-[var(--text-secondary)] bg-[var(--bg)] border border-[var(--border)] shadow-[var(--shadow-card)]`,
      success: `${baseStyle} ${hoverStyle} ${activeStyle} text-white bg-gradient-to-b from-[#3DD06E] to-[var(--success)]`,
      danger: `${baseStyle} ${hoverStyle} ${activeStyle} text-[var(--price)] bg-[var(--primary-light)]`,
      glass: `${baseStyle} ${hoverStyle} ${activeStyle} text-white bg-[rgba(255,255,255,0.1)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.12)] shadow-[var(--shadow-card)]`
    }

    return `${typeStyles[type] || typeStyles.primary} ${disabledStyle}`
  }

  return (
    <button
      className={`${getSizeStyles()} ${getTypeStyles()} ${className}`}
      disabled={disabled}
      {...props}
    >
      {/* 상단 하이라이트 — ::after pseudo-element 대신 div 사용 */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* 아이콘과 텍스트 */}
      <div className="relative flex items-center justify-center gap-2">
        {Icon && <Icon size={18} />}
        <span>{children}</span>
      </div>
    </button>
  )
}
