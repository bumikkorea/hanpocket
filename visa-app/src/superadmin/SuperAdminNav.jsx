import { LogOut } from 'lucide-react'

export default function SuperAdminNav({ tabs, currentTab, onTabChange, user, onLogout }) {
  return (
    <>
      {/* ─── 데스크탑 사이드바 ─── */}
      <aside
        className="hidden md:flex w-52 flex-col flex-shrink-0 min-h-screen"
        style={{ backgroundColor: '#1A1A1A' }}
      >
        {/* 로고 */}
        <div className="px-5 py-5 border-b" style={{ borderColor: '#2A2A2A' }}>
          <h1 className="text-lg font-bold text-white tracking-tight">NEAR</h1>
          <p className="text-xs mt-0.5" style={{ color: '#555' }}>슈퍼관리자</p>
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="w-full flex items-center gap-3 py-2.5 rounded-lg transition-all text-left"
                style={isActive ? {
                  color: '#C4725A',
                  backgroundColor: 'rgba(196,114,90,0.1)',
                  borderLeft: '3px solid #C4725A',
                  paddingLeft: '9px',
                  paddingRight: '12px',
                } : {
                  color: '#777',
                  borderLeft: '3px solid transparent',
                  paddingLeft: '9px',
                  paddingRight: '12px',
                }}
              >
                <Icon size={17} />
                <span className="font-medium text-sm">{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-bold leading-none">{tab.badge}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* 구분선 */}
        <div className="mx-4 border-t" style={{ borderColor: '#2A2A2A' }} />

        {/* 유저 정보 */}
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-white truncate">{user.name}</p>
          <p className="text-xs truncate" style={{ color: '#555' }}>{user.email}</p>
        </div>

        {/* 로그아웃 */}
        <div className="px-3 pb-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-red-500/10 text-[#666] hover:text-red-400"
          >
            <LogOut size={17} />
            <span className="text-sm font-medium">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* ─── 모바일 하단 탭바 ─── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t safe-bottom"
        style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors"
              style={{ color: isActive ? '#C4725A' : '#555' }}
            >
              <div className="relative">
                <Icon size={20} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.5 bg-red-500 text-white rounded-full text-[8px] font-bold leading-none min-w-[14px] text-center">{tab.badge}</span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
