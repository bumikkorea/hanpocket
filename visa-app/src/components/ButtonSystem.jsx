/**
 * [9] Button System — Liquid Glass Subtle
 * 모든 버튼의 중앙 컴포넌트
 */

export default function Button({
  children,
  variant = 'primary', // primary | dark | outline | success | danger | glass | alipay | wechat | taxi
  size = 'md', // sm | md | lg
  icon: Icon = null,
  fullWidth = false,
  disabled = false,
  className = '',
  ...props
}) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'h-11 text-xs px-4 rounded-[11px]'
      case 'lg':
        return 'h-13 text-base px-6 rounded-[var(--radius-btn)]'
      default:
        return 'h-13 text-base px-5 rounded-[var(--radius-btn)]'
    }
  }

  const getVariantStyles = () => {
    const baseStyle = 'font-semibold transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group'
    const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : ''

    const variants = {
      primary: `${baseStyle} text-white bg-gradient-to-b from-[#CC7D66] to-[#C4725A] shadow-[0_1px_1px_rgba(196,114,90,0.12),0_2px_3px_rgba(196,114,90,0.05)] btn-hover-lift btn-active-press`,
      dark: `${baseStyle} text-white bg-gradient-to-b from-[#252525] to-[#1A1A1A] shadow-[0_1px_1px_rgba(0,0,0,0.08),0_2px_3px_rgba(0,0,0,0.04)] btn-hover-lift btn-active-press`,
      outline: `${baseStyle} text-[var(--text-secondary)] bg-white border-0.5 border-[#E0E0E0] shadow-[0_0px_1px_rgba(0,0,0,0.015)] btn-hover-lift btn-active-press`,
      success: `${baseStyle} text-white bg-gradient-to-b from-[#3DD06E] to-[#34C759] shadow-[0_1px_1px_rgba(52,199,89,0.12),0_2px_3px_rgba(52,199,89,0.05)] btn-hover-lift btn-active-press`,
      danger: `${baseStyle} text-[var(--price)] bg-[#FFF5F5] btn-hover-lift btn-active-press`,
      glass: `${baseStyle} text-white bg-[rgba(255,255,255,0.1)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.12)] shadow-[0_0px_2px_rgba(0,0,0,0.05)] btn-hover-lift btn-active-press`,
      alipay: `${baseStyle} text-white bg-gradient-to-b from-[#2080F0] to-[#1677FF] shadow-[0_1px_1px_rgba(22,119,255,0.12),0_2px_3px_rgba(22,119,255,0.05)] btn-hover-lift btn-active-press`,
      wechat: `${baseStyle} text-white bg-gradient-to-b from-[#15CC65] to-[#07C160] shadow-[0_1px_1px_rgba(7,193,96,0.12),0_2px_3px_rgba(7,193,96,0.05)] btn-hover-lift btn-active-press`,
      taxi: `${baseStyle} text-white bg-gradient-to-b from-[#FFA61A] to-[#FF9500] shadow-[0_1px_1px_rgba(255,149,0,0.12),0_2px_3px_rgba(255,149,0,0.05)] btn-hover-lift btn-active-press`,
    }

    return `${variants[variant] || variants.primary} ${disabledStyle}`
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      className={`${getSizeStyles()} ${getVariantStyles()} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {/* 상단 하이라이트 */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* 아이콘과 텍스트 */}
      <div className="relative flex items-center justify-center gap-2">
        {Icon && <Icon size={18} />}
        <span>{children}</span>
      </div>
    </button>
  )
}
